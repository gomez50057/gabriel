import assert from "node:assert/strict";
import test from "node:test";
import { fuzzyFilter } from "./fuzzyTextSearch.mjs";

const options = ["Pachuca de Soto", "Tulancingo de Bravo", "Zimapán"];
const search = (query) => fuzzyFilter(options, query, (option) => [option]);

test("encuentra textos sin exigir acentos", () => {
  assert.deepEqual(search("zimapan"), ["Zimapán"]);
});

test("tolera letras omitidas y transpuestas", () => {
  assert.deepEqual(search("pachca"), ["Pachuca de Soto"]);
  assert.deepEqual(search("tulancigno"), ["Tulancingo de Bravo"]);
});

test("no aplica tolerancia excesiva a búsquedas cortas", () => {
  assert.deepEqual(search("pac"), ["Pachuca de Soto"]);
  assert.deepEqual(search("px"), []);
});
