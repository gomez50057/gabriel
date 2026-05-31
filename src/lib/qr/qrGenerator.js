import QRCodeStyling from "qr-code-styling";
import { buildQrPayload } from "./qrPayloadBuilder";
import { normalizeHexColor } from "./qrValidation";

export function createQrOptions(data, config) {
  const bodyColor = normalizeHexColor(config.bodyColor) || config.bodyColor;
  const cornerSquareColor = normalizeHexColor(config.cornerSquareColor) || config.cornerSquareColor;
  const cornerDotColor = normalizeHexColor(config.cornerDotColor) || config.cornerDotColor;
  const backgroundColor = normalizeHexColor(config.backgroundColor) || config.backgroundColor;

  return {
    width: Number(config.size),
    height: Number(config.size),
    type: config.exportFormat === "svg" ? "svg" : "canvas",
    data,
    image: config.logoEnabled && config.logoUrl ? config.logoUrl : undefined,
    margin: Number(config.margin),
    qrOptions: {
      errorCorrectionLevel: config.errorCorrectionLevel,
    },
    dotsOptions: {
      type: config.bodyShape,
      color: bodyColor,
    },
    cornersSquareOptions: {
      type: config.cornerSquareShape,
      color: cornerSquareColor,
    },
    cornersDotOptions: {
      type: config.cornerDotShape,
      color: cornerDotColor,
    },
    backgroundOptions: {
      color: backgroundColor,
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: Number(config.logoPadding),
      imageSize: Number(config.logoSize),
      hideBackgroundDots: true,
    },
  };
}

export function createQrInstance(data, config) {
  return new QRCodeStyling(createQrOptions(data, config));
}

export function createQrForRecord(record, config) {
  const payload = buildQrPayload(record.type, record.value);
  return createQrInstance(payload, config);
}
