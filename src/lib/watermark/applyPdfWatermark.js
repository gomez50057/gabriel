import fontkit from "@pdf-lib/fontkit";
import { degrees, PDFDocument, rgb } from "pdf-lib";
import { createOutputFileName, hexToRgbObject } from "./fileTypeUtils";
import { getMontserratFontUrl } from "./watermarkDefaults";
import { parsePageSelection } from "./parsePageRange";

const PDF_MARGIN = 40;

export function hexToRgbPdf(hexColor) {
  const { r, g, b } = hexToRgbObject(hexColor);
  return rgb(r / 255, g / 255, b / 255);
}

export function getWatermarkPositionForPdf(pageWidth, pageHeight, textWidth, textHeight, config) {
  if (config.position === "top-left") {
    return {
      x: PDF_MARGIN,
      y: pageHeight - PDF_MARGIN - textHeight,
    };
  }

  if (config.position === "top-right") {
    return {
      x: pageWidth - PDF_MARGIN - textWidth,
      y: pageHeight - PDF_MARGIN - textHeight,
    };
  }

  if (config.position === "bottom-left") {
    return {
      x: PDF_MARGIN,
      y: PDF_MARGIN,
    };
  }

  if (config.position === "bottom-right") {
    return {
      x: pageWidth - PDF_MARGIN - textWidth,
      y: PDF_MARGIN,
    };
  }

  if (config.position === "custom") {
    const x = Number(config.customX);
    const y = Number(config.customY);

    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      x < 0 ||
      y < 0 ||
      x > pageWidth ||
      y > pageHeight
    ) {
      throw new Error("La posicion personalizada esta fuera de los limites del documento.");
    }

    return {
      x: Math.min(Math.max(x - textWidth / 2, 0), Math.max(pageWidth - textWidth, 0)),
      y: Math.min(Math.max(y - textHeight / 2, 0), Math.max(pageHeight - textHeight, 0)),
    };
  }

  return {
    x: (pageWidth - textWidth) / 2,
    y: (pageHeight - textHeight) / 2,
  };
}

function drawTextOnPdfPage(page, text, x, y, config, font, color) {
  page.drawText(text, {
    x,
    y,
    size: Number(config.fontSize),
    font,
    color,
    opacity: Number(config.opacity),
    rotate: degrees(Number(config.rotation)),
  });
}

function drawWatermarkPattern(page, config, font, color) {
  const { width, height } = page.getSize();
  const gapX = Math.max(Number(config.repeatGapX), 40);
  const gapY = Math.max(Number(config.repeatGapY), 40);
  const text = String(config.text).trim();

  for (let y = -height; y <= height * 2; y += gapY) {
    for (let x = -width; x <= width * 2; x += gapX) {
      drawTextOnPdfPage(page, text, x, y, config, font, color);
    }
  }
}

async function loadMontserratFontBytes(fontWeight) {
  const response = await fetch(getMontserratFontUrl(fontWeight));

  if (!response.ok) {
    throw new Error("No fue posible cargar la fuente Montserrat del proyecto.");
  }

  return response.arrayBuffer();
}

export async function applyPdfWatermark(file, config) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await loadMontserratFontBytes(config.fontWeight);
    const customFont = await pdfDoc.embedFont(fontBytes);
    const pages = pdfDoc.getPages();
    const targetPageIndexes = parsePageSelection(config, pages.length);
    const color = hexToRgbPdf(config.color);
    const text = String(config.text).trim();

    targetPageIndexes.forEach((pageIndex) => {
      const page = pages[pageIndex];

      if (config.repeat) {
        drawWatermarkPattern(page, config, customFont, color);
        return;
      }

      const { width, height } = page.getSize();
      const textWidth = customFont.widthOfTextAtSize(text, Number(config.fontSize));
      const textHeight = customFont.heightAtSize(Number(config.fontSize));
      const { x, y } = getWatermarkPositionForPdf(width, height, textWidth, textHeight, config);

      drawTextOnPdfPage(page, text, x, y, config, customFont, color);
    });

    const pdfBytes = await pdfDoc.save();

    return {
      blob: new Blob([pdfBytes], { type: "application/pdf" }),
      fileName: createOutputFileName(file, "pdf"),
      warning: "",
    };
  } catch (error) {
    console.error(error);

    if (
      error?.message?.includes("paginas") ||
      error?.message?.includes("posicion") ||
      error?.message?.includes("Montserrat")
    ) {
      throw error;
    }

    throw new Error("El PDF parece estar protegido, danado o no puede procesarse.");
  }
}
