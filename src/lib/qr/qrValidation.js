import {
  BODY_SHAPES,
  CORNER_DOT_SHAPES,
  CORNER_SQUARE_SHAPES,
  ERROR_CORRECTION_LEVELS,
  EXPORT_FORMATS,
  QR_TYPE_VALUES,
} from "./qrDefaults";
import { slugifyFileName } from "./qrFileName";
import { buildQrPayload } from "./qrPayloadBuilder";

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeRecord(record = {}) {
  return {
    title: String(record.title ?? "").trim(),
    type: String(record.type ?? "").trim().toLowerCase(),
    value: String(record.value ?? "").trim(),
    fileName: String(record.fileName ?? "").trim(),
  };
}

export function normalizeHexColor(value) {
  const color = String(value || "").trim();

  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    const [, r, g, b] = color;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color.toUpperCase();
  }

  return "";
}

export function isEmptyRecord(record) {
  return !String(record?.title ?? "").trim() && !String(record?.type ?? "").trim() && !String(record?.value ?? "").trim() && !String(record?.fileName ?? "").trim();
}

export function validateQrRecord(record, index = 0) {
  const normalized = normalizeRecord(record);
  const errors = [];

  if (isEmptyRecord(record)) {
    errors.push({ rowIndex: index + 1, field: "row", message: "El registro esta vacio." });
    return { record: normalized, errors };
  }

  if (!normalized.title) {
    errors.push({ rowIndex: index + 1, field: "title", message: "El titulo es obligatorio." });
  }

  if (!normalized.type) {
    errors.push({ rowIndex: index + 1, field: "type", message: "El tipo de QR es obligatorio." });
  } else if (!QR_TYPE_VALUES.includes(normalized.type)) {
    errors.push({ rowIndex: index + 1, field: "type", message: "El tipo de QR no es compatible." });
  }

  if (!normalized.value) {
    errors.push({ rowIndex: index + 1, field: "value", message: "El contenido es obligatorio." });
  }

  if (normalized.fileName && !slugifyFileName(normalized.fileName)) {
    errors.push({ rowIndex: index + 1, field: "fileName", message: "El nombre de archivo no es valido." });
  }

  if (normalized.type && normalized.value && QR_TYPE_VALUES.includes(normalized.type)) {
    try {
      buildQrPayload(normalized.type, normalized.value);
    } catch (error) {
      errors.push({ rowIndex: index + 1, field: "value", message: error.message });
    }
  }

  return { record: normalized, errors };
}

export function validateQrConfig(config) {
  const errors = [];
  const size = Number(config.size);
  const margin = Number(config.margin);
  const logoSize = Number(config.logoSize);

  if (!Number.isFinite(size) || size < 256 || size > 2048) {
    errors.push("El tamano del QR debe estar entre 256 y 2048 px.");
  }

  if (!Number.isFinite(margin) || margin < 0 || margin > 80) {
    errors.push("El margen debe estar entre 0 y 80 px.");
  }

  if (!ERROR_CORRECTION_LEVELS.includes(config.errorCorrectionLevel)) {
    errors.push("Selecciona un nivel de correccion valido.");
  }

  if (!BODY_SHAPES.includes(config.bodyShape)) {
    errors.push("Selecciona una forma de cuerpo valida.");
  }

  if (!CORNER_SQUARE_SHAPES.includes(config.cornerSquareShape)) {
    errors.push("Selecciona una forma de esquinas valida.");
  }

  if (!CORNER_DOT_SHAPES.includes(config.cornerDotShape)) {
    errors.push("Selecciona una forma interna valida.");
  }

  ["bodyColor", "cornerSquareColor", "cornerDotColor", "backgroundColor"].forEach((field) => {
    if (!HEX_COLOR_REGEX.test(config[field])) {
      errors.push("Los colores deben tener formato hexadecimal valido.");
    }
  });

  if (!Number.isFinite(logoSize) || logoSize < 0.05 || logoSize > 0.25) {
    errors.push("El logo debe ocupar entre 5% y 25% del QR.");
  }

  if (!EXPORT_FORMATS.includes(config.exportFormat)) {
    errors.push("Selecciona un formato de exportacion valido.");
  }

  return errors;
}
