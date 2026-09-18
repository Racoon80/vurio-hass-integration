import { LitElement, css, html, nothing, svg, type PropertyValues } from "lit";
import {
  KINDS,
  clipPath,
  framePath,
  listCameras,
  listEvents,
  livePath,
  loadTimeline,
  sign,
  socketUrl,
  type Hass,
  type Kind,
  type TimelineData,
  type VurioCamera,
  type VurioEvent,
} from "./api";
import { keepDefined } from "./define";
import { LiveStream, type LiveStatus } from "./live";
import {
  ROWS,
  STEP,
  clipAt,
  eventRange,
  moved,
  position,
  rows,
  scaled,
  ticks,
  what,
} from "./timeline";

interface CardConfig {
  type: string;
  title?: string;
  /** Camera entities; all of Vurio's when left out. */
  cameras?: string[];
  view?: "single" | "grid";
  events?: boolean;
  timeline?: boolean;
  hours?: number;
  grid_columns?: number;
}

const ICONS: Record<Kind | "other" | "plate", string> = {
  motion: "mdi:motion-sensor",
  person: "mdi:walk",
  vehicle: "mdi:car",
  animal: "mdi:paw",
  other: "mdi:shape-outline",
  plate: "mdi:card-text-outline",
};

const LABELS: Record<Kind | "other" | "plate", string> = {
  motion: "Motion",
  person: "Person",
  vehicle: "Vehicle",
  animal: "Animal",
  // "Object": everything else the model named, and what Vurio's own timeline
  // calls that row. It was "Other", which named the row after what it is not.
  other: "Object",
  plate: "Plate",
};

