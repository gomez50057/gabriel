"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/shared/CopyButton";
import TextAutocomplete from "@/shared/TextAutocomplete/TextAutocomplete";
import { normalizeText } from "@/shared/TextAutocomplete/fuzzyTextSearch.mjs";
import styles from "./MunicipalityLocator.module.css";
import { REGIONALIZACION_HIDALGO } from "./regionalizacionHidalgo";
import {
  LOCALIDADES_HIDALGO,
  MUNICIPALITY_LOCALITIES_SOURCE,
} from "./municipalityLocalities";
import {
  INDIGENOUS_COMMUNITY_SOURCES,
  INDIGENOUS_COMMUNITIES,
} from "./indigenousCommunitiesHidalgo";

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

const REGIONAL_LEVELS = [
  { field: "region", label: "Región" },
  { field: "macrorregion", label: "Macrorregión" },
  { field: "microrregion", label: "Microrregión" },
];

const ZONES_BY_LEVEL = Object.fromEntries(
  REGIONAL_LEVELS.map(({ field }) => [
    field,
    [...new Set(REGIONALIZACION_HIDALGO.map((item) => item[field]))].sort((a, b) =>
      a.localeCompare(b, "es", { numeric: true })
    ),
  ])
);

const COMMUNITIES_BY_MUNICIPALITY = new Map();
for (const community of INDIGENOUS_COMMUNITIES) {
  const key = normalizeText(community.municipio);
  if (!COMMUNITIES_BY_MUNICIPALITY.has(key)) {
    COMMUNITIES_BY_MUNICIPALITY.set(key, []);
  }
  COMMUNITIES_BY_MUNICIPALITY.get(key).push(community);
}

function getMunicipalityCommunities(municipio) {
  return COMMUNITIES_BY_MUNICIPALITY.get(normalizeText(municipio)) || [];
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

function getMunicipalityLocalityData(municipio) {
  return LOCALIDADES_BY_MUNICIPIO.get(normalizeText(municipio)) || null;
}

function getMunicipalityLocalities(municipio) {
  return getMunicipalityLocalityData(municipio)?.localidades || [];
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
    tipo: "editable",
    tipoAsentamiento: "Editable",
    ambito: "",
    claveGeoestadistica: "",
    claveLocalidad: "",
    claveAsentamiento: "",
    claveGeoestadisticaLocalidad: "",
    localidad: "",
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
    locality.tipo === "asentamiento"
      ? "Asentamiento humano"
      : locality.tipo === "editable"
        ? "Editable"
        : "Localidad",
    formatOutputText(getLocalityName(locality), textFormat),
    locality.tipoAsentamiento || "",
    locality.localidad
      ? formatOutputText(locality.localidad, textFormat)
      : locality.tipo === "localidad"
        ? formatOutputText(locality.nombre, textFormat)
        : "",
    locality.claveGeoestadistica || "",
    locality.claveLocalidad || "",
    locality.claveAsentamiento || "",
    locality.claveGeoestadisticaLocalidad || "",
    locality.ambito || "",
    locality.periodo || "",
  ]);
}

