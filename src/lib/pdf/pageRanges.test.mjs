import assert from "node:assert/strict";
import test from "node:test";
import { parsePageRange, parseRangeGroups } from "./pageRanges.mjs";

test("interpreta orden libre, rangos descendentes y grupos", () => {
  assert.deepEqual(parsePageRange("3, 1-2, 5-4", 5), [2, 0, 1, 4, 3]);
  assert.deepEqual(parseRangeGroups("1-2; 4,3", 4), [[0, 1], [3, 2]]);
  assert.throws(() => parsePageRange("1-8", 5), /entre 1 y 5/);
});
