import {
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
} from "./watermarkDefaults";

export function getFileExtension(fileName = "") {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

export function getBaseFileName(fileName = "archivo") {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}

export function getFileKind(file) {
  const extension = getFileExtension(file?.name);

  if (file?.type === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  if (
    file?.type?.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp"].includes(extension)
  ) {
    return "image";
  }

  return "unknown";
}

export function isAllowedFile(file) {
  if (!file) {
    return false;
  }

  const extension = getFileExtension(file.name);
  return (
    ALLOWED_FILE_TYPES.includes(file.type) ||
    ALLOWED_EXTENSIONS.includes(extension)
  );
}

export function bytesToReadableSize(bytes = 0) {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function normalizeHexColor(value = "") {
  const color = value.trim();

  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    const [, r, g, b] = color;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color.toUpperCase();
  }

  return "";
}

export function hexToRgbObject(value) {
  const normalized = normalizeHexColor(value);

  if (!normalized) {
    throw new Error("El color debe ser hexadecimal valido.");
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

export function getImageOutputMime(file) {
  const extension = getFileExtension(file?.name);

  if (file?.type === "image/png" || extension === "png") {
    return "image/png";
  }

  if (file?.type === "image/webp" || extension === "webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

export function getOutputExtensionFromMime(mimeType) {
  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export function createOutputFileName(file, extension) {
  const baseName = getBaseFileName(file?.name || "archivo");
  return `${baseName}_watermarked.${extension}`;
}
