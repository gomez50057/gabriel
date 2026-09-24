import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

async function readJson(...segments) {
  const content = await readFile(path.join(root, ...segments), "utf8");
  return JSON.parse(content);
}

test("catalogo, pistas y GeoJSON conservan correspondencia uno a uno", async () => {
  const [municipalities, clueGroups, geoJson] = await Promise.all([
    readJson("src", "data", "conocesHidalgo", "hidalgo-municipios.json"),
    readJson("src", "data", "conocesHidalgo", "hidalgo-pistas.json"),
    readJson("public", "data", "hidalgo-municipios.geojson"),
  ]);
  const municipalityIds = municipalities.map((item) => item.id);
  const geoJsonIds = geoJson.features.map((feature) => feature.properties.id);
  const clueIds = clueGroups.map((item) => item.municipalityId);

  assert.equal(municipalities.length, 84);
  assert.equal(new Set(municipalityIds).size, 84);
  assert.equal(geoJson.features.length, 84);
  assert.equal(new Set(geoJsonIds).size, 84);
  assert.equal(clueGroups.length, 84);
  assert.ok(clueGroups.every((item) => item.clues.length >= 4));
  assert.deepEqual([...geoJsonIds].sort(), [...municipalityIds].sort());
  assert.deepEqual([...clueIds].sort(), [...municipalityIds].sort());
});
