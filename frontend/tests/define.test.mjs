import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";

const source = await readFile(new URL("../src/define.ts", import.meta.url), "utf8");
const { keepDefined } = await import(
  "data:text/javascript;base64," + Buffer.from(stripTypeScriptTypes(source)).toString("base64")
);

/** A registry that, like the real one, takes each name and constructor once. */
function registry() {
  const byName = new Map();
  return {
    byName,
    get: (name) => byName.get(name),
    define(name, element) {
      if (byName.has(name)) throw new Error(`"${name}" has already been used with this registry`);
      if ([...byName.values()].includes(element)) throw new Error("this constructor has already been used");
      byName.set(name, element);
    },
  };
}

class Live {}
class Card {}
const ELEMENTS = [
  ["vurio-live", Live],
  ["vurio-card", Card],
];

function page() {
  let current = registry();
  let check;
  keepDefined(
    ELEMENTS,
    () => current,
    (next) => (check = next),
  );
  return {
    get current() {
      return current;
    },
    swap(next) {
      current = next;
    },
    tick: () => check(),
  };
}

test("both elements are defined straight away", () => {
  const p = page();
  assert.equal(p.current.get("vurio-live"), Live);
  assert.equal(p.current.get("vurio-card"), Card);
});

test("a registry swapped in later gets the elements too", () => {
  const p = page();
  const polyfilled = registry();
  p.swap(polyfilled);
  assert.equal(polyfilled.get("vurio-card"), undefined, "nothing until the next check");
  p.tick();
  assert.equal(polyfilled.get("vurio-live"), Live);
  assert.equal(polyfilled.get("vurio-card"), Card);
});

test("a registry that already knows the constructor gets a subclass of it", () => {
  const p = page();
  const polyfilled = registry();
  polyfilled.byName.set("something-else", Card);
  p.swap(polyfilled);
  p.tick();
  const defined = polyfilled.get("vurio-card");
  assert.notEqual(defined, Card);
  assert.ok(defined.prototype instanceof Card);
});

test("an unchanged registry is left alone, and a refusing one is not asked again", () => {
  const p = page();
  let asked = 0;
  const stubborn = {
    get: () => undefined,
    define() {
      asked += 1;
      throw new Error("no");
    },
  };
  p.tick();
  p.swap(stubborn);
  p.tick();
  const once = asked;
  p.tick();
  p.tick();
  assert.equal(asked, once);
});
