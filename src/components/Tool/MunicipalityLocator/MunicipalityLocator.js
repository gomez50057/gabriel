"use client";

import { useMemo, useState } from "react";
import styles from "./MunicipalityLocator.module.css";
import { REGIONALIZACION_HIDALGO } from "./regionalizacionHidalgo";
import {
  LOCALIDADES_HIDALGO,
  MUNICIPALITY_LOCALITIES_SOURCE,
} from "./municipalityLocalities";

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMunicipalitySearchValues(item) {
  return [
    item.municipio,
    ...(item.aliases || []),
  ].map(normalizeText);
}

function findExactMunicipality(query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return null;

  return REGIONALIZACION_HIDALGO.find((item) =>
    [item.municipio, ...(item.aliases || [])]
      .map(normalizeText)
      .includes(normalizedQuery)
  );
}

function sortMunicipalities(items) {
  return [...items].sort((a, b) =>
    a.municipio.localeCompare(b.municipio, "es", {
      sensitivity: "base",
    })
  );
}

const LOCALIDADES_BY_MUNICIPIO = new Map(
  LOCALIDADES_HIDALGO.map((item) => [
    normalizeText(item.municipio),
    item,
  ])
);

const TEXT_FORMAT_OPTIONS = [
  { value: "upper", label: "Mayúsculas" },
  { value: "title", label: "Capitalizar" },
  { value: "lower", label: "Minúsculas" },
];

const LOWERCASE_TITLE_WORDS = new Set([
  "a",
  "al",
  "ante",
  "bajo",
  "con",
  "contra",
  "de",
  "del",
  "desde",
  "durante",
  "e",
  "el",
  "en",
  "entre",
  "hacia",
  "hasta",
  "la",
  "las",
  "lo",
  "los",
  "mediante",
  "ni",
  "o",
  "para",
  "pero",
  "por",
  "según",
  "sin",
  "sobre",
  "tras",
  "u",
  "un",
  "una",
  "unas",
  "unos",
  "versus",
  "vía",
  "y",
]);

function isInactiveLocality(locality) {
  return normalizeText(locality?.estatus) === "baja";
}

function getMunicipalityLocalityData(municipio) {
  return LOCALIDADES_BY_MUNICIPIO.get(normalizeText(municipio)) || null;
}

function getMunicipalityLocalities(municipio, includeBajas = false) {
  const localities =
    getMunicipalityLocalityData(municipio)?.localidades || [];

  if (includeBajas) return localities;

  return localities.filter((locality) => !isInactiveLocality(locality));
}

function getLocalityName(locality) {
  return locality?.nombre ?? locality;
}

function formatNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number.toLocaleString("es-MX") : "N/D";
}

