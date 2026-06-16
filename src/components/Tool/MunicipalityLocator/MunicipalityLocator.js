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

const INDIGENOUS_COMMUNITY_MUNICIPALITIES = [
  "Acaxochitlán",
  "Alfajayucan",
  "Atlapexco",
  "Atotonilco el Grande",
  "Calnali",
  "Cardonal",
  "Chapulhuacán",
  "Chilcuautla",
  "Huasca de Ocampo",
  "Huautla",
  "Huazalingo",
  "Huehuetla",
  "Huejutla de Reyes",
  "Huichapan",
  "Ixmiquilpan",
  "Jaltocán",
  "Juárez Hidalgo",
  "Lolotla",
  "Metepec",
  "Metztitlán",
  "Mixquiahuala",
  "Molango de Escamilla",
  "Nicolás Flores",
  "Pachuca de Soto",
  "Pacula",
  "San Bartolo Tutotepec",
  "San Felipe Orizatlán",
  "San Salvador",
  "Santiago de Anaya",
  "Singuilucan",
  "Tasquillo",
  "Tecozautla",
  "Tenango de Doria",
  "Tepehuacán de Guerrero",
  "Tepeji del Río",
  "Tepetitlán",
  "Tianguistengo",
  "Tlanchinol",
  "Tula de Allende",
  "Tulancingo de Bravo",
  "Xochiatipan",
  "Yahualica",
  "Zacualtipán de Ángeles",
  "Zimapán",
];

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

