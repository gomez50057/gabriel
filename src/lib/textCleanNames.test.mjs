import assert from "node:assert/strict";
import test from "node:test";
import { toCleanNames } from "./textCleanNames.js";

test("limpia acentos, simbolos y duplica nombres por linea", () => {
  assert.equal(
    toCleanNames("Fácilmente\nFácilmente\nFácilmente\nParagüero!\n"),
    "Facilmente\nFacilmente_2\nFacilmente_3\nParaguero\n"
  );
});

test("evita chocar con nombres que ya traen sufijo", () => {
  assert.equal(
    toCleanNames("Fácilmente\nFácilmente 2\nFácilmente"),
    "Facilmente\nFacilmente_2\nFacilmente_3"
  );
});