function getNumericValue(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getPopulationTotal(localities) {
  return localities.reduce(
    (total, locality) => total + getNumericValue(locality.poblacionTotal),
    0
  );
}

function capitalizeWord(value) {
  const lower = value.toLocaleLowerCase("es-MX");

  return lower.replace(/(^|[-'’])(\p{L})/gu, (match, separator, letter) =>
    `${separator}${letter.toLocaleUpperCase("es-MX")}`
  );
}

function toSmartTitleCase(value) {
  return String(value ?? "")
    .toLocaleLowerCase("es-MX")
    .split(/(\s+)/)
    .map((part, index) => {
      if (!part.trim()) return part;

      const normalized = normalizeText(part);

      if (index > 0 && LOWERCASE_TITLE_WORDS.has(normalized)) {
        return part;
      }

      return capitalizeWord(part);
    })
    .join("");
}

function formatOutputText(value, format) {
  const text = String(value ?? "");

  if (format === "lower") return text.toLocaleLowerCase("es-MX");
  if (format === "title") return toSmartTitleCase(text);

  return text.toLocaleUpperCase("es-MX");
}

function formatOutputItems(items, format) {
  return items.map((item) => formatOutputText(item, format));
}

function getEditableOtraLocality(value) {
  return {
    nombre: value.trim() || "Otra",
    estatus: "Editable",
    ambito: "",
    claveGeoestadistica: "",
    claveLocalidad: "",
    latitud: "",
    longitud: "",
    latDecimal: "",
    lonDecimal: "",
    altitud: "",
    poblacionTotal: "",
    poblacionMasculina: "",
    poblacionFemenina: "",
    viviendasHabitadas: "",
    editable: true,
  };
}

function getDownloadSlug(value) {
  return normalizeText(value).replace(/\s+/g, "-") || "municipio";
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dateToDosTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const day = (year - 1980) << 9 | (date.getMonth() + 1) << 5 | date.getDate();

  return { time, day };
}

function getCrcTable() {
  const table = [];

  for (let n = 0; n < 256; n += 1) {
    let crc = n;

    for (let k = 0; k < 8; k += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }

    table[n] = crc >>> 0;
  }

  return table;
}

const CRC_TABLE = getCrcTable();

function getCrc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(target, value) {
  target.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(target, value) {
  target.push(
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff
  );
}

function createZip(files) {
  const encoder = new TextEncoder();
  const { time, day } = dateToDosTime();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = encoder.encode(file.content);
    const crc = getCrc32(contentBytes);
    const localHeader = [];

    writeUint32(localHeader, 0x04034b50);
    writeUint16(localHeader, 20);
    writeUint16(localHeader, 0x0800);
    writeUint16(localHeader, 0);
    writeUint16(localHeader, time);
    writeUint16(localHeader, day);
    writeUint32(localHeader, crc);
    writeUint32(localHeader, contentBytes.length);
    writeUint32(localHeader, contentBytes.length);
    writeUint16(localHeader, nameBytes.length);
    writeUint16(localHeader, 0);

    localParts.push(new Uint8Array(localHeader), nameBytes, contentBytes);

    const centralHeader = [];
    writeUint32(centralHeader, 0x02014b50);
    writeUint16(centralHeader, 20);
    writeUint16(centralHeader, 20);
    writeUint16(centralHeader, 0x0800);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, time);
    writeUint16(centralHeader, day);
    writeUint32(centralHeader, crc);
    writeUint32(centralHeader, contentBytes.length);
    writeUint32(centralHeader, contentBytes.length);
    writeUint16(centralHeader, nameBytes.length);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint32(centralHeader, 0);
    writeUint32(centralHeader, offset);

    centralParts.push(new Uint8Array(centralHeader), nameBytes);
    offset += localHeader.length + nameBytes.length + contentBytes.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = [];

  writeUint32(endRecord, 0x06054b50);
  writeUint16(endRecord, 0);
  writeUint16(endRecord, 0);
  writeUint16(endRecord, files.length);
  writeUint16(endRecord, files.length);
  writeUint32(endRecord, centralSize);
  writeUint32(endRecord, offset);
  writeUint16(endRecord, 0);

  return new Blob([...localParts, ...centralParts, new Uint8Array(endRecord)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function getSingleColumnWorkbookBlob(items, sheetName = "Datos") {
  return getTableWorkbookBlob([sheetName], items.map((item) => [item]), sheetName);
}

function getColumnName(index) {
  let column = "";
  let value = index + 1;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    value = Math.floor((value - remainder) / 26);
  }

  return column;
}

function getTableWorkbookBlob(headers, rows, sheetName = "Datos") {
  const safeSheetName = escapeXml(String(sheetName).slice(0, 31) || "Datos");
  const allRows = [headers, ...rows];
  const sheetRows = allRows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = row
        .map((cell, columnIndex) => {
          const cellName = `${getColumnName(columnIndex)}${rowNumber}`;
          return `<c r="${cellName}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`;
        })
        .join("");

      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join("");
  const columnCount = Math.max(headers.length, 1);
  const columns = Array.from({ length: columnCount }, (_, index) => {
    const width = index === 0 ? 42 : 18;
    return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
  }).join("");
  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${columns}</cols>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;

  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${safeSheetName}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    },
    {
      name: "xl/worksheets/sheet1.xml",
      content: worksheet,
    },
  ]);
}

function getLocalityWorkbookRows(localities, textFormat) {
  return localities.map((locality) => [
    formatOutputText(getLocalityName(locality), textFormat),
    locality.estatus || "",
    locality.ambito || "",
    locality.claveGeoestadistica || "",
    locality.claveLocalidad || "",
    locality.latitud || "",
    locality.longitud || "",
    locality.latDecimal ?? "",
    locality.lonDecimal ?? "",
    locality.altitud ?? "",
    locality.poblacionTotal ?? "",
    locality.poblacionMasculina ?? "",
    locality.poblacionFemenina ?? "",
    locality.viviendasHabitadas ?? "",
  ]);
}

function downloadLocalitiesXlsx(municipio, localities, textFormat) {
  if (!municipio || !localities.length) return;

  const blob = getTableWorkbookBlob(
    [
      "Localidad",
      "Estatus",
      "Ámbito",
      "CVEGEO",
      "CVE_LOC",
      "Latitud",
      "Longitud",
      "Lat decimal",
      "Lon decimal",
      "Altitud",
      "Población total",
      "Población masculina",
      "Población femenina",
      "Viviendas habitadas",
    ],
    getLocalityWorkbookRows(localities, textFormat),
    "Localidades"
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `localidades-${getDownloadSlug(municipio)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadItemsXlsx(items, filename, sheetName) {
  if (!items.length) return;

  const blob = getSingleColumnWorkbookBlob(items, sheetName);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyItems(items) {
  const text = items.join("\n");

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function getRelatedMunicipalities(selectedMunicipality, field) {
  if (!selectedMunicipality) return [];

  return sortMunicipalities(
    REGIONALIZACION_HIDALGO.filter(
      (item) =>
        item[field] === selectedMunicipality[field] &&
        item.municipio !== selectedMunicipality.municipio
    )
  );
}

function RegionPath({ item }) {
  return (
    <small className={styles.regionPath}>
      <span>{item.region}</span>
      <span>{item.macrorregion}</span>
      <span>{item.microrregion}</span>
    </small>
  );
}

function RelatedDropdown({ title, items, onSelect }) {
  return (
    <details className={styles.dropdownBox}>
      <summary className={styles.dropdownSummary}>{title}</summary>

      {items.length > 0 ? (
        <div className={styles.relatedList}>
          {items.map((item) => (
            <button
              key={item.municipio}
              type="button"
              className={styles.relatedItem}
              onClick={() => onSelect(item.municipio)}
            >
              <span>{item.municipio}</span>
              <RegionPath item={item} />
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.emptyText}>
          No hay otros municipios registrados en este grupo.
        </p>
      )}
    </details>
  );
}

export default function MunicipalityLocator({ initialMunicipio = "" }) {
  const [query, setQuery] = useState(initialMunicipio);
  const [includeOtra, setIncludeOtra] = useState(true);
  const [includeBajas, setIncludeBajas] = useState(false);
  const [textFormat, setTextFormat] = useState("title");
  const [otraValue, setOtraValue] = useState("Otra");
  const [copyStatus, setCopyStatus] = useState("");
  const [municipalityCopyStatus, setMunicipalityCopyStatus] = useState("");

  const normalizedQuery = useMemo(() => normalizeText(query), [query]);

  const matches = useMemo(() => {
    if (!normalizedQuery) return [];

    return REGIONALIZACION_HIDALGO.filter((item) =>
      getMunicipalitySearchValues(item).some((value) =>
        value.includes(normalizedQuery)
      )
    ).slice(0, 12);
  }, [normalizedQuery]);

  const selectedMunicipality = useMemo(() => {
    const exactMatch = findExactMunicipality(query);

    if (exactMatch) return exactMatch;
    if (matches.length === 1) return matches[0];

    return null;
  }, [query, matches]);

  const relatedByRegion = useMemo(
    () => getRelatedMunicipalities(selectedMunicipality, "region"),
    [selectedMunicipality]
  );

  const relatedByMacrorregion = useMemo(
    () => getRelatedMunicipalities(selectedMunicipality, "macrorregion"),
    [selectedMunicipality]
  );

  const relatedByMicrorregion = useMemo(
    () => getRelatedMunicipalities(selectedMunicipality, "microrregion"),
    [selectedMunicipality]
  );

  const selectedLocalityData = useMemo(
    () =>
      selectedMunicipality
        ? getMunicipalityLocalityData(selectedMunicipality.municipio)
        : null,
    [selectedMunicipality]
  );

  const allSelectedLocalities = useMemo(
    () => selectedLocalityData?.localidades || [],
    [selectedLocalityData]
  );

  const officialSelectedLocalities = useMemo(
    () => {
      if (!selectedMunicipality) return [];

      return getMunicipalityLocalities(
        selectedMunicipality.municipio,
        includeBajas
      );
    },
    [selectedMunicipality, includeBajas]
  );

  const selectedLocalityRecords = useMemo(
    () => {
      if (!selectedMunicipality) return [];

      return includeOtra
        ? [...officialSelectedLocalities, getEditableOtraLocality(otraValue)]
        : officialSelectedLocalities;
    },
    [selectedMunicipality, officialSelectedLocalities, includeOtra, otraValue]
  );

  const selectedLocalities = useMemo(
    () =>
      formatOutputItems(
        selectedLocalityRecords.map(getLocalityName),
        textFormat
      ),
    [selectedLocalityRecords, textFormat]
  );

  const filteredPopulationTotal = useMemo(
    () => getPopulationTotal(officialSelectedLocalities),
    [officialSelectedLocalities]
  );

  const municipalPopulationTotal = useMemo(
    () =>
      getPopulationTotal(
        allSelectedLocalities.filter((locality) => !isInactiveLocality(locality))
      ),
    [allSelectedLocalities]
  );

  const localitySummary = selectedLocalityData?.resumen || {
    total: 0,
    activas: 0,
    bajas: 0,
    urbanas: 0,
    rurales: 0,
  };

  const sourceTotals = MUNICIPALITY_LOCALITIES_SOURCE.totales;

  const sourceSummary = useMemo(
    () =>
      `${sourceTotals.localidades.toLocaleString("es-MX")} localidades de ${sourceTotals.municipios} municipios`,
    [sourceTotals]
  );

  const municipalityNames = useMemo(
    () =>
      formatOutputItems(
        sortMunicipalities(REGIONALIZACION_HIDALGO).map((item) => item.municipio),
        textFormat
      ),
    [textFormat]
  );

  const populationRows = useMemo(
    () =>
      officialSelectedLocalities.map((locality) => ({
        key: locality.claveGeoestadistica || locality.nombre,
        nombre: formatOutputText(locality.nombre, textFormat),
        poblacionTotal: formatNumber(locality.poblacionTotal),
        poblacionMasculina: formatNumber(locality.poblacionMasculina),
        poblacionFemenina: formatNumber(locality.poblacionFemenina),
        viviendasHabitadas: formatNumber(locality.viviendasHabitadas),
        estatus: locality.estatus,
      })),
    [officialSelectedLocalities, textFormat]
  );

  const clearSearch = () => {
    setQuery("");
    setOtraValue("Otra");
    setCopyStatus("");
    setMunicipalityCopyStatus("");
  };

  const selectMunicipality = (municipio) => {
    setQuery(municipio);
    setOtraValue("Otra");
    setCopyStatus("");
  };

  return (
    <section className={styles.container} aria-labelledby="locator-title">
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>
            Regionalización del Estado de Hidalgo
          </span>

          <h2 id="locator-title" className={styles.title}>
            Consulta a dónde pertenece un municipio
          </h2>

          <p className={styles.description}>
            Busca un municipio para identificar su región, macrorregión y
            microrregión, y descarga sus localidades oficiales de INEGI.
          </p>
        </div>

        <div className={styles.counter}>
          <strong>{REGIONALIZACION_HIDALGO.length}</strong>
          <span>municipios cargados</span>

          <div className={styles.counterActions}>
            <label className={styles.formatControl}>
              <span>Formato</span>
              <select
                value={textFormat}
                onChange={(event) => {
                  setTextFormat(event.target.value);
                  setCopyStatus("");
                  setMunicipalityCopyStatus("");
                }}
              >
                {TEXT_FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={styles.counterButton}
              onClick={() =>
                downloadItemsXlsx(
                  municipalityNames,
                  "municipios-hidalgo.xlsx",
                  "Municipios"
                )
              }
            >
              Descargar XLSX
            </button>

            <button
              type="button"
              className={styles.counterButtonAlt}
              onClick={async () => {
                try {
                  await copyItems(municipalityNames);
                  setMunicipalityCopyStatus("copied");
                } catch {
                  setMunicipalityCopyStatus("error");
                }
              }}
            >
              Copiar
            </button>

            {municipalityCopyStatus && (
              <small
                className={`${styles.counterStatus} ${
                  municipalityCopyStatus === "error" ? styles.counterStatusError : ""
                }`}
                role="status"
              >
                {municipalityCopyStatus === "error"
                  ? "No se pudo copiar."
                  : "Municipios copiados."}
              </small>
            )}
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.searchCard}>
          <label className={styles.label} htmlFor="municipio-search">
            Municipio
          </label>

          <div className={styles.searchBox}>
            <input
              id="municipio-search"
              className={styles.input}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej. Pachuca, Tula, Zimapán..."
              autoComplete="off"
            />

            {query.length > 0 && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>

          <div className={styles.suggestions} aria-label="Sugerencias">
            {normalizedQuery && matches.length > 0 ? (
              matches.map((item) => {
                const isActive =
                  selectedMunicipality?.municipio === item.municipio;

                return (
                  <button
                    key={item.municipio}
                    type="button"
                    className={`${styles.suggestion} ${isActive ? styles.activeSuggestion : ""
                      }`}
                    onClick={() => selectMunicipality(item.municipio)}
                  >
                    <span className={styles.suggestionName}>
                      {item.municipio}
                    </span>

                    <RegionPath item={item} />
                  </button>
                );
              })
            ) : normalizedQuery ? (
              <p className={styles.emptyText}>
                No se encontró coincidencia. Revisa acentos o escribe otro
                municipio.
              </p>
            ) : (
              <p className={styles.emptyText}>
                Escribe el nombre de un municipio para iniciar la búsqueda.
              </p>
            )}
          </div>
        </aside>

        <div className={styles.resultCard}>
          {selectedMunicipality ? (
            <>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>
                  Municipio seleccionado
                </span>

                <h3>{selectedMunicipality.municipio}</h3>
              </div>

              <div className={styles.resultGrid}>
                <article className={styles.resultItem}>
                  <span>Región</span>
                  <strong>{selectedMunicipality.region}</strong>
                </article>

                <article className={styles.resultItem}>
                  <span>Macrorregión</span>
                  <strong>{selectedMunicipality.macrorregion}</strong>
                </article>

                <article className={styles.resultItem}>
                  <span>Microrregión</span>
                  <strong>{selectedMunicipality.microrregion}</strong>
                </article>
              </div>

              <div className={styles.localityStats}>
                <article>
                  <span>Clave municipal</span>
                  <strong>{selectedLocalityData?.claveMunicipio || "N/D"}</strong>
                </article>

                <article>
                  <span>Localidades activas</span>
                  <strong>{localitySummary.activas.toLocaleString("es-MX")}</strong>
                </article>

                <article>
                  <span>Población municipal</span>
                  <strong>{formatNumber(municipalPopulationTotal)}</strong>
                </article>

                <article>
                  <span>Bajas registradas</span>
                  <strong>{localitySummary.bajas.toLocaleString("es-MX")}</strong>
                </article>

                <article>
                  <span>Ámbito</span>
                  <strong>
                    {localitySummary.urbanas.toLocaleString("es-MX")} U /{" "}
                    {localitySummary.rurales.toLocaleString("es-MX")} R
                  </strong>
                </article>
              </div>

              <section className={styles.downloadPanel}>
                <div>
                  <span className={styles.downloadLabel}>
                    Colonias y localidades
                  </span>

                  <p className={styles.downloadText}>
                    {allSelectedLocalities.length > 0
                      ? `${selectedLocalityRecords.length.toLocaleString("es-MX")} registros listos. Población en lista: ${formatNumber(filteredPopulationTotal)}. ${includeBajas ? "Incluye bajas de INEGI." : "Solo activas por defecto."}`
                      : "No hay localidades cargadas para este municipio en el archivo fuente."}
                  </p>
                </div>

                <div className={styles.downloadActions}>
                  <div className={styles.optionStack}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={includeOtra}
                        onChange={(event) => {
                          setIncludeOtra(event.target.checked);
                          setCopyStatus("");
                        }}
                      />
                      <span>Incluir campo editable</span>
                    </label>

                    <input
                      className={styles.otraInput}
                      value={otraValue}
                      onChange={(event) => {
                        setOtraValue(event.target.value);
                        setCopyStatus("");
                      }}
                      disabled={!includeOtra}
                      aria-label="Texto editable para el campo OTRA"
                    />

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={includeBajas}
                        onChange={(event) => {
                          setIncludeBajas(event.target.checked);
                          setCopyStatus("");
                        }}
                      />
                      <span>Incluir bajas de INEGI</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    className={styles.downloadButton}
                    disabled={selectedLocalityRecords.length === 0}
                    onClick={() =>
                      downloadLocalitiesXlsx(
                        selectedMunicipality.municipio,
                        selectedLocalityRecords,
                        textFormat
                      )
                    }
                  >
                    Descargar XLSX detallado
                  </button>

                  <button
                    type="button"
                    className={styles.copyButton}
                    disabled={selectedLocalities.length === 0}
                    onClick={async () => {
                      try {
                        await copyItems(selectedLocalities);
                        setCopyStatus("copied");
                      } catch {
                        setCopyStatus("error");
                      }
                    }}
                  >
                    Copiar
                  </button>

                  {copyStatus && (
                    <p
                      className={`${styles.copyStatus} ${
                        copyStatus === "error" ? styles.copyStatusError : ""
                      }`}
                      role="status"
                    >
                      {copyStatus === "error"
                        ? "No se pudo copiar al portapapeles."
                        : "Localidades copiadas al portapapeles."}
                    </p>
                  )}
                </div>
              </section>

              <details className={styles.populationBox}>
                <summary className={styles.populationSummary}>
                  Población por colonia/localidad
                </summary>

                <div className={styles.populationList}>
                  {populationRows.length > 0 ? (
                    populationRows.map((locality) => (
                      <article key={locality.key} className={styles.populationItem}>
                        <div>
                          <strong>{locality.nombre}</strong>
                          <span>
                            {locality.estatus === "Baja"
                              ? "Baja INEGI"
                              : "Localidad activa"}
                          </span>
                        </div>

                        <dl>
                          <div>
                            <dt>Total</dt>
                            <dd>{locality.poblacionTotal}</dd>
                          </div>
                          <div>
                            <dt>Hombres</dt>
                            <dd>{locality.poblacionMasculina}</dd>
                          </div>
                          <div>
                            <dt>Mujeres</dt>
                            <dd>{locality.poblacionFemenina}</dd>
                          </div>
                          <div>
                            <dt>Viviendas</dt>
                            <dd>{locality.viviendasHabitadas}</dd>
                          </div>
                        </dl>
                      </article>
                    ))
                  ) : (
                    <p className={styles.emptyText}>
                      No hay población cargada para este municipio.
                    </p>
                  )}
                </div>
              </details>

              <div className={styles.dropdownStack}>
                <RelatedDropdown
                  title="Municipios en la misma región"
                  items={relatedByRegion}
                  onSelect={selectMunicipality}
                />

                <RelatedDropdown
                  title="Municipios en la misma macrorregión"
                  items={relatedByMacrorregion}
                  onSelect={selectMunicipality}
                />

                <RelatedDropdown
                  title="Municipios en la misma microrregión"
                  items={relatedByMicrorregion}
                  onSelect={selectMunicipality}
                />
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>⌕</span>

              <h3>Selecciona un municipio</h3>

              <p>
                Usa el buscador o las sugerencias para ver su región,
                macrorregión y microrregión.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className={styles.sourceNote}>
        Fuente:{" "}
        <a
          href={MUNICIPALITY_LOCALITIES_SOURCE.url}
          target="_blank"
          rel="noreferrer"
        >
          {MUNICIPALITY_LOCALITIES_SOURCE.institucion} AGEEML
        </a>
        . {sourceSummary}. Fecha de publicación:{" "}
        {MUNICIPALITY_LOCALITIES_SOURCE.fechaPublicacion}.
      </p>
    </section>
  );
}
