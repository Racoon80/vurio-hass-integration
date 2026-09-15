/**
 * What the card asks Home Assistant for.
 *
 * Everything goes through Home Assistant — its websocket for data, and signed
 * paths to the integration's own views for pictures, clips and the live
 * socket — so the card works wherever Home Assistant does, the companion app
 * and remote access included, and never holds Vurio's token.
 */

export interface HassEntityState {
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
}

export interface Hass {
  states: Record<string, HassEntityState>;
  entities?: Record<string, { entity_id: string; platform?: string }>;
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}

export type Kind = "motion" | "person" | "vehicle" | "animal";

export const KINDS: readonly Kind[] = ["motion", "person", "vehicle", "animal"];

export interface VurioCamera {
  entry_id: string;
  camera: string;
  display_name: string;
  entity_id: string | null;
  online: boolean;
  mode: string;
  recording: boolean;
  detection: boolean;
  sensors: Partial<Record<Kind, boolean>>;
  /**
   * Width over height of the camera's main stream, when Vurio has measured it.
   * Every stream of the camera is drawn in this shape: a substream is the same
   * picture made smaller, and not every camera keeps it in shape.
   */
  aspect: number | null;
  /** The entity id of each sensor, so the card follows Home Assistant's state. */
  sensor_entities: Partial<Record<Kind, string>>;
}

export interface VurioEvent {
  id: string;
  camera: string;
  kind: string;
  label?: string;
  started_at: string;
  ended_at: string | null;
  score?: number;
}

export interface Detection {
  camera: string;
  group: string;
  label?: string;
  started_at: string;
  ended_at: string | null;
}

export interface Run {
  from: string;
  to: string;
}

export interface TimelineData {
  cameras: string[];
  detections: Detection[];
  recorded: Run[];
}

export async function listCameras(hass: Hass): Promise<VurioCamera[]> {
  return (await hass.callWS<{ cameras: VurioCamera[] }>({ type: "vurio/cameras" })).cameras;
}

export async function listEvents(
  hass: Hass,
  camera: VurioCamera,
  limit = 40,
): Promise<VurioEvent[]> {
  const answer = await hass.callWS<{ events: VurioEvent[] }>({
    type: "vurio/events",
    entry_id: camera.entry_id,
    camera: camera.camera,
    limit,
  });
  return answer.events;
}

export async function loadTimeline(
  hass: Hass,
  camera: VurioCamera,
  from: Date,
  to: Date,
): Promise<TimelineData> {
  return hass.callWS<TimelineData>({
    type: "vurio/timeline",
    entry_id: camera.entry_id,
    cameras: [camera.camera],
    from: from.toISOString(),
    to: to.toISOString(),
  });
}

const signed = new Map<string, { path: string; until: number }>();

/**
 * A path Home Assistant will serve without a header, for an element that
 * cannot send one: an <img>, a <video>, a WebSocket. Kept until shortly before
 * it expires, so a list of thumbnails is not a round trip each.
 */
export async function sign(hass: Hass, path: string, seconds = 600): Promise<string> {
  const now = Date.now();
  const kept = signed.get(path);
  if (kept && kept.until - 60_000 > now) return kept.path;

  const answer = await hass.callWS<{ path: string }>({
    type: "auth/sign_path",
    path,
    expires: seconds,
  });
  signed.set(path, { path: answer.path, until: now + seconds * 1000 });
  return answer.path;
}

export const livePath = (camera: VurioCamera, quality: "main" | "sub") =>
  `/api/vurio/${camera.entry_id}/live/${encodeURIComponent(camera.camera)}/ws?quality=${quality}`;

export const clipPath = (camera: VurioCamera, start: number, end: number) =>
  `/api/vurio/${camera.entry_id}/clip/${encodeURIComponent(camera.camera)}/${Math.floor(
    start / 1000,
  )}/${Math.ceil(end / 1000)}`;

export const framePath = (camera: VurioCamera, event: VurioEvent) =>
  `/api/vurio/${camera.entry_id}/frame/${encodeURIComponent(event.id)}`;

/** A signed path as a websocket address on the page's own host. */
export function socketUrl(path: string): string {
  const url = new URL(path, location.href);
  url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}
