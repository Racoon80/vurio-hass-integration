/** The detection timeline, as numbers: no DOM here, so it can be tested. */

import type { Detection, Run, VurioEvent } from "./api";

/**
 * The rows of the timeline, in the order they are drawn — the same six as
 * Vurio's own interface, so a camera reads the same way in both.
 *
 * `other` is everything else the model named, a bag or a chair or a bird table,
 * on one row: a row per class is a page nobody reads. `plate` is the plates
 * read off the vehicles above, on their own row rather than as a mark on the
 * vehicle's, because one vehicle is two things to look for.
 */
export const ROWS = ["motion", "person", "vehicle", "animal", "other", "plate"] as const;

export type Row = (typeof ROWS)[number];

/** How far a window may be moved, and how much of it a step moves. */
export const STEP = 0.5;

/** The shortest and longest window the card will show. */
export const NARROWEST = 15 * 60_000;
export const WIDEST = 7 * 24 * 3_600_000;

/**
 * A window moved by a share of its own width, never past `now`.
 *
 * Going back is unbounded — Vurio keeps what it keeps, and a window over
 * footage that has been erased is simply empty — while going forward stops at
 * the present, because half a window of the future is half a window of nothing.
 */
export function moved(window: Interval, by: number, now: number): Interval {
  const width = window.to - window.from;
  const to = Math.min(now, window.to + width * by);

  return { from: to - width, to };
}

/** The same window, `factor` as wide, around its own middle and never past `now`. */
export function scaled(window: Interval, factor: number, now: number): Interval {
  const width = Math.min(WIDEST, Math.max(NARROWEST, (window.to - window.from) * factor));
  const middle = (window.from + window.to) / 2;
  const to = Math.min(now, middle + width / 2);

  return { from: to - width, to };
}

export interface Interval {
  from: number;
  to: number;
}

/** Footage either side of an event, so its clip shows the moment it began. */
export const PADDING = 5_000;

/** The longest clip Vurio plays as one file. */
export const CLIP = 5 * 60_000;

/**
 * Intervals clipped to a window and merged where they overlap or come within
 * `gap` — a burst of detections is one bar, not a hundred one-pixel ones.
 */
export function merged(intervals: Interval[], from: number, to: number, gap = 0): Interval[] {
  const clipped = intervals
    .filter((interval) => interval.to >= from && interval.from <= to)
    .map((interval) => ({
      from: Math.max(from, interval.from),
      to: Math.min(to, Math.max(interval.to, interval.from)),
    }))
    .sort((a, b) => a.from - b.from);
  const out: Interval[] = [];

  for (const interval of clipped) {
    const last = out[out.length - 1];
    if (last && interval.from <= last.to + gap) last.to = Math.max(last.to, interval.to);
    else out.push({ ...interval });
  }

  return out;
}

/** Each row's bars for one camera, merged at a five-hundredth of the window. */
export function rows(
  detections: Detection[],
  camera: string,
  from: number,
  to: number,
  now: number,
): Record<Row, Interval[]> {
  const gap = (to - from) / 500;
  const out = {} as Record<Row, Interval[]>;

  for (const row of ROWS) {
    out[row] = merged(
      detections
        .filter((d) => d.camera === camera && d.group === row)
        .map((d) => ({
          from: Date.parse(d.started_at),
          to: d.ended_at ? Date.parse(d.ended_at) : now,
        })),
      from,
      to,
      gap,
    );
  }

  return out;
}

/** Where a moment falls in a window, as a percentage. */
export const position = (at: number, from: number, to: number) =>
  Math.min(100, Math.max(0, ((at - from) / (to - from)) * 100));

/** Hour marks across a window: every hour, or every few when the window is long. */
export function ticks(from: number, to: number): number[] {
  const hour = 3_600_000;
  const span = to - from;
  const step = span <= 6 * hour ? hour : span <= 12 * hour ? 2 * hour : span <= 24 * hour ? 4 * hour : 12 * hour;
  const out: number[] = [];
  for (let at = Math.ceil(from / step) * step; at <= to; at += step) out.push(at);
  return out;
}

/** From just before an event began to just after it ended, at most one clip long. */
export function eventRange(event: VurioEvent, now: number): [number, number] {
  const start = Date.parse(event.started_at) - PADDING;
  const ended = event.ended_at ? Date.parse(event.ended_at) : now;
  return [start, Math.min(ended + PADDING, start + CLIP)];
}

/** The clip to play from a moment, when anything was recorded then. */
export function clipAt(at: number, recorded: Run[]): [number, number] | null {
  for (const run of recorded) {
    const begins = Date.parse(run.from);
    const ends = Date.parse(run.to);
    if (at >= begins && at <= ends) {
      const start = Math.max(begins, at - PADDING);
      return [start, Math.min(ends, start + CLIP)];
    }
  }
  return null;
}

/** An event's class as people say it. */
export function what(event: VurioEvent): Row | "other" {
  const label = (event.label ?? "").toLowerCase();
  if (event.kind === "motion" && !label) return "motion";
  if (label === "person") return "person";
  if (["car", "truck", "bus", "motorcycle", "bicycle", "train", "boat", "airplane", "vehicle"].includes(label))
    return "vehicle";
  if (["dog", "cat", "bird", "horse", "sheep", "cow", "bear", "animal"].includes(label)) return "animal";
  return label ? "other" : "motion";
}
