/**
 * A live picture from Vurio's go2rtc, through Home Assistant.
 *
 * The transport is Vurio's own web player, kept the same so both behave the
 * same: MSE first, because it is the one that works on the most networks, and
 * WebRTC when MSE will not start. The one change is where the socket comes
 * from — a signed path to the integration's proxy, asked for each attempt,
 * because a signature expires and a reconnection an hour later needs a fresh one.
 */

const MSE_CODECS =
  "avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus";

export type LiveStatus = "live" | "failed" | "connecting";

declare global {
  interface Window {
    ManagedMediaSource?: typeof MediaSource;
  }
}

export class LiveStream {
  private connection: RTCPeerConnection | null = null;
  private socket: WebSocket | null = null;
  private source: MediaSource | null = null;
  private objectUrl: string | null = null;
  private closed = false;
  private starting = false;
  private attempts = 0;
  private retry: ReturnType<typeof setTimeout> | undefined;
  private cleanup: (() => void) | null = null;
  private pictured = false;
  transport = "connecting";

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly address: () => Promise<string>,
    private readonly report: (status: LiveStatus, detail?: string) => void,
  ) {}

  async begin(): Promise<void> {
    if (this.closed || this.starting || this.socket) return;
    this.starting = true;
    try {
      await this.overMse();
    } catch (mse) {
      if (this.closed) return;
      try {
        await this.overWebRtc();
      } catch (rtc) {
        if (!this.closed) this.lost(rtc instanceof Error ? rtc.message : String(rtc));
      }
    } finally {
      this.starting = false;
    }
  }

  close(): void {
    this.closed = true;
    clearTimeout(this.retry);
    this.release();
  }

  private async open(): Promise<WebSocket> {
    const socket = new WebSocket(await this.address());
    socket.binaryType = "arraybuffer";
    this.socket = socket;
    return socket;
  }

  private watch(active: () => boolean, resolve: () => void, fail: (why: string) => void, ms: number) {
    let done = false;
    const start = this.video.currentTime;
    const seen = () => {
      if (!active() || (this.video.readyState < 2 && this.video.currentTime <= start)) return;
      clearTimeout(timer);
      this.pictured = true;
      this.attempts = 0;
      this.report("live", this.transport);
      if (!done) {
        done = true;
        resolve();
      }
    };
    const timer = setTimeout(() => {
      seen();
      if (active() && !done) fail("no picture in time");
    }, ms);
    const events = ["loadeddata", "playing", "timeupdate", "progress"];
    for (const event of events) this.video.addEventListener(event, seen);
    return () => {
      clearTimeout(timer);
      for (const event of events) this.video.removeEventListener(event, seen);
    };
  }

  private lost(why: string, stalled = false): void {
    if (this.closed) return;

    // Buffered pictures may still be playing after the socket went; retry only
    // once playback stops advancing.
    if (!stalled && (this.pictured || this.video.readyState >= 2)) {
      const socket = this.socket;
      let last = this.video.currentTime;
      clearTimeout(this.retry);
      const check = () => {
        if (this.closed || this.socket !== socket) return;
        if (this.video.currentTime > last) {
          last = this.video.currentTime;
          this.retry = setTimeout(check, 5000);
        } else this.lost(why, true);
      };
      this.retry = setTimeout(check, 5000);
      return;
    }

    this.report("failed", why);
    this.release();
    this.attempts += 1;
    const wait = Math.min(30_000, 2000 * 2 ** Math.min(this.attempts - 1, 4));
    clearTimeout(this.retry);
    this.retry = setTimeout(() => {
      if (this.closed) return;
      this.report("connecting", "reconnecting");
      void this.begin();
    }, wait);
  }

  private release(): void {
    clearTimeout(this.retry);
    this.retry = undefined;
    this.cleanup?.();
    this.cleanup = null;
    const connection = this.connection;
    this.connection = null;
    if (connection) {
      connection.ontrack = null;
      connection.onicecandidate = null;
      connection.onconnectionstatechange = null;
      connection.close();
    }
    if (this.socket) {
      this.socket.onopen = this.socket.onclose = this.socket.onerror = this.socket.onmessage = null;
      this.socket.close();
      this.socket = null;
    }
    this.source = null;
    this.pictured = false;
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.video.srcObject = null;
    this.video.removeAttribute("src");
  }

  private play(): void {
    this.video.play().catch(() => {
      if (!this.closed && !this.pictured && this.video.readyState < 2) this.report("failed", "tap to play");
    });
  }

  private async overMse(): Promise<void> {
    this.release();
    this.transport = "mse";
    const Source = window.ManagedMediaSource || window.MediaSource;
    if (!Source) throw new Error("MSE is unavailable");
    const codecs = MSE_CODECS.split(",")
      .filter((codec) => Source.isTypeSupported(`video/mp4; codecs="${codec}"`))
      .join(",");
    if (!codecs) throw new Error("no supported MSE codecs");
    const source = new Source();
    this.source = source;
    const socket = await this.open();

    try {
      await new Promise<void>((resolve, reject) => {
        let buffer: SourceBuffer | null = null;
        let ready = false;
        let failed = false;
        let requested = false;
        const queue: ArrayBuffer[] = [];
        let queued = 0;
        const active = () => !this.closed && this.source === source && !failed;
        const fail = (why: string) => {
          if (!active()) return;
          failed = true;
          if (ready || this.video.readyState >= 2) {
            resolve();
            this.lost(why);
          } else reject(new Error(why));
        };
        const stop = this.watch(active, () => ((ready = true), resolve()), fail, 20_000);
        this.cleanup = () => {
          stop();
          queue.length = 0;
          reject(new Error("closed"));
        };
        const request = () => {
          if (active() && !requested && source.readyState === "open" && socket.readyState === WebSocket.OPEN) {
            requested = true;
            socket.send(JSON.stringify({ type: "mse", value: codecs }));
          }
        };
        const drain = () => {
          if (!active() || !buffer || buffer.updating || source.readyState !== "open") return;
          try {
            if (queue.length) {
              const next = queue.shift()!;
              queued -= next.byteLength;
              buffer.appendBuffer(next);
            } else this.keepUp(buffer);
          } catch (error) {
            if ((error as Error).name === "QuotaExceededError" && this.forget(buffer)) return;
            fail(`MSE append failed: ${(error as Error).message}`);
          }
        };
        socket.onopen = request;
        source.addEventListener("sourceopen", request, { once: true });
        socket.onmessage = ({ data }) => {
          if (!active()) return;
          try {
            if (typeof data === "string") {
              const message = JSON.parse(data);
              if (message.type === "error") throw new Error(message.value);
              if (message.type === "mse" && !buffer) {
                const selected = String(message.value).trim();
                const mime = selected.startsWith("video/mp4") ? selected : `video/mp4; codecs="${selected}"`;
                if (!Source.isTypeSupported(mime)) throw new Error(`unsupported type ${mime}`);
                buffer = source.addSourceBuffer(mime);
                // `sequence`: go2rtc's fragments carry the camera's running
                // timestamps, which `segments` mode places far from zero.
                buffer.mode = "sequence";
                buffer.addEventListener("updateend", drain);
                drain();
              }
            } else {
              queued += data.byteLength;
              if (queued > 16 * 1024 * 1024) throw new Error("MSE buffer overflow");
              queue.push(data);
              drain();
            }
          } catch (error) {
            fail((error as Error).message);
          }
        };
        socket.onerror = () => fail("the stream failed");
        socket.onclose = () => fail("the stream ended");
        if (window.ManagedMediaSource) {
          this.video.disableRemotePlayback = true;
          this.video.srcObject = source as unknown as MediaProvider;
        } else {
          this.objectUrl = URL.createObjectURL(source);
          this.video.src = this.objectUrl;
        }
        this.play();
      });
    } catch (error) {
      if (this.source === source) this.release();
      throw error;
    }
  }

  private async overWebRtc(): Promise<void> {
    this.release();
    this.transport = "webrtc";
    const connection = new RTCPeerConnection({ iceServers: [], bundlePolicy: "max-bundle" });
    this.connection = connection;
    const inbound = new MediaStream();
    connection.addTransceiver("video", { direction: "recvonly" });
    connection.addTransceiver("audio", { direction: "recvonly" });
    connection.ontrack = (event) => {
      if (this.closed || this.connection !== connection) return;
      inbound.addTrack(event.track);
      this.video.srcObject = inbound;
      this.play();
    };
    const socket = await this.open();

    try {
      await new Promise<void>((resolve, reject) => {
        let ready = false;
        let failed = false;
        let offered = false;
        let answered = false;
        const pendingLocal: string[] = [];
        const pendingRemote: string[] = [];
        const active = () => !this.closed && this.connection === connection && !failed;
        const fail = (why: string) => {
          if (!active()) return;
          failed = true;
          if (ready || this.video.readyState >= 2) {
            resolve();
            this.lost(why);
          } else reject(new Error(why));
        };
        const stop = this.watch(active, () => ((ready = true), resolve()), fail, 6000);
        this.cleanup = () => {
          stop();
          reject(new Error("closed"));
        };
        const send = (type: string, value: string | undefined) => {
          if (active() && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type, value }));
        };
        connection.onicecandidate = ({ candidate }) => {
          const value = candidate ? candidate.toJSON().candidate ?? "" : "";
          if (!offered) pendingLocal.push(value);
          else send("webrtc/candidate", value);
        };
        connection.onconnectionstatechange = () => {
          if (["failed", "closed"].includes(connection.connectionState)) fail("webrtc lost");
        };
        socket.onopen = async () => {
          try {
            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            send("webrtc/offer", offer.sdp);
            offered = true;
            for (const candidate of pendingLocal.splice(0)) send("webrtc/candidate", candidate);
          } catch (error) {
            fail((error as Error).message);
          }
        };
        let messages = Promise.resolve();
        socket.onmessage = ({ data }) => {
          messages = messages
            .then(async () => {
              if (!active()) return;
              const message = JSON.parse(data);
              if (message.type === "webrtc/answer") {
                await connection.setRemoteDescription({ type: "answer", sdp: message.value });
                answered = true;
                for (const candidate of pendingRemote.splice(0))
                  await connection.addIceCandidate({ candidate, sdpMid: "0" }).catch(() => undefined);
              } else if (message.type === "webrtc/candidate") {
                if (!answered) pendingRemote.push(message.value);
                else await connection.addIceCandidate({ candidate: message.value, sdpMid: "0" }).catch(() => undefined);
              } else if (message.type === "error") throw new Error(message.value);
            })
            .catch((error) => fail((error as Error).message));
        };
        socket.onerror = () => {
          if (!ready) fail("signalling failed");
        };
        socket.onclose = () => {
          if (!ready) fail("signalling ended");
        };
      });
    } catch (error) {
      if (this.connection === connection) this.release();
      throw error;
    }
  }

  private forget(buffer: SourceBuffer): boolean {
    if (buffer.updating || !buffer.buffered.length) return false;
    const keep = Math.max(0, this.video.currentTime - 10);
    if (keep > buffer.buffered.start(0)) {
      try {
        buffer.remove(buffer.buffered.start(0), keep);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /** Stay at the live edge: a live element that falls behind never catches up by itself. */
  private keepUp(buffer: SourceBuffer): void {
    const buffered = this.video.buffered;
    if (!buffered.length) return;
    const edge = buffered.end(buffered.length - 1);
    if (edge - this.video.currentTime > 4) this.video.currentTime = edge - 0.3;
    if (edge - buffered.start(0) > 30) this.forget(buffer);
  }
}
