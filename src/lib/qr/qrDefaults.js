export const QR_MODES = [
  { value: "manual", label: "Carga manual" },
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "excel", label: "Excel" },
];

export const QR_TYPES = [
  { value: "url", label: "URL" },
  { value: "text", label: "Texto" },
  { value: "email", label: "Correo" },
  { value: "phone", label: "Telefono" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "wifi", label: "WiFi" },
  { value: "vcard", label: "vCard" },
  { value: "location", label: "Ubicacion" },
];

export const QR_TYPE_VALUES = QR_TYPES.map((type) => type.value);

export const BODY_SHAPES = [
  "square",
  "rounded",
  "dots",
  "extra-rounded",
  "classy",
  "classy-rounded",
];

export const CORNER_SQUARE_SHAPES = ["square", "dot", "extra-rounded"];
export const CORNER_DOT_SHAPES = ["square", "dot"];
export const ERROR_CORRECTION_LEVELS = ["L", "M", "Q", "H"];
export const EXPORT_FORMATS = ["png", "svg", "webp"];

export const QR_COLOR_SWATCHES = [
  "#000000",
  "#FFFFFF",
  "#691B32",
  "#A02142",
  "#BC955B",
  "#DEC9A3",
  "#707271",
  "#98989A",
  "#E7BD70",
];

export const MAX_BULK_RECORDS = 100;
export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

export const DEFAULT_QR_LOGOS = [
  {
    label: "Logo G",
    name: "logo-g.svg",
    url: "/img/generador-codigos-qr/logo-g.svg",
  },
  {
    label: "Estrella Tzuhu",
    name: "estrella-tzuhu.png",
    url: "/img/generador-codigos-qr/estrella-tzuhu.png",
  },
];

export const defaultQrConfig = {
  mode: "static",
  size: 1024,
  margin: 24,
  errorCorrectionLevel: "H",
  bodyShape: "rounded",
  cornerSquareShape: "extra-rounded",
  cornerDotShape: "dot",
  bodyColor: "#000000",
  cornerSquareColor: "#000000",
  cornerDotColor: "#000000",
  backgroundColor: "#FFFFFF",
  logoEnabled: false,
  logoFile: null,
  logoName: "",
  logoUrl: "",
  logoSize: 0.25,
  logoBackgroundColor: "#FFFFFF",
  logoBorderRadius: 16,
  logoPadding: 8,
  exportFormat: "png",
};

export const emptyQrRecord = {
  title: "",
  type: "url",
  value: "",
  fileName: "",
};
