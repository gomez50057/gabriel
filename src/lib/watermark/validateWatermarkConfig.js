import {
  FILE_SIZE_LIMIT_ERROR,
  FONT_WEIGHTS,
  MAX_FILE_SIZE_BYTES,
  MAX_WATERMARK_FONT_SIZE,
  MIN_WATERMARK_FONT_SIZE,
} from "./watermarkDefaults";
import {
  isAllowedFile,
  normalizeHexColor,
} from "./fileTypeUtils";
import { parsePageSelection } from "./parsePageRange";

function createValidationResult(error = "") {
  return {
    isValid: !error,
    error,
  };
}

export function validateWatermarkConfig(file, config, totalPages = null) {
  if (!file) {
    return createValidationResult("Selecciona un archivo valido.");
  }

  if (!isAllowedFile(file)) {
    return createValidationResult("El formato no es compatible. Usa PDF, PNG, JPG, JPEG o WEBP.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return createValidationResult(FILE_SIZE_LIMIT_ERROR);
  }

  if (!String(config.text || "").trim()) {
    return createValidationResult("Escribe el texto de la marca de agua.");
  }

  if (String(config.text || "").length > 120) {
    return createValidationResult("El texto de la marca de agua no debe superar 120 caracteres.");
  }

  if (!FONT_WEIGHTS.includes(Number(config.fontWeight))) {
    return createValidationResult("Selecciona un peso de fuente valido.");
  }

  const fontSize = Number(config.fontSize);
  if (
    !Number.isFinite(fontSize) ||
    fontSize < MIN_WATERMARK_FONT_SIZE ||
    fontSize > MAX_WATERMARK_FONT_SIZE
  ) {
    return createValidationResult(
      `El tamano debe estar entre ${MIN_WATERMARK_FONT_SIZE} y ${MAX_WATERMARK_FONT_SIZE} px.`
    );
  }

  const opacity = Number(config.opacity);
  if (!Number.isFinite(opacity) || opacity < 0.05 || opacity > 1) {
    return createValidationResult("La opacidad debe estar entre 5% y 100%.");
  }

  if (!normalizeHexColor(config.color)) {
    return createValidationResult("El color debe ser hexadecimal valido.");
  }

  const rotation = Number(config.rotation);
  if (!Number.isFinite(rotation) || rotation < -90 || rotation > 90) {
    return createValidationResult("La rotacion debe estar entre -90 y 90 grados.");
  }

  if (config.position === "custom") {
    const customX = Number(config.customX);
    const customY = Number(config.customY);

    if (!Number.isFinite(customX) || !Number.isFinite(customY) || customX < 0 || customY < 0) {
      return createValidationResult("La posicion personalizada debe tener coordenadas X y Y validas.");
    }
  }

  if (config.repeat) {
    const repeatGapX = Number(config.repeatGapX);
    const repeatGapY = Number(config.repeatGapY);

    if (!Number.isFinite(repeatGapX) || repeatGapX < 40 || !Number.isFinite(repeatGapY) || repeatGapY < 40) {
      return createValidationResult("La separacion del patron debe ser de al menos 40 px.");
    }
  }

  if ((file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) && totalPages) {
    try {
      parsePageSelection(config, totalPages);
    } catch (error) {
      return createValidationResult(error.message || "El rango de paginas no es valido.");
    }
  }

  return createValidationResult();
}
