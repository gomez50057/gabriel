import assert from "node:assert/strict";
import test from "node:test";
import { buildMunicipalityLookup, findMunicipality, normalizeMunicipality } from "./normalizeMunicipality.mjs";
import { getMultipleChoiceOptions, sampleWithoutReplacement } from "./random.mjs";
import { createGameResult, getGuessPoints, getRecognition } from "./scoring.mjs";

test("normaliza acentos, signos y espacios", () => {
  assert.equal(normalizeMunicipality("  ZIMAPÁN  "), "zimapan");
  assert.equal(normalizeMunicipality("Francisco  I. Madero"), "francisco i madero");
});

test("resuelve alias controlados al nombre oficial", () => {
  const municipality = {
    id: "13048",
    officialName: "Pachuca de Soto",
    aliases: ["Pachuca"],
  };
  const lookup = buildMunicipalityLookup([municipality]);

  assert.equal(lookup.get("pachuca"), municipality);
});

test("el nivel flexible acepta parcialidades y omite acentos", () => {
  const municipalities = [{ officialName: "Pachuca de Soto", aliases: ["Pachuca"] }];

  assert.equal(findMunicipality("pachuca", municipalities, 1), municipalities[0]);
  assert.equal(findMunicipality("Pachuca de", municipalities, 1), municipalities[0]);
  assert.equal(findMunicipality("Pachuca de Soto", municipalities, 1), municipalities[0]);
});

test("el nivel exacto exige el nombre oficial con acentos", () => {
  const municipalities = [{ officialName: "Zimapán", aliases: ["Zimapan"] }];

  assert.equal(findMunicipality("Zimapán", municipalities, 2), municipalities[0]);
  assert.equal(findMunicipality("Zimapan", municipalities, 2), null);
  assert.equal(findMunicipality("ZIMAPÁN", municipalities, 2), null);
});

test("genera rondas y opciones sin duplicados", () => {
  const items = Array.from({ length: 10 }, (_, index) => ({ id: String(index) }));
  const round = sampleWithoutReplacement(items, 5, () => 0.25);
  const options = getMultipleChoiceOptions({
    correct: items[0],
    items,
    count: 4,
    random: () => 0.5,
  });

  assert.equal(new Set(round.map((item) => item.id)).size, 5);
  assert.equal(new Set(options.map((item) => item.id)).size, 4);
  assert.ok(options.some((item) => item.id === "0"));
});

test("calcula reconocimiento y resultado", () => {
  assert.equal(getRecognition(92), "Experto en Hidalgo");
  assert.equal(getRecognition(20), "Explorador de Hidalgo");
  assert.deepEqual(createGameResult({ score: 800, correct: 8, incorrect: 2, total: 10 }), {
    score: 800,
    correct: 8,
    incorrect: 2,
    total: 10,
    percentage: 80,
    recognition: "Gran conocedor del territorio",
    details: null,
  });
  assert.equal(getGuessPoints(1), 300);
  assert.equal(getGuessPoints(4), 100);
});