const time = (at: number | string) =>
  new Date(at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const day = (at: number | string) =>
  new Date(at).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

/**
 * One live picture. Starts when it is on screen and stops when it is not, so a
 * grid of twelve tiles on a long dashboard is not twelve streams nobody sees.
 */
class VurioLive extends LitElement {
  static properties = {
    hass: { attribute: false },
    camera: { attribute: false },
    quality: {},
    muted: { type: Boolean },
    status: { state: true },
    detail: { state: true },
  };

  /** Stretched to the camera's own shape when it is known; see VurioCamera.aspect. */
  private fit(): string {
    return this.camera?.aspect ? "object-fit: fill" : "";
  }

  hass?: Hass;
  camera?: VurioCamera;
  quality: "main" | "sub" = "sub";
  muted = true;
  status: LiveStatus = "connecting";
  detail = "";
  private stream: LiveStream | null = null;
  private observer: IntersectionObserver | null = null;
  private visible = false;

  static styles = css`
    :host { display: block; position: relative; background: #000; overflow: hidden; }
    video { width: 100%; height: 100%; object-fit: contain; display: block; background: #000; }
    .status { position: absolute; inset: auto 0 0 0; padding: 6px 10px; font-size: 12px;
      color: #fff; background: linear-gradient(transparent, rgba(0,0,0,.6)); pointer-events: none; }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = Boolean(entry?.isIntersecting);
      this.visible ? this.start() : this.stop();
    });
    this.observer.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.stop();
  }

  protected updated(changed: PropertyValues): void {
    if ((changed.has("camera") || changed.has("quality")) && this.visible) {
      this.stop();
      this.start();
    }
    const video = this.video();
    if (video) video.muted = this.muted;
  }

  private video(): HTMLVideoElement | null {
    return this.renderRoot.querySelector("video");
  }

  private start(): void {
    const video = this.video();
    if (this.stream || !video || !this.hass || !this.camera) return;
    const hass = this.hass;
    const camera = this.camera;
    this.status = "connecting";
    this.stream = new LiveStream(
      video,
      async () => socketUrl(await sign(hass, livePath(camera, this.quality), 300)),
      (status, detail) => {
        this.status = status;
        this.detail = detail ?? "";
        this.dispatchEvent(new CustomEvent("live-status", { detail: { status, transport: detail } }));
      },
    );
    void this.stream.begin();
  }

  private stop(): void {
    this.stream?.close();
    this.stream = null;
  }

  render() {
    return html`
      <video playsinline autoplay .muted=${this.muted} style=${this.fit()}></video>
      ${this.status === "live"
        ? nothing
        : html`<div class="status">${this.status === "failed" ? `No picture: ${this.detail}` : "Connecting…"}</div>`}
    `;
  }
}

class VurioCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { state: true },
    cameras: { state: true },
    selected: { state: true },
    view: { state: true },
    events: { state: true },
    filter: { state: true },
    playing: { state: true },
    timeline: { state: true },
    span: { state: true },
    liveStatus: { state: true },
    muted: { state: true },
    error: { state: true },
  };

  hass?: Hass;
  config!: CardConfig;
  cameras: VurioCamera[] = [];
  selected = "";
  view: "single" | "grid" = "single";
  events: VurioEvent[] = [];
  filter: Kind | "all" = "all";
  playing: { url: string; title: string } | null = null;
  timeline: TimelineData | null = null;
  // The stretch of time the strip draws. `null` follows the present; moving
  // or zooming pins it, and Now lets go again.
  span: { from: number; to: number } | null = null;
  // The last load, so a drag that ends where it started does not reload, and
  // a hundred wheel notches are one request.
  private loading = 0;
  liveStatus = "";
  muted = true;
  error = "";
  private thumbnails = new Map<string, string>();
  private refresher: ReturnType<typeof setInterval> | undefined;
  private lastSensors = "";

  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        {
          name: "cameras",
          selector: { entity: { multiple: true, filter: { domain: "camera", integration: "vurio" } } },
        },
        {
          name: "view",
          selector: { select: { mode: "dropdown", options: [
            { value: "single", label: "One camera" },
            { value: "grid", label: "Grid" },
          ] } },
        },
        { name: "events", selector: { boolean: {} } },
        { name: "timeline", selector: { boolean: {} } },
        { name: "hours", selector: { number: { min: 1, max: 168, mode: "box", unit_of_measurement: "h" } } },
        { name: "grid_columns", selector: { number: { min: 1, max: 6, mode: "box" } } },
      ],
    };
  }

  static getStubConfig(hass: Hass): CardConfig {
    const cameras = Object.values(hass.entities ?? {})
      .filter((entity) => entity.platform === "vurio" && entity.entity_id.startsWith("camera."))
      .map((entity) => entity.entity_id);
    return { type: "custom:vurio-card", cameras, view: "single", events: true, timeline: true, hours: 24 };
  }

  setConfig(config: CardConfig): void {
    this.config = { view: "single", events: true, timeline: true, hours: 24, ...config };
    this.view = this.config.view ?? "single";
  }

  getCardSize(): number {
    return this.view === "grid" ? 8 : 10;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, min_rows: 6 };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.refresher = setInterval(() => void this.refresh(), 60_000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.refresher);
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && !this.cameras.length && !this.error) void this.load();
  }

  protected updated(changed: PropertyValues): void {
    // A sensor turning on is a new event on its way: fetch the list again.
    if (changed.has("hass") && this.hass && this.cameras.length) {
      const now = this.shown()
        .flatMap((camera) => KINDS.map((kind) => this.sensor(camera, kind) ? `${camera.camera}:${kind}` : ""))
        .join(",");
      if (now !== this.lastSensors) {
        const before = this.lastSensors;
        this.lastSensors = now;
        if (before) setTimeout(() => void this.refresh(), 1500);
      }
    }
  }

  private async load(): Promise<void> {
    if (!this.hass) return;
    try {
      const all = await listCameras(this.hass);
      const wanted = this.config.cameras;
      this.cameras = wanted?.length
        ? wanted
            .map((entity) => all.find((camera) => camera.entity_id === entity))
            .filter((camera): camera is VurioCamera => Boolean(camera))
        : all;
      if (!this.cameras.length) {
        this.error = "No Vurio cameras found. Is the Vurio integration set up?";
        return;
      }
      this.selected = this.cameras[0]!.camera;
      await this.refresh();
    } catch (error) {
      this.error = `Vurio could not be read: ${(error as Error).message ?? error}`;
    }
  }

  private shown(): VurioCamera[] {
    return this.view === "grid" ? this.cameras : this.cameras.filter((c) => c.camera === this.selected);
  }

  private current(): VurioCamera | undefined {
    return this.cameras.find((camera) => camera.camera === this.selected);
  }

  private sensor(camera: VurioCamera, kind: Kind): boolean {
    const entity = camera.sensor_entities?.[kind];
    if (entity && this.hass?.states[entity]) return this.hass.states[entity]!.state === "on";
    return Boolean(camera.sensors?.[kind]);
  }

  /** The stretch the strip draws: what was chosen, or the last `hours` up to now. */
  private window(): { from: number; to: number } {
    if (this.span) return this.span;
    const to = Date.now();

    return { from: to - (this.config.hours ?? 24) * 3_600_000, to };
  }

  /** Show another stretch, and read what happened in it. */
  private show(window: { from: number; to: number } | null): void {
    this.span = window;
    this.requestUpdate();
    const mine = ++this.loading;
    // A moment's wait: dragging across a day is one request at the end of it,
    // not one for every pixel on the way.
    window === null
      ? void this.refresh()
      : setTimeout(() => {
          if (this.loading === mine) void this.refresh();
        }, 250);
  }

  private async refresh(): Promise<void> {
    const hass = this.hass;
    const camera = this.current();
    if (!hass || !camera) return;
    const { from, to } = this.window();
    try {
      const [events, timeline] = await Promise.all([
        this.config.events === false ? Promise.resolve([]) : listEvents(hass, camera, 60),
        this.config.timeline === false ? Promise.resolve(null) : loadTimeline(hass, camera, new Date(from), new Date(to)),
      ]);
      if (this.current() !== camera) return;
      this.events = events;
      this.timeline = timeline;
      this.error = "";
      await Promise.all(
        events.slice(0, 30).map(async (event) => {
          if (!this.thumbnails.has(event.id))
            this.thumbnails.set(event.id, await sign(hass, framePath(camera, event), 3600).catch(() => ""));
        }),
      );
      this.requestUpdate();
    } catch (error) {
      // A token that may only watch: the live picture works, and the rest says
      // what to change rather than showing nothing.
      const failure = error as { code?: string; message?: string };
      this.error =
        failure.code === "missing_permission"
          ? (failure.message ?? "The Vurio token needs events:read and recordings:read.")
          : `Events could not be read: ${failure.message ?? String(error)}`;
    }
  }

  private choose(camera: string): void {
    if (camera === this.selected && this.view === "single") return;
    this.selected = camera;
    this.view = "single";
    this.playing = null;
    this.events = [];
    this.timeline = null;
    this.span = null;
    void this.refresh();
  }

  private async play(start: number, end: number, title: string): Promise<void> {
    const hass = this.hass;
    const camera = this.current();
    if (!hass || !camera) return;
    this.playing = { url: await sign(hass, clipPath(camera, start, end), 900), title };
  }

  private fullscreen(): void {
    const stage = this.renderRoot.querySelector(".stage") as HTMLElement | null;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage?.requestFullscreen?.();
  }

  private header() {
    return html`
      <div class="header">
        ${this.config.title ? html`<div class="title">${this.config.title}</div>` : nothing}
        <div class="chips" role="tablist">
          ${this.cameras.map((camera) => {
            const active = KINDS.filter((kind) => kind !== "motion" && this.sensor(camera, kind));
            return html`
              <button
                role="tab"
                class="chip ${this.view === "single" && camera.camera === this.selected ? "on" : ""}"
                aria-selected=${this.view === "single" && camera.camera === this.selected}
                @click=${() => this.choose(camera.camera)}
              >
                <span class="dot ${camera.online ? "online" : camera.mode === "off" ? "dark" : "offline"}"></span>
                ${camera.display_name}
                ${active.map((kind) => html`<ha-icon class="badge ${kind}" .icon=${ICONS[kind]}></ha-icon>`)}
              </button>
            `;
          })}
        </div>
        ${this.cameras.length > 1
          ? html`<div class="toggle">
              <button class=${this.view === "single" ? "on" : ""} title="One camera" @click=${() => (this.view = "single")}>
                <ha-icon icon="mdi:square-outline"></ha-icon>
              </button>
              <button class=${this.view === "grid" ? "on" : ""} title="Grid" @click=${() => ((this.view = "grid"), (this.playing = null))}>
                <ha-icon icon="mdi:view-grid-outline"></ha-icon>
              </button>
            </div>`
          : nothing}
      </div>
    `;
  }

  private single(camera: VurioCamera) {
    const sensors = KINDS.filter((kind) => this.sensor(camera, kind));
    return html`
      <div class="stage" style="aspect-ratio: ${camera.aspect ?? 16 / 9}">
        ${this.playing
          ? html`<video class="playback" src=${this.playing.url} controls autoplay playsinline></video>`
          : html`<vurio-live
              .hass=${this.hass}
              .camera=${camera}
              quality="main"
              .muted=${this.muted}
              @live-status=${(e: CustomEvent) => (this.liveStatus = e.detail.status === "live" ? e.detail.transport : "")}
            ></vurio-live>`}
        <div class="overlay top">
          <span class="name">${camera.display_name}</span>
          ${this.playing
            ? html`<span class="pill playback">${this.playing.title}</span>`
            : html`<span class="pill ${this.liveStatus ? "live" : ""}">${this.liveStatus ? "LIVE" : "…"}</span>`}
          ${camera.mode !== "continuous" ? html`<span class="pill mode">${camera.mode === "off" ? "Off by schedule" : "Events only"}</span>` : nothing}
          <span class="spacer"></span>
          ${sensors.map((kind) => html`<span class="pill sensor ${kind}"><ha-icon .icon=${ICONS[kind]}></ha-icon>${LABELS[kind]}</span>`)}
        </div>
        <div class="overlay bottom">
          ${this.playing
            ? html`<button class="action" @click=${() => (this.playing = null)}><ha-icon icon="mdi:broadcast"></ha-icon>Live</button>`
            : html`<button class="icon" title=${this.muted ? "Unmute" : "Mute"} @click=${() => (this.muted = !this.muted)}>
                <ha-icon .icon=${this.muted ? "mdi:volume-off" : "mdi:volume-high"}></ha-icon>
              </button>`}
          <button class="icon" title="Fullscreen" @click=${() => this.fullscreen()}>
            <ha-icon icon="mdi:fullscreen"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  private grid() {
    const columns = this.config.grid_columns ?? Math.min(4, Math.ceil(Math.sqrt(this.cameras.length)));
    return html`
      <div class="grid" style="--columns:${columns}">
        ${this.cameras.map((camera) => {
          const sensors = KINDS.filter((kind) => kind !== "motion" && this.sensor(camera, kind));
          return html`
            <div class="tile" style="aspect-ratio: ${camera.aspect ?? 16 / 9}" @click=${() => this.choose(camera.camera)}>
              <vurio-live .hass=${this.hass} .camera=${camera} quality="sub" .muted=${true}></vurio-live>
              <div class="overlay top small">
                <span class="dot ${camera.online ? "online" : "offline"}"></span>
                <span class="name">${camera.display_name}</span>
                <span class="spacer"></span>
                ${sensors.map((kind) => html`<ha-icon class="badge ${kind}" .icon=${ICONS[kind]}></ha-icon>`)}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private eventsPanel(camera: VurioCamera) {
    const now = Date.now();
    const list = this.events.filter((event) => this.filter === "all" || what(event) === this.filter);
    return html`
      <div class="events">
        <div class="filters">
          ${(["all", ...KINDS] as const).map(
            (kind) => html`<button class="chip small ${this.filter === kind ? "on" : ""}" @click=${() => (this.filter = kind)}>
              ${kind === "all" ? "All" : html`<ha-icon .icon=${ICONS[kind]}></ha-icon>${LABELS[kind]}`}
            </button>`,
          )}
        </div>
        <div class="list">
          ${list.length === 0
            ? html`<div class="empty">${this.events.length ? "Nothing of that kind." : "No events yet."}</div>`
            : list.map((event) => {
                const kind = what(event);
                const [start, end] = eventRange(event, now);
                const seconds = Math.max(1, Math.round(((event.ended_at ? Date.parse(event.ended_at) : now) - Date.parse(event.started_at)) / 1000));
                return html`
                  <button class="event" @click=${() => this.play(start, end, `${LABELS[kind]} · ${time(event.started_at)}`)}>
                    <span class="thumb">
                      ${this.thumbnails.get(event.id)
                        ? html`<img loading="lazy" src=${this.thumbnails.get(event.id)!} alt="" />`
                        : html`<ha-icon .icon=${ICONS[kind]}></ha-icon>`}
                    </span>
                    <span class="what">
                      <strong><ha-icon class="badge ${kind}" .icon=${ICONS[kind]}></ha-icon>${event.label ? event.label : LABELS[kind]}</strong>
                      <small>${day(event.started_at)} · ${time(event.started_at)} · ${seconds < 90 ? `${seconds}s` : `${Math.round(seconds / 60)} min`}${event.score ? ` · ${Math.round(event.score * 100)}%` : ""}</small>
                    </span>
                    ${event.ended_at ? nothing : html`<span class="pill live">now</span>`}
                  </button>
                `;
              })}
        </div>
      </div>
    `;
  }

  private timelineStrip(camera: VurioCamera) {
    const data = this.timeline;
    if (!data) return nothing;
    const now = Date.now();
    const { from, to } = this.window();
    const bars = rows(data.detections, camera.camera, from, to, now);
    const recorded = data.recorded.map((run) => ({ from: Date.parse(run.from), to: Date.parse(run.to) }));
    const at = (clientX: number, strip: DOMRect) =>
      from + ((clientX - strip.left) / strip.width) * (to - from);
    // A drag moves the window; a click plays. Which one it was is decided by
    // how far the pointer travelled, because a click is a drag of no distance
    // and asking people to press exactly still is asking too much.
    let held: { x: number; from: number; to: number; moved: boolean } | null = null;
    const grab = (event: PointerEvent) => {
      if (event.button !== 0) return;
      held = { x: event.clientX, from, to, moved: false };
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    };
    const drag = (event: PointerEvent) => {
      if (!held) return;
      const strip = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const by = ((held.x - event.clientX) / strip.width) * (held.to - held.from);
      if (!held.moved && Math.abs(event.clientX - held.x) < 4) return;
      held.moved = true;
      const wanted = Math.min(now, held.to + by);
      this.show({ from: wanted - (held.to - held.from), to: wanted });
    };
    const release = (event: PointerEvent) => {
      const was = held;
      held = null;
      if (!was || was.moved) return;
      const range = clipAt(at(event.clientX, (event.currentTarget as HTMLElement).getBoundingClientRect()), data.recorded);
      if (range) void this.play(range[0], range[1], `${day(range[0])} · ${time(range[0])}`);
    };
    const wheel = (event: WheelEvent) => {
      if (!event.deltaY) return;
      event.preventDefault();
      this.show(scaled({ from, to }, event.deltaY > 0 ? 1.5 : 1 / 1.5, now));
    };
    const live = to >= now - 60_000;
    return html`
      <div class="timeline">
        <div class="labels">${ROWS.map((row) => html`<span>${LABELS[row]}</span>`)}</div>
        <div class="strip"
          @pointerdown=${grab}
          @pointermove=${drag}
          @pointerup=${release}
          @pointercancel=${() => (held = null)}
          @wheel=${wheel}
          title="Drag to move through time, scroll to zoom, click to play from a moment">
          <svg viewBox="0 0 1000 ${ROWS.length * 14 + 4}" preserveAspectRatio="none">
            ${recorded.map((run) => svg`<rect class="recorded" x=${position(run.from, from, to) * 10} y="0"
              width=${Math.max(1, (position(run.to, from, to) - position(run.from, from, to)) * 10)} height=${ROWS.length * 14 + 4}></rect>`)}
            ${ROWS.map((row, index) =>
              bars[row].map((bar) => svg`<rect class="bar ${row}" x=${position(bar.from, from, to) * 10} y=${index * 14 + 3}
                width=${Math.max(2, (position(bar.to, from, to) - position(bar.from, from, to)) * 10)} height="10" rx="2"></rect>`),
            )}
          </svg>
          <div class="ticks">
            ${ticks(from, to).map((mark) => html`<span style="left:${position(mark, from, to)}%">${time(mark)}</span>`)}
          </div>
        </div>
        <div class="when">${day(from)} · ${time(from)} – ${time(to)}</div>
        <div class="moves">
          <button @click=${() => this.show(moved({ from, to }, -STEP, now))} title="Earlier">‹</button>
          <button @click=${() => this.show(scaled({ from, to }, 1 / 1.5, now))} title="Closer in">＋</button>
          <button @click=${() => this.show(scaled({ from, to }, 1.5, now))} title="Further out">－</button>
          <button @click=${() => this.show(moved({ from, to }, STEP, now))} ?disabled=${live} title="Later">›</button>
          <button class="now" @click=${() => this.show(null)} ?disabled=${live} title="Back to now">Now</button>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.config) return nothing;
    if (this.error && !this.cameras.length) return html`<ha-card><div class="message">${this.error}</div></ha-card>`;
    if (!this.cameras.length) return html`<ha-card><div class="message">Loading Vurio…</div></ha-card>`;
    const camera = this.current();
    const side = this.view === "single" && this.config.events !== false && camera;
    return html`
      <ha-card>
        ${this.header()}
        <div class="body ${side ? "with-events" : ""}">
          <div class="main">
            ${this.view === "grid" || !camera ? this.grid() : this.single(camera)}
            ${this.view === "single" && camera && this.config.timeline !== false ? this.timelineStrip(camera) : nothing}
          </div>
          ${side ? this.eventsPanel(camera!) : nothing}
        </div>
        ${this.error ? html`<div class="message small">${this.error}</div>` : nothing}
      </ha-card>
    `;
  }

  static styles = css`
    ha-card { overflow: hidden; }
    .message { padding: 16px; color: var(--secondary-text-color); }
    .message.small { padding: 6px 12px 10px; font-size: 12px; }
    .header { display: flex; align-items: center; gap: 8px; padding: 10px 12px; }
    .title { font-size: 16px; font-weight: 500; margin-right: 4px; white-space: nowrap; }
    .chips { display: flex; gap: 6px; overflow-x: auto; flex: 1; scrollbar-width: none; }
    .chip { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; cursor: pointer;
      border: 1px solid var(--divider-color); background: transparent; color: var(--primary-text-color);
      border-radius: 999px; padding: 5px 11px; font: inherit; font-size: 13px; }
    .chip.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
    .chip.small { padding: 3px 9px; font-size: 12px; --mdc-icon-size: 14px; }
    .toggle { display: flex; border: 1px solid var(--divider-color); border-radius: 999px; overflow: hidden; }
    .toggle button { background: transparent; border: 0; color: var(--secondary-text-color); padding: 4px 9px; cursor: pointer; --mdc-icon-size: 18px; }
    .toggle button.on { color: var(--primary-color); background: rgba(127,127,127,.12); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--disabled-text-color, #888); flex: none; }
    .dot.online { background: var(--success-color, #43a047); }
    .dot.offline { background: var(--error-color, #db4437); }
    .badge { --mdc-icon-size: 15px; }
    .person { color: #e5484d; } .vehicle { color: #f0963a; } .animal { color: #3fb96d; } .motion { color: #4c7dff; }
    .body { display: grid; grid-template-columns: minmax(0, 1fr); }
    .body.with-events { grid-template-columns: minmax(0, 1fr) 300px; }
    @container (max-width: 760px) { .body.with-events { grid-template-columns: minmax(0, 1fr); } }
    :host { container-type: inline-size; display: block; }
    .main { min-width: 0; }
    .stage { position: relative; aspect-ratio: 16 / 9; background: #000; }
    .stage vurio-live, .stage video.playback { position: absolute; inset: 0; width: 100%; height: 100%; }
    video.playback { object-fit: contain; background: #000; }
    .overlay { position: absolute; left: 0; right: 0; display: flex; align-items: center; gap: 6px; padding: 8px 10px; color: #fff; pointer-events: none; }
    .overlay.top { top: 0; background: linear-gradient(rgba(0,0,0,.55), transparent); }
    .overlay.bottom { bottom: 0; justify-content: flex-end; }
    .overlay button { pointer-events: auto; }
    .overlay.small { font-size: 12px; padding: 5px 8px; }
    .name { font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
    .spacer { flex: 1; }
    .pill { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; letter-spacing: .02em;
      padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,.5); color: #fff; --mdc-icon-size: 13px; }
    .pill.live { background: #e5484d; }
    .pill.playback { background: var(--primary-color); }
    .pill.mode { background: rgba(240,150,58,.85); }
    .pill.sensor { background: rgba(0,0,0,.6); }
    .icon, .action { border: 0; cursor: pointer; color: #fff; background: rgba(0,0,0,.5); border-radius: 999px;
      display: inline-flex; align-items: center; gap: 4px; padding: 6px; --mdc-icon-size: 20px; font: inherit; font-size: 13px; }
    .action { padding: 6px 12px 6px 8px; background: var(--primary-color); }
    .grid { display: grid; grid-template-columns: repeat(var(--columns), minmax(0, 1fr)); gap: 4px; padding: 0 4px 4px; }
    @container (max-width: 520px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .tile { position: relative; aspect-ratio: 16 / 9; cursor: pointer; border-radius: 6px; overflow: hidden; }
    .tile vurio-live { position: absolute; inset: 0; }
    .events { border-left: 1px solid var(--divider-color); display: flex; flex-direction: column; min-height: 0; max-height: 520px; }
    @container (max-width: 760px) { .events { border-left: 0; border-top: 1px solid var(--divider-color); max-height: 360px; } }
    .filters { display: flex; gap: 4px; padding: 8px; flex-wrap: wrap; }
    .list { overflow-y: auto; padding: 0 6px 8px; }
    .empty { color: var(--secondary-text-color); padding: 12px 6px; font-size: 13px; }
    .event { width: 100%; display: flex; align-items: center; gap: 10px; text-align: left; cursor: pointer;
      background: transparent; border: 0; border-radius: 8px; padding: 6px; color: var(--primary-text-color); font: inherit; }
    .event:hover { background: rgba(127,127,127,.1); }
    .thumb { width: 88px; aspect-ratio: 16 / 9; border-radius: 6px; overflow: hidden; background: var(--secondary-background-color);
      display: grid; place-items: center; flex: none; color: var(--secondary-text-color); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .what { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .what strong { display: flex; align-items: center; gap: 4px; font-weight: 500; font-size: 13px; text-transform: capitalize; }
    .what small { color: var(--secondary-text-color); font-size: 11px; }
    .timeline { display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 6px; padding: 8px 10px 4px; }
    .labels { display: grid; grid-template-rows: repeat(4, 14px); padding-top: 2px; font-size: 10px; color: var(--secondary-text-color); }
    .strip { position: relative; cursor: crosshair; padding-bottom: 16px; }
    .strip svg { width: 100%; height: ${ROWS.length * 14 + 4}px; display: block; }
    .recorded { fill: rgba(127,127,127,.14); }
    .bar.motion { fill: #4c7dff; } .bar.person { fill: #e5484d; } .bar.vehicle { fill: #f0963a; } .bar.animal { fill: #3fb96d; }
    .bar.other { fill: #9a6ddb; } .bar.plate { fill: #e6c229; }
    .strip { cursor: grab; touch-action: pan-y; }
    .strip:active { cursor: grabbing; }
    .when { grid-column: 2; font-size: 11px; opacity: 0.7; padding-top: 2px; }
    .moves { grid-column: 1 / -1; display: flex; gap: 4px; justify-content: flex-end; padding: 2px 0 4px; }
    .moves button { min-width: 28px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--divider-color, #444);
      background: transparent; color: inherit; cursor: pointer; font-size: 12px; }
    .moves button[disabled] { opacity: 0.35; cursor: default; }
    .ticks { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; font-size: 10px; color: var(--secondary-text-color); }
    .ticks span { position: absolute; transform: translateX(-50%); white-space: nowrap; }
  `;
}

keepDefined([
  ["vurio-live", VurioLive],
  ["vurio-card", VurioCard],
]);

declare global {
  interface Window {
    customCards?: { type: string; name: string; description: string; preview?: boolean; documentationURL?: string }[];
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "vurio-card")) {
  window.customCards.push({
    type: "vurio-card",
    name: "Vurio",
    description: "Live cameras, events and the detection timeline from Vurio.",
    preview: false,
    documentationURL: "https://github.com/Racoon80/vurio-hass-integration",
  });
}