function getUniqueGroupOptions(field) {
  return Array.from(
    new Set(REGIONALIZACION_HIDALGO.map((item) => item[field]).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function getMunicipalitiesByFieldValue(field, value) {
  if (!value) return [];

  return sortMunicipalities(
    REGIONALIZACION_HIDALGO.filter((item) => item[field] === value)
  );
}

function getMunicipalitySummary(municipio) {
  return getMunicipalityLocalityData(municipio)?.resumen || {
    poblacionTotal: 0,
    localidades: 0,
    asentamientos: 0,
  };
}

function getGroupSummary(items) {
  return items.reduce(
    (summary, item) => {
      const municipalitySummary = getMunicipalitySummary(item.municipio);

      return {
        municipios: summary.municipios + 1,
        poblacionTotal:
          summary.poblacionTotal +
          getNumericValue(municipalitySummary.poblacionTotal),
        localidades:
          summary.localidades + getNumericValue(municipalitySummary.localidades),
        asentamientos:
          summary.asentamientos +
          getNumericValue(municipalitySummary.asentamientos),
      };
    },
    {
      municipios: 0,
      poblacionTotal: 0,
      localidades: 0,
      asentamientos: 0,
    }
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

function GroupExplorer({
  title,
  label,
  emptyLabel,
  value,
  options,
  items,
  onChange,
  onSelect,
  onCopy,
  copyStatus,
  summary,
  disabled = false,
}) {
  return (
    <section className={styles.groupExplorer}>
      <div className={styles.groupExplorerHeader}>
        <div>
          <h3 className={styles.groupExplorerTitle}>{title}</h3>
          <p className={styles.groupExplorerText}>
            Selecciona un grupo para listar y copiar sus municipios.
          </p>
        </div>

        <button
          type="button"
          className={styles.groupCopyButton}
          disabled={disabled}
          onClick={onCopy}
        >
          Copiar municipios
        </button>
      </div>

      <label className={styles.groupSelectLabel}>
        <span>{label}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">{emptyLabel}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {copyStatus && (
        <p
          className={`${styles.copyStatus} ${
            copyStatus === "error" ? styles.copyStatusError : ""
          }`}
          role="status"
        >
          {copyStatus === "error"
            ? "No se pudo copiar al portapapeles."
            : "Municipios copiados al portapapeles."}
        </p>
      )}

      {value ? (
        <div className={styles.groupResults}>
          <div className={styles.groupMetrics}>
            <article>
              <strong>{items.length.toLocaleString("es-MX")}</strong>
              <span>municipios</span>
            </article>
            <article>
              <strong>{formatNumber(summary?.poblacionTotal)}</strong>
              <span>población municipal</span>
            </article>
            <article>
              <strong>{formatNumber(summary?.localidades)}</strong>
              <span>localidades</span>
            </article>
            <article>
              <strong>{formatNumber(summary?.asentamientos)}</strong>
              <span>asentamientos</span>
            </article>
          </div>

          {items.length > 0 ? (
            <div className={styles.relatedList}>
              {items.map((item) => (
                <button
                  key={`${title}-${item.municipio}`}
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
              No hay municipios registrados para este grupo.
            </p>
          )}
        </div>
      ) : (
        <p className={styles.emptyText}>
          Elige una opción para ver los municipios que pertenecen a ese grupo.
        </p>
      )}
    </section>
  );
}

export default function MunicipalityLocator({ initialMunicipio = "" }) {
  const [query, setQuery] = useState(initialMunicipio);
  const [includeOtra, setIncludeOtra] = useState(true);
  const [includeLocalidades, setIncludeLocalidades] = useState(true);
  const [includeAsentamientos, setIncludeAsentamientos] = useState(true);
  const [textFormat, setTextFormat] = useState("title");
  const [otraValue, setOtraValue] = useState("Otra");
  const [copyStatus, setCopyStatus] = useState("");
  const [municipalityCopyStatus, setMunicipalityCopyStatus] = useState("");
  const [selectedRegionGroup, setSelectedRegionGroup] = useState("");
  const [selectedMacrorregionGroup, setSelectedMacrorregionGroup] = useState("");
  const [selectedMicrorregionGroup, setSelectedMicrorregionGroup] = useState("");
  const [groupCopyStatus, setGroupCopyStatus] = useState({
    region: "",
    macrorregion: "",
    microrregion: "",
  });
  const [indigenousCopyStatus, setIndigenousCopyStatus] = useState("");

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

  const regionOptions = useMemo(
    () => getUniqueGroupOptions("region"),
    []
  );

  const macrorregionOptions = useMemo(
    () => getUniqueGroupOptions("macrorregion"),
    []
  );

  const microrregionOptions = useMemo(
    () => getUniqueGroupOptions("microrregion"),
    []
  );

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

  const indigenousMunicipalityItems = useMemo(() => {
    const wanted = new Set(
      INDIGENOUS_COMMUNITY_MUNICIPALITIES.map(normalizeText)
    );

    return sortMunicipalities(
      REGIONALIZACION_HIDALGO.filter((item) =>
        [item.municipio, ...(item.aliases || [])]
          .map(normalizeText)
          .some((value) => wanted.has(value))
      )
    );
  }, []);

  const indigenousMunicipalityNames = useMemo(
    () =>
      formatOutputItems(
        indigenousMunicipalityItems.map((item) => item.municipio),
        textFormat
      ),
    [indigenousMunicipalityItems, textFormat]
  );

  const regionMunicipalityItems = useMemo(
    () => getMunicipalitiesByFieldValue("region", selectedRegionGroup),
    [selectedRegionGroup]
  );

  const macrorregionMunicipalityItems = useMemo(
    () => getMunicipalitiesByFieldValue("macrorregion", selectedMacrorregionGroup),
    [selectedMacrorregionGroup]
  );

  const microrregionMunicipalityItems = useMemo(
    () => getMunicipalitiesByFieldValue("microrregion", selectedMicrorregionGroup),
    [selectedMicrorregionGroup]
  );

  const regionSummary = useMemo(
    () => getGroupSummary(regionMunicipalityItems),
    [regionMunicipalityItems]
  );

  const macrorregionSummary = useMemo(
    () => getGroupSummary(macrorregionMunicipalityItems),
    [macrorregionMunicipalityItems]
  );

  const microrregionSummary = useMemo(
    () => getGroupSummary(microrregionMunicipalityItems),
    [microrregionMunicipalityItems]
  );

  const regionMunicipalityNames = useMemo(
    () =>
      formatOutputItems(
        regionMunicipalityItems.map((item) => item.municipio),
        textFormat
      ),
    [regionMunicipalityItems, textFormat]
  );

  const macrorregionMunicipalityNames = useMemo(
    () =>
      formatOutputItems(
        macrorregionMunicipalityItems.map((item) => item.municipio),
        textFormat
      ),
    [macrorregionMunicipalityItems, textFormat]
  );

  const microrregionMunicipalityNames = useMemo(
    () =>
      formatOutputItems(
        microrregionMunicipalityItems.map((item) => item.municipio),
        textFormat
      ),
    [microrregionMunicipalityItems, textFormat]
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

  const handleGroupCopy = async (key, items) => {
    try {
      await copyItems(items);
      setGroupCopyStatus((current) => ({ ...current, [key]: "copied" }));
    } catch {
      setGroupCopyStatus((current) => ({ ...current, [key]: "error" }));
    }
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
            microrregión, y descarga sus asentamientos humanos y localidades.
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
                        checked={includeLocalidades}
                        onChange={(event) => {
                          setIncludeLocalidades(event.target.checked);
                          setCopyStatus("");
                        }}
                      />
                      <span>Incluir localidades</span>
                    </label>

                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={includeAsentamientos}
                        onChange={(event) => {
                          setIncludeAsentamientos(event.target.checked);
                          setCopyStatus("");
                        }}
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
                        : "Registros copiados al portapapeles."}
                    </p>
                  )}
                </div>
              </section>

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

      <details className={styles.groupSection}>
        <summary className={styles.groupSectionSummary}>
          <div className={styles.groupSectionHeader}>
            <h3 id="municipios-por-grupos" className={styles.groupSectionTitle}>
              Municipios por grupos
            </h3>
            <p className={styles.groupSectionText}>
              Explora municipios por región, macrorregión o microrregión y copia la lista completa.
            </p>
          </div>
        </summary>

        <div className={styles.groupExplorerStack}>
          <GroupExplorer
            title="Municipios por región"
            label="Región"
            emptyLabel="Selecciona una región"
            value={selectedRegionGroup}
            options={regionOptions}
            items={regionMunicipalityItems}
            onChange={(value) => {
              setSelectedRegionGroup(value);
              setGroupCopyStatus((current) => ({ ...current, region: "" }));
            }}
            onSelect={selectMunicipality}
            onCopy={() => handleGroupCopy("region", regionMunicipalityNames)}
            copyStatus={groupCopyStatus.region}
            summary={regionSummary}
            disabled={regionMunicipalityNames.length === 0}
          />

          <GroupExplorer
            title="Municipios por macrorregión"
            label="Macrorregión"
            emptyLabel="Selecciona una macrorregión"
            value={selectedMacrorregionGroup}
            options={macrorregionOptions}
            items={macrorregionMunicipalityItems}
            onChange={(value) => {
              setSelectedMacrorregionGroup(value);
              setGroupCopyStatus((current) => ({
                ...current,
                macrorregion: "",
              }));
            }}
            onSelect={selectMunicipality}
            onCopy={() =>
              handleGroupCopy("macrorregion", macrorregionMunicipalityNames)
            }
            copyStatus={groupCopyStatus.macrorregion}
            summary={macrorregionSummary}
            disabled={macrorregionMunicipalityNames.length === 0}
          />

          <GroupExplorer
            title="Municipios por microrregión"
            label="Microrregión"
            emptyLabel="Selecciona una microrregión"
            value={selectedMicrorregionGroup}
            options={microrregionOptions}
            items={microrregionMunicipalityItems}
            onChange={(value) => {
              setSelectedMicrorregionGroup(value);
              setGroupCopyStatus((current) => ({
                ...current,
                microrregion: "",
              }));
            }}
            onSelect={selectMunicipality}
            onCopy={() =>
              handleGroupCopy("microrregion", microrregionMunicipalityNames)
            }
            copyStatus={groupCopyStatus.microrregion}
            summary={microrregionSummary}
            disabled={microrregionMunicipalityNames.length === 0}
          />
        </div>
      </details>

      <details
        className={styles.groupSection}
        aria-labelledby="municipios-con-comunidades-indigenas"
      >
        <summary className={styles.groupSectionSummary}>
          <div className={styles.groupSectionHeader}>
            <h3
              id="municipios-con-comunidades-indigenas"
              className={styles.groupSectionTitle}
            >
              Municipios con comunidades indígenas
            </h3>
            <p className={styles.groupSectionText}>
              Lista rápida para consultar o copiar.
            </p>
          </div>
        </summary>

        <div className={styles.groupSectionHeaderRow}>
          <button
            type="button"
            className={styles.groupCopyButton}
            onClick={async () => {
              try {
                await copyItems(indigenousMunicipalityNames);
                setIndigenousCopyStatus("copied");
              } catch {
                setIndigenousCopyStatus("error");
              }
            }}
          >
            Copiar
          </button>
        </div>

        {indigenousCopyStatus && (
          <p
            className={`${styles.copyStatus} ${
              indigenousCopyStatus === "error" ? styles.copyStatusError : ""
            }`}
            role="status"
          >
            {indigenousCopyStatus === "error"
              ? "No se pudo copiar al portapapeles."
              : "Municipios copiados al portapapeles."}
          </p>
        )}

        <div className={styles.relatedList}>
          {indigenousMunicipalityItems.map((item) => (
            <button
              key={`indigenous-${item.municipio}`}
              type="button"
              className={styles.relatedItem}
              onClick={() => selectMunicipality(item.municipio)}
            >
              <span>{item.municipio}</span>
              <RegionPath item={item} />
            </button>
          ))}
        </div>
      </details>

      <p className={styles.sourceNote}>
        Fuente:{" "}
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