function downloadLocalitiesXlsx(municipio, localities, textFormat) {
  if (!municipio || !localities.length) return;

  const blob = getTableWorkbookBlob(
    [
      "Tipo",
      "Nombre",
      "Tipo de asentamiento",
      "Localidad",
      "CVEGEO",
      "CVE_LOC",
      "CVE_ASEN",
      "CVEGEO_LOC",
      "Ámbito localidad",
      "Periodo",
    ],
    getLocalityWorkbookRows(localities, textFormat),
    "Asentamientos"
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `asentamientos-localidades-${getDownloadSlug(municipio)}.xlsx`;
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

function formatGroupLabel(field, value = "") {
  if (field === "region") {
    const [, number, name] = value.match(/^(\d+)\.\s*(.+)$/) || [];
    const fullName = name === "M. de la Reforma" ? "Mineral de la Reforma" : name;
    return number ? `Región ${number} ${fullName}` : value;
  }

  if (field === "macrorregion") return `Macrorregión ${value.replace(".", "")}`;
  if (field === "microrregion") return `Microrregión ${value}`;

  return value;
}

function getCopyText(parent, items, textFormat) {
  return [formatOutputText(parent, textFormat), ...formatOutputItems(items, textFormat)].join("\n");
}

function RegionPath({ item }) {
  return (
    <small className={styles.regionPath}>
      <span>{formatGroupLabel("region", item.region)}</span>
      <span>{formatGroupLabel("macrorregion", item.macrorregion)}</span>
      <span>{formatGroupLabel("microrregion", item.microrregion)}</span>
    </small>
  );
}

function CopyConsultationLink({ params, target }) {
  return (
    <CopyButton
      className={styles.copyButton}
      getText={() => {
        const url = new URL(window.location.pathname, window.location.origin);
        url.search = new URLSearchParams(params).toString();
        url.hash = target;
        return url.href;
      }}
      copiedText="Enlace de la consulta copiado."
    >
      Copiar enlace
    </CopyButton>
  );
}

function IndigenousSources() {
  return (
    <p className={styles.indigenousSourceNote}>
      Fuentes oficiales: {INDIGENOUS_COMMUNITY_SOURCES.map((source, index) => (
        <span key={source.id}>
          {index > 0 ? " · " : ""}
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.label}
          </a>
        </span>
      ))}
    </p>
  );
}

async function downloadRegionalizationXlsx(municipalities, filename) {
  const { utils, writeFileXLSX } = await import("@e965/xlsx");
  const workbook = utils.book_new();
  const municipalityRows = [[
    "Región", "Macrorregión", "Microrregión", "Municipio", "Registros indígenas",
  ]];
  const communityRows = [["Municipio", "Comunidad o localidad", "Fuentes", "Pueblo (INPI)"]];

  for (const item of municipalities) {
    const communities = getMunicipalityCommunities(item.municipio);
    municipalityRows.push([
      ...REGIONAL_LEVELS.map(({ field }) => formatGroupLabel(field, item[field])),
      item.municipio,
      communities.length,
    ]);
    for (const community of communities) {
      communityRows.push([
        item.municipio, community.localidad, community.fuentes.join(", "),
        community.pueblos.join(", "),
      ]);
    }
  }

  const municipalitySheet = utils.aoa_to_sheet(municipalityRows);
  municipalitySheet["!cols"] = [31, 28, 18, 35, 21].map((wch) => ({ wch }));
  municipalitySheet["!autofilter"] = { ref: municipalitySheet["!ref"] };

  const communitySheet = utils.aoa_to_sheet(communityRows);
  communitySheet["!cols"] = [35, 48, 18, 28].map((wch) => ({ wch }));
  communitySheet["!autofilter"] = { ref: communitySheet["!ref"] };

  utils.book_append_sheet(workbook, municipalitySheet, "Municipios");
  utils.book_append_sheet(workbook, communitySheet, "Comunidades indígenas");
  writeFileXLSX(workbook, filename);
}

function RegionalizationExplorer({ zone, onChange, onSelectMunicipality, initialOnlyIndigenous }) {
  const [onlyIndigenous, setOnlyIndigenous] = useState(initialOnlyIndigenous);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const options = ZONES_BY_LEVEL[zone.field];
  const zoneLabel = formatGroupLabel(zone.field, zone.value);
  const municipalities = zone.value
    ? sortMunicipalities(REGIONALIZACION_HIDALGO.filter((item) => item[zone.field] === zone.value))
    : [];
  const indigenousMunicipalities = municipalities.filter(
    (item) => getMunicipalityCommunities(item.municipio).length > 0
  );
  const shownMunicipalities = onlyIndigenous ? indigenousMunicipalities : municipalities;

  async function download(items, filename) {
    setIsDownloading(true);
    setDownloadError("");
    try {
      await downloadRegionalizationXlsx(items, filename);
    } catch {
      setDownloadError("No se pudo generar el Excel. Intenta descargarlo de nuevo.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section id="consulta-por-zona" className={styles.indigenousPanel} aria-labelledby="zone-title">
      <div className={styles.indigenousHeader}>
        <h3 id="zone-title" className={styles.indigenousTitle}>Municipios por zona</h3>
        <button
          type="button"
          className={styles.downloadButton}
          disabled={isDownloading}
          onClick={() => download(
            sortMunicipalities(REGIONALIZACION_HIDALGO).sort((a, b) =>
              a.region.localeCompare(b.region, "es", { numeric: true })
            ),
            "regiones-y-municipios-hidalgo.xlsx"
          )}
        >
          Descargar listado estatal XLSX
        </button>
      </div>

      <div className={styles.zoneControls}>
        <label className={styles.zoneField}>
          <span>Nivel de consulta</span>
          <select value={zone.field} onChange={(event) => onChange({ field: event.target.value, value: "" })}>
            {REGIONAL_LEVELS.map(({ field, label }) => (
              <option key={field} value={field}>{label}</option>
            ))}
          </select>
        </label>
        <label className={styles.zoneField}>
          <span>Zona</span>
          <select value={zone.value} onChange={(event) => onChange({ ...zone, value: event.target.value })}>
            <option value="">Selecciona una zona</option>
            {options.map((value) => (
              <option key={value} value={value}>{formatGroupLabel(zone.field, value)}</option>
            ))}
          </select>
        </label>
      </div>

      {zone.value && (
        <>
          <p className={styles.indigenousDescription} aria-live="polite">
            {municipalities.length} municipios · {indigenousMunicipalities.length} con registros indígenas
          </p>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={onlyIndigenous}
              onChange={(event) => setOnlyIndigenous(event.target.checked)}
            />
            Solo municipios con registros indígenas
          </label>
          <div className={styles.zoneActions}>
            <CopyButton
              className={styles.copyButton}
              text={[zoneLabel, ...shownMunicipalities.map((item) => item.municipio)].join("\n")}
              disabled={!shownMunicipalities.length}
              copiedText="Lista de municipios copiada."
            >
              Copiar municipios
            </CopyButton>
            <button
              type="button"
              className={styles.downloadButton}
              disabled={isDownloading || !shownMunicipalities.length}
              onClick={() => download(shownMunicipalities, `${getDownloadSlug(zoneLabel)}-municipios.xlsx`)}
            >
              Descargar zona XLSX
            </button>
            <CopyConsultationLink
              params={{ nivel: zone.field, zona: zone.value, ...(onlyIndigenous && { indigenas: "1" }) }}
              target="consulta-por-zona"
            />
          </div>
          {shownMunicipalities.length > 0 ? (
            <ul className={styles.zoneList} aria-label={`Municipios de ${zoneLabel}`}>
              {shownMunicipalities.map((item) => {
                const count = getMunicipalityCommunities(item.municipio).length;
                return (
                  <li key={item.municipio}>
                    <button type="button" className={styles.relatedItem} onClick={() => onSelectMunicipality(item.municipio)}>
                      <span>{item.municipio}</span>
                      <small className={styles.indigenousDescription}>
                        {count > 0 ? `${count} ${count === 1 ? "registro indígena" : "registros indígenas"}` : "Sin registros en los catálogos"}
                      </small>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.emptyText}>No hay municipios con registros indígenas en esta zona.</p>
          )}
        </>
      )}
      {downloadError && <p className={styles.emptyText} role="alert">{downloadError}</p>}
      <IndigenousSources />
    </section>
  );
}

export default function MunicipalityLocator({ initialMunicipio = "", initialZone, initialOnlyIndigenous = false }) {
  const [query, setQuery] = useState(initialMunicipio);
  const [zone, setZone] = useState(() => {
    const level = REGIONAL_LEVELS.find(({ field }) => field === initialZone?.field);
    return level && ZONES_BY_LEVEL[level.field].includes(initialZone?.value)
      ? { field: level.field, value: initialZone.value }
      : { field: "region", value: "" };
  });
  const [includeOtra, setIncludeOtra] = useState(true);
  const [includeLocalidades, setIncludeLocalidades] = useState(true);
  const [includeAsentamientos, setIncludeAsentamientos] = useState(true);
  const [textFormat, setTextFormat] = useState("title");
  const [otraValue, setOtraValue] = useState("Otra");
  const selectedMunicipality = useMemo(() => {
    const exactMatch = findExactMunicipality(query);

    if (exactMatch) return exactMatch;

    return null;
  }, [query]);

  const selectedIndigenousCommunityItems = getMunicipalityCommunities(selectedMunicipality?.municipio);

  const indigenousCommunityCopyText = useMemo(
    () =>
      selectedMunicipality
        ? [
            `Municipio ${selectedMunicipality.municipio}`,
            "Comunidades y localidades indígenas:",
            ...selectedIndigenousCommunityItems.map((item) => {
              const pueblos = item.pueblos.length
                ? ` — Pueblo INPI: ${item.pueblos.join(", ")}`
                : "";

              return `${item.localidad} — ${item.fuentes.join(" + ")}${pueblos}`;
            }),
          ].join("\n")
        : "",
    [selectedMunicipality, selectedIndigenousCommunityItems]
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

      return getMunicipalityLocalities(selectedMunicipality.municipio);
    },
    [selectedMunicipality]
  );

  const selectedLocalityRecords = useMemo(
    () => {
      if (!selectedMunicipality) return [];

      const records = [];

      if (includeLocalidades) {
        records.push(...officialSelectedLocalities);
      }

      if (includeAsentamientos) {
        officialSelectedLocalities.forEach((locality) => {
          records.push(...(locality.asentamientosHumanos || []));
        });
      }

      return includeOtra
        ? [...records, getEditableOtraLocality(otraValue)]
        : records;
    },
    [
      selectedMunicipality,
      officialSelectedLocalities,
      includeLocalidades,
      includeAsentamientos,
      includeOtra,
      otraValue,
    ]
  );

  const selectedLocalities = useMemo(
    () =>
      formatOutputItems(
        selectedLocalityRecords.map(getLocalityName),
        textFormat
      ),
    [selectedLocalityRecords, textFormat]
  );

  const selectedLocalitiesCopyText = useMemo(
    () =>
      selectedMunicipality
        ? getCopyText(
            `Municipio ${selectedMunicipality.municipio}`,
            selectedLocalityRecords.map(getLocalityName),
            textFormat
          )
        : "",
    [selectedMunicipality, selectedLocalityRecords, textFormat]
  );

  const municipalPopulationTotal = useMemo(
    () => getNumericValue(selectedLocalityData?.resumen?.poblacionTotal),
    [selectedLocalityData]
  );

  const localitySummary = selectedLocalityData?.resumen || {
    total: 0,
    localidades: 0,
    asentamientos: 0,
    urbanas: 0,
    rurales: 0,
    poblacionTotal: 0,
  };

  const sourceTotals = MUNICIPALITY_LOCALITIES_SOURCE.totales;

  const sourceSummary = useMemo(
    () =>
      `${sourceTotals.localidades.toLocaleString("es-MX")} localidades y ${sourceTotals.asentamientosHumanos.toLocaleString("es-MX")} asentamientos humanos de ${sourceTotals.municipios} municipios`,
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

  const selectMunicipality = () => {
    setOtraValue("Otra");
  };

  function openMunicipality(municipio) {
    setQuery(municipio);
    selectMunicipality();
    document.getElementById("municipio-seleccionado")?.focus();
  }

  return (
    <section className={styles.container} aria-labelledby="locator-title">
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>
            Regionalización del Estado de Hidalgo
          </span>

          <h2 id="locator-title" className={styles.title}>
            Explora municipios y regiones de Hidalgo
          </h2>

          <p className={styles.description}>
            Busca un municipio o consulta una zona para ver sus municipios y registros indígenas.
          </p>
        </div>

        <div className={styles.counter}>
          <strong>{REGIONALIZACION_HIDALGO.length}</strong>
          <span>municipios cargados</span>
          <small className={styles.counterMeta}>
            {sourceTotals.localidades.toLocaleString("es-MX")} localidades ·{" "}
            {sourceTotals.asentamientosHumanos.toLocaleString("es-MX")} asentamientos
          </small>

          <div className={styles.counterActions}>
            <label className={styles.formatControl}>
              <span>Formato</span>
              <select
                value={textFormat}
                onChange={(event) => setTextFormat(event.target.value)}
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

            <CopyButton
              text={municipalityNames.join("\n")}
              className={styles.counterButtonAlt}
              copiedText="Municipios copiados."
              errorText="No se pudo copiar."
            >
              Copiar
            </CopyButton>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.searchCard}>
          <TextAutocomplete
            id="municipio-search"
            label="Municipio"
            value={query}
            onChange={setQuery}
            onSelect={selectMunicipality}
            onClear={() => setOtraValue("Otra")}
            options={REGIONALIZACION_HIDALGO}
            getOptionLabel={(item) => item.municipio}
            getSearchValues={getMunicipalitySearchValues}
            getOptionKey={(item) => item.municipio}
            selectedKey={selectedMunicipality?.municipio}
            renderOption={(item) => (
              <>
                <span className={styles.suggestionName}>{item.municipio}</span>
                <RegionPath item={item} />
              </>
            )}
            placeholder="Ej. Pachuca, Tula, Zimapán..."
            promptText="Escribe el nombre de un municipio para iniciar la búsqueda."
            emptyText="No se encontró coincidencia. Intenta con otro municipio."
            classNames={{
              label: styles.label,
              inputWrapper: styles.searchBox,
              input: styles.input,
              clearButton: styles.clearBtn,
              list: styles.suggestions,
              option: styles.suggestion,
              selectedOption: styles.activeSuggestion,
              activeOption: styles.activeSuggestion,
              empty: styles.emptyText,
            }}
          />
          <a className={styles.zoneShortcut} href="#consulta-por-zona">
            Consultar municipios por zona
          </a>
        </aside>

        <div id="municipio-seleccionado" className={styles.resultCard} tabIndex={-1}>
          {selectedMunicipality ? (
            <>
              <div className={styles.resultHeader}>
                <div>
                  <span className={styles.resultLabel}>Municipio seleccionado</span>
                  <h3>{selectedMunicipality.municipio}</h3>
                </div>
                <CopyConsultationLink
                  params={{ municipio: selectedMunicipality.municipio }}
                  target="municipio-seleccionado"
                />
              </div>

              <div className={styles.resultGrid}>
                {REGIONAL_LEVELS.map(({ field, label }) => (
                  <a
                    key={field}
                    className={`${styles.resultItem} ${styles.zoneCard}`}
                    href="#consulta-por-zona"
                    onClick={() => setZone({ field, value: selectedMunicipality[field] })}
                  >
                    <span>{label}</span>
                    <strong>{formatGroupLabel(field, selectedMunicipality[field])}</strong>
                    <small>Ver municipios</small>
                  </a>
                ))}
              </div>

              <div className={styles.localityStats}>
                <article>
                  <span>Clave municipal</span>
                  <strong>{selectedLocalityData?.claveMunicipio || "N/D"}</strong>
                </article>

                <article>
                  <span>Localidades</span>
                  <strong>{localitySummary.localidades.toLocaleString("es-MX")}</strong>
                </article>

                <article>
                  <span>Población municipal</span>
                  <strong>{formatNumber(municipalPopulationTotal)}</strong>
                </article>

                <article>
                  <span>Asentamientos</span>
                  <strong>{localitySummary.asentamientos.toLocaleString("es-MX")}</strong>
                </article>

                <article>
                  <span>Ámbito</span>
                  <strong>
                    {localitySummary.urbanas.toLocaleString("es-MX")} U /{" "}
                    {localitySummary.rurales.toLocaleString("es-MX")} R
                  </strong>
                </article>
              </div>

              <section
                className={styles.indigenousPanel}
                aria-labelledby="indigenous-communities-title"
              >
                <div className={styles.indigenousHeader}>
                  <div>
                    <h4
                      id="indigenous-communities-title"
                      className={styles.indigenousTitle}
                    >
                      Comunidades y localidades indígenas
                    </h4>
                    <p className={styles.indigenousDescription}>
                      {selectedIndigenousCommunityItems.length.toLocaleString("es-MX")} registros en una lista consolidada.
                    </p>
                  </div>

                  <CopyButton
                    text={indigenousCommunityCopyText}
                    className={styles.copyButton}
                    disabled={selectedIndigenousCommunityItems.length === 0}
                    copiedText="Lista copiada al portapapeles."
                    errorText="No se pudo copiar al portapapeles."
                  >
                    Copiar lista
                  </CopyButton>
                </div>

                {selectedIndigenousCommunityItems.length > 0 ? (
                  <ul className={styles.indigenousList}>
                    {selectedIndigenousCommunityItems.map((item) => (
                      <li
                        key={`${item.municipio}-${item.localidad}`}
                        className={styles.indigenousItem}
                      >
                        <span className={styles.indigenousName}>
                          {item.localidad}
                        </span>
                        <small className={styles.indigenousMeta}>
                          {item.fuentes.join(" · ")}
                          {item.pueblos.length > 0
                            ? ` · Pueblo INPI: ${item.pueblos.join(", ")}`
                            : ""}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyText}>
                    No hay registros para este municipio en los catálogos consultados.
                  </p>
                )}

                <IndigenousSources />
                <p className={styles.indigenousSourceNote}>
                  Las coincidencias se unifican por municipio y nombre normalizados. El pueblo indígena se muestra cuando lo registra INPI.
                </p>
              </section>

              <section className={styles.downloadPanel}>
                <div>
                  <span className={styles.downloadLabel}>
                    Asentamientos humanos y localidades
                  </span>

                  <p className={styles.downloadText}>
                    {allSelectedLocalities.length > 0
                      ? `${selectedLocalityRecords.length.toLocaleString("es-MX")} registros listos`
                      : "No hay asentamientos o localidades cargadas para este municipio en el archivo fuente."}
                  </p>
                </div>

                <div className={styles.downloadActions}>
                  <div className={styles.optionStack}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={includeOtra}
                        onChange={(event) => setIncludeOtra(event.target.checked)}
                      />
                      <span>Incluir campo editable</span>
                    </label>

                    <input
                      className={styles.otraInput}
                      value={otraValue}
                      onChange={(event) => setOtraValue(event.target.value)}
                      disabled={!includeOtra}
                      aria-label="Texto editable para el campo OTRA"
                    />

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={includeLocalidades}
                        onChange={(event) => setIncludeLocalidades(event.target.checked)}
                      />
                      <span>Incluir localidades</span>
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={includeAsentamientos}
                        onChange={(event) =>
                          setIncludeAsentamientos(event.target.checked)
                        }
                      />
                      <span>Incluir asentamientos humanos</span>
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
                    Descargar XLSX
                  </button>

                  <CopyButton
                    text={selectedLocalitiesCopyText}
                    className={styles.copyButton}
                    disabled={selectedLocalities.length === 0}
                    copiedText="Registros copiados al portapapeles."
                    errorText="No se pudo copiar al portapapeles."
                  >
                    Copiar
                  </CopyButton>
                </div>
              </section>

            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>⌕</span>

              <h3>Selecciona un municipio</h3>

              <p>
                Usa el buscador o las sugerencias para ver su región,
                macrorregión, microrregión y los registros comunitarios.
              </p>
            </div>
          )}
        </div>
      </div>

      <RegionalizationExplorer
        zone={zone}
        onChange={setZone}
        onSelectMunicipality={openMunicipality}
        initialOnlyIndigenous={initialOnlyIndigenous}
      />

      <p className={styles.sourceNote}>
        Fuente de asentamientos y localidades: {" "}
        <a
          href={MUNICIPALITY_LOCALITIES_SOURCE.url}
          target="_blank"
          rel="noreferrer"
        >
          {MUNICIPALITY_LOCALITIES_SOURCE.institucion} GAIA
        </a>
        . {sourceSummary}. Base:{" "}
        {MUNICIPALITY_LOCALITIES_SOURCE.baseUrl}. Entidad:{" "}
        {MUNICIPALITY_LOCALITIES_SOURCE.cveEnt} -{" "}
        {MUNICIPALITY_LOCALITIES_SOURCE.nomEnt}.
      </p>
    </section>
  );
}
