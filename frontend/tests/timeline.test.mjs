import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";

const source = (await readFile(new URL("../src/timeline.ts", import.meta.url), "utf8")).replace(
  /^import type .*$/m,
  "",
);
const {
  merged,
  rows,
  position,
  ticks,
  eventRange,
  clipAt,
  what,
  moved,
  scaled,
  ROWS,
  NARROWEST,
  WIDEST,
  CLIP,
} = await import(
  "data:text/javascript;base64," + Buffer.from(stripTypeScriptTypes(source)).toString("base64")
);

const at = (iso) => Date.parse(iso);

test("detections close together become one bar, and bars stay inside the window", () => {
  const out = merged(
    [
      { from: 100, to: 200 },
      { from: 205, to: 300 },
      { from: 900, to: 1200 },
    ],
    0,
    1000,
    10,
  );
  assert.deepEqual(out, [
    { from: 100, to: 300 },
    { from: 900, to: 1000 },
  ]);
});

test("a camera's rows hold only its own detections, and one still going runs to now", () => {
  const now = at("2026-09-15T12:00:00Z");
  const detections = [
    { camera: "garden", group: "person", started_at: "2026-09-15T11:00:00Z", ended_at: "2026-09-15T11:01:00Z" },
    { camera: "garden", group: "vehicle", started_at: "2026-09-15T11:50:00Z", ended_at: null },
    { camera: "cave", group: "person", started_at: "2026-09-15T11:30:00Z", ended_at: "2026-09-15T11:31:00Z" },
  ];
  const out = rows(detections, "garden", now - 3_600_000, now, now);
  assert.equal(out.person.length, 1);
  assert.equal(out.vehicle[0].to, now);
  assert.deepEqual(out.animal, []);
});

test("positions and hour marks", () => {
  assert.equal(position(50, 0, 100), 50);
  assert.equal(position(-5, 0, 100), 0);
  const from = at("2026-09-15T08:30:00Z");
  const marks = ticks(from, from + 3 * 3_600_000);
  assert.equal(marks.length, 3);
  assert.equal(new Date(marks[0]).getUTCMinutes(), 0);
});

test("an event's clip starts just before it and is never longer than one clip", () => {
  const event = { id: "1", camera: "garden", kind: "object", label: "person", started_at: "2026-09-15T12:00:10Z", ended_at: "2026-09-15T12:00:40Z" };
  assert.deepEqual(eventRange(event, 0), [at("2026-09-15T12:00:05Z"), at("2026-09-15T12:00:45Z")]);
  const long = { ...event, ended_at: "2026-09-15T13:00:00Z" };
  const [start, end] = eventRange(long, 0);
  assert.equal(end - start, CLIP);
});

test("playing from a moment needs footage there", () => {
  const recorded = [{ from: "2026-09-15T12:00:00Z", to: "2026-09-15T12:02:00Z" }];
  assert.deepEqual(clipAt(at("2026-09-15T12:01:00Z"), recorded), [at("2026-09-15T12:00:55Z"), at("2026-09-15T12:02:00Z")]);
  assert.equal(clipAt(at("2026-09-15T13:00:00Z"), recorded), null);
});

test("classes are said as people say them", () => {
  const base = { id: "1", camera: "c", started_at: "", ended_at: null };
  assert.equal(what({ ...base, kind: "motion" }), "motion");
  assert.equal(what({ ...base, kind: "object", label: "car" }), "vehicle");
  assert.equal(what({ ...base, kind: "object", label: "dog" }), "animal");
  assert.equal(what({ ...base, kind: "object", label: "person" }), "person");
  assert.equal(what({ ...base, kind: "object", label: "umbrella" }), "other");
});

test("the window moves through time and stops at the present", () => {
  const now = at("2026-09-17T12:00:00Z");
  const window = { from: at("2026-09-17T11:00:00Z"), to: now };

  // Half a window back, and back again.
  const back = moved(window, -0.5, now);
  assert.equal(new Date(back.from).toISOString(), "2026-09-17T10:30:00.000Z");
  assert.equal(new Date(back.to).toISOString(), "2026-09-17T11:30:00.000Z");
  assert.equal(new Date(moved(back, -0.5, now).to).toISOString(), "2026-09-17T11:00:00.000Z");

  // Forward from there, and never past now however far it is pushed.
  assert.equal(new Date(moved(back, 0.5, now).to).toISOString(), "2026-09-17T12:00:00.000Z");
  assert.equal(moved(window, 5, now).to, now);
  assert.equal(moved(window, 5, now).to - moved(window, 5, now).from, 3_600_000);
});

test("zooming keeps the middle and knows how close and how far it may go", () => {
  const now = at("2026-09-17T12:00:00Z");
  const window = { from: at("2026-09-17T10:00:00Z"), to: at("2026-09-17T11:00:00Z") };
  const middle = (window.from + window.to) / 2;

  const closer = scaled(window, 0.5, now);
  assert.equal(closer.to - closer.from, 1_800_000);
  assert.equal((closer.from + closer.to) / 2, middle);

  const further = scaled(window, 4, now);
  assert.equal(further.to - further.from, 4 * 3_600_000);

  // Never narrower than a quarter of an hour, never wider than a week.
  assert.equal(scaled(window, 0.0001, now).to - scaled(window, 0.0001, now).from, NARROWEST);
  assert.equal(scaled(window, 1000, now).to - scaled(window, 1000, now).from, WIDEST);
  // And never showing the future: a window zoomed out at the present ends now.
  assert.equal(scaled({ from: now - 3_600_000, to: now }, 4, now).to, now);
});

test("the timeline draws the rows Vurio's own does, objects and plates among them", () => {
  assert.deepEqual([...ROWS], ["motion", "person", "vehicle", "animal", "other", "plate"]);

  const detections = [
    { camera: "cave", group: "other", started_at: "2026-09-17T10:00:00Z", ended_at: "2026-09-17T10:00:30Z" },
    { camera: "cave", group: "plate", started_at: "2026-09-17T10:05:00Z", ended_at: "2026-09-17T10:05:10Z" },
  ];
  const drawn = rows(detections, "cave", at("2026-09-17T10:00:00Z"), at("2026-09-17T11:00:00Z"), at("2026-09-17T11:00:00Z"));

  assert.equal(drawn.other.length, 1);
  assert.equal(drawn.plate.length, 1);
  assert.equal(drawn.person.length, 0);
});
