import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceGeoJsonPath = path.join(root, "public", "Hidalgo.geojson");
const regionalizationPath = path.join(
  root,
  "src",
  "components",
  "Tool",
  "MunicipalityLocator",
  "regionalizacionHidalgo.js"
);
const publicDataDirectory = path.join(root, "public", "data");
const sourceDataDirectory = path.join(root, "src", "data", "conocesHidalgo");
const aliasOverrides = {
  "Mineral de la Reforma": ["Mineral Reforma"],
  "Pachuca de Soto": ["Pachuca"],
  "Santiago Tulantepec de Lugo Guerrero": ["Santiago Tulantepec"],
  "Tepeji del Rio de Ocampo": ["Tepeji del Rio", "Tepeji"],
  "Tulancingo de Bravo": ["Tulancingo"],
};

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseRegionalization(source) {
  const json = source
    .replace(/^export const REGIONALIZACION_HIDALGO = /, "")
    .replace(/;\s*$/, "");

  return JSON.parse(json);
}

function getRegionParts(regionLabel) {
  const match = String(regionLabel).match(/^(\d+)\.\s*(.+)$/);

  return match
    ? { id: match[1], name: match[2] }
    : { id: slugify(regionLabel), name: regionLabel };
}

function perpendicularDistance(point, start, end) {
  const [x, y] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.hypot(x - x1, y - y1);
  }

  const numerator = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1);
  return numerator / Math.hypot(dx, dy);
}

function simplifyLine(points, tolerance) {
  if (points.length <= 3) return points;

  const first = points[0];
  const last = points[points.length - 1];
  let maxDistance = 0;
  let splitIndex = 0;

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = perpendicularDistance(points[index], first, last);

    if (distance > maxDistance) {
      maxDistance = distance;
      splitIndex = index;
    }
  }

  if (maxDistance <= tolerance) {
    return [first, last];
  }

  const left = simplifyLine(points.slice(0, splitIndex + 1), tolerance);
  const right = simplifyLine(points.slice(splitIndex), tolerance);

  return [...left.slice(0, -1), ...right];
}

function simplifyRing(ring, tolerance) {
  if (ring.length <= 5) return ring;

  const openRing = ring.slice(0, -1);
  const simplified = simplifyLine([...openRing, openRing[0]], tolerance);

  if (simplified.length < 4) return ring;

  simplified[simplified.length - 1] = simplified[0];
  return simplified;
}

function simplifyGeometry(geometry, tolerance = 0.0007) {
  if (geometry.type === "Polygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) => simplifyRing(ring, tolerance)),
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((ring) => simplifyRing(ring, tolerance))
      ),
    };
  }

  throw new Error(`Geometria no compatible: ${geometry.type}`);
}

function getClues(municipality) {
  const wordCount = municipality.officialName.split(/\s+/).length;
  const nameHint =
    wordCount === 1
      ? "Su nombre oficial esta formado por una sola palabra."
      : `Su nombre oficial esta formado por ${wordCount} palabras.`;

  return [
    `Pertenece a la region ${municipality.regionName}.`,
    `Forma parte de la macrorregion ${municipality.macroregionName}.`,
    `Su microrregion es ${municipality.microregionName}.`,
    `${nameHint} Comienza con la letra ${municipality.officialName[0].toLocaleUpperCase("es-MX")}.`,
  ];
}

const [geoJsonSource, regionalizationSource] = await Promise.all([
  readFile(sourceGeoJsonPath, "utf8"),
  readFile(regionalizationPath, "utf8"),
]);
const geoJson = JSON.parse(geoJsonSource);
const regionalization = parseRegionalization(regionalizationSource);

if (geoJson.type !== "FeatureCollection" || geoJson.features.length !== 84) {
  throw new Error("Hidalgo.geojson debe contener exactamente 84 features.");
}

if (regionalization.length !== 84) {
  throw new Error("El catalogo regional debe contener exactamente 84 municipios.");
}

const regionalizationByName = new Map(
  regionalization.map((item) => [normalizeText(item.municipio), item])
);
const usedIds = new Set();
const usedNames = new Set();

const municipalities = geoJson.features
  .map((feature) => {
    const id = String(feature.properties.CVEGEO ?? "");
    const officialName = String(feature.properties.NOMGEO ?? "");
    const normalizedName = normalizeText(officialName);
    const regionalData = regionalizationByName.get(normalizedName);

    if (!id || !officialName || !regionalData) {
      throw new Error(`Feature sin correspondencia: ${id || "sin clave"} ${officialName || "sin nombre"}`);
    }

    if (usedIds.has(id) || usedNames.has(normalizedName)) {
      throw new Error(`Feature duplicada: ${id} ${officialName}`);
    }

    usedIds.add(id);
    usedNames.add(normalizedName);

    const region = getRegionParts(regionalData.region);

    return {
      id,
      officialName,
      slug: slugify(officialName),
      aliases: Array.from(
        new Set([
          officialName,
          ...(regionalData.aliases || []),
          ...(aliasOverrides[officialName] || []),
        ])
      ),
      regionId: region.id,
      regionName: region.name,
      regionLabel: regionalData.region,
      macroregionName: regionalData.macrorregion,
      microregionName: regionalData.microrregion,
    };
  })
  .sort((a, b) => a.officialName.localeCompare(b.officialName, "es"));

const municipalityById = new Map(municipalities.map((item) => [item.id, item]));
const regions = Array.from(
  new Map(
    municipalities.map((item) => [
      item.regionId,
      { id: item.regionId, name: item.regionName, label: item.regionLabel },
    ])
  ).values()
).sort((a, b) => Number(a.id) - Number(b.id));
const clues = municipalities.map((municipality) => ({
  municipalityId: municipality.id,
  clues: getClues(municipality),
}));
const webGeoJson = {
  type: "FeatureCollection",
  features: geoJson.features.map((feature) => {
    const id = String(feature.properties.CVEGEO);
    const municipality = municipalityById.get(id);

    return {
      type: "Feature",
      properties: {
        id,
        name: municipality.officialName,
        slug: municipality.slug,
        regionId: municipality.regionId,
        regionName: municipality.regionName,
      },
      geometry: simplifyGeometry(feature.geometry),
    };
  }),
};

await Promise.all([
  mkdir(publicDataDirectory, { recursive: true }),
  mkdir(sourceDataDirectory, { recursive: true }),
]);

await Promise.all([
  writeFile(
    path.join(publicDataDirectory, "hidalgo-municipios.geojson"),
    JSON.stringify(webGeoJson),
    "utf8"
  ),
  writeFile(
    path.join(sourceDataDirectory, "hidalgo-municipios.json"),
    `${JSON.stringify(municipalities, null, 2)}\n`,
    "utf8"
  ),
  writeFile(
    path.join(sourceDataDirectory, "hidalgo-regiones.json"),
    `${JSON.stringify(regions, null, 2)}\n`,
    "utf8"
  ),
  writeFile(
    path.join(sourceDataDirectory, "hidalgo-pistas.json"),
    `${JSON.stringify(clues, null, 2)}\n`,
    "utf8"
  ),
]);

console.log(
  `Datos preparados: ${municipalities.length} municipios, ${regions.length} regiones, ${clues.length} grupos de pistas.`
);
