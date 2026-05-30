export const MAX_FILE_SIZE_MB = 30;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const FILE_SIZE_LIMIT_ERROR = `El archivo supera el limite permitido de ${MAX_FILE_SIZE_MB} MB.`;
export const MIN_WATERMARK_FONT_SIZE = 8;
export const MAX_WATERMARK_FONT_SIZE = 600;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "webp"];

export const FONT_WEIGHTS = [200, 300, 400, 500, 600, 700, 800, 900];

export const FONT_FILE_BY_WEIGHT = {
  200: "Montserrat-ExtraLight.ttf",
  300: "Montserrat-Light.ttf",
  400: "Montserrat-Regular.ttf",
  500: "Montserrat-Medium.ttf",
  600: "Montserrat-SemiBold.ttf",
  700: "Montserrat-Bold.ttf",
  800: "Montserrat-ExtraBold.ttf",
  900: "Montserrat-Black.ttf",
};

export const COLOR_SWATCHES = [
  "#000000",
  "#707271",
  "#98989A",
  "#691B32",
  "#A02142",
  "#BC955B",
  "#DEC9A3",
];

export const POSITION_OPTIONS = [
  { value: "center", label: "Centro" },
  { value: "top-left", label: "Superior izquierda" },
  { value: "top-right", label: "Superior derecha" },
  { value: "bottom-left", label: "Inferior izquierda" },
  { value: "bottom-right", label: "Inferior derecha" },
  { value: "custom", label: "Personalizada" },
];

export const APPLY_MODE_OPTIONS = [
  { value: "all", label: "Todas las paginas" },
  { value: "single", label: "Una pagina" },
  { value: "range", label: "Rango de paginas" },
  { value: "specific", label: "Paginas especificas" },
];

export const defaultWatermarkConfig = {
  text: "Documento confidencial",
  fontFamily: "Montserrat",
  fontWeight: 600,
  fontSize: 48,
  opacity: 0.18,
  color: "#691B32",
  rotation: -35,
  position: "center",
  customX: null,
  customY: null,
  repeat: false,
  repeatGapX: 220,
  repeatGapY: 160,
  applyMode: "all",
  pageNumber: 1,
  pageRange: "",
  specificPages: "",
};

export function getMontserratFontUrl(fontWeight) {
  const fileName = FONT_FILE_BY_WEIGHT[Number(fontWeight)] || FONT_FILE_BY_WEIGHT[600];
  return `/fonts/montserrat/${fileName}`;
}
