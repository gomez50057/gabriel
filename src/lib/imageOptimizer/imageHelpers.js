import { saveAs } from "file-saver";
import JSZip from "jszip";

export function formatBytes(bytes = 0) {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function calculateReduction(originalSize = 0, optimizedSize = 0) {
  if (!originalSize || !optimizedSize) {
    return 0;
  }

  return Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100));
}

export function getFileNameWithoutExtension(fileName = "") {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return fileName;
  }

  return fileName.slice(0, lastDotIndex);
}

export function getOutputFileName(originalName, extension = "webp", existingNames = new Set()) {
  const cleanExtension = extension.replace(".", "");
  const baseName = getFileNameWithoutExtension(originalName) || "imagen";
  let fileName = `${baseName}.${cleanExtension}`;
  let counter = 1;

  while (existingNames.has(fileName)) {
    fileName = `${baseName}-${counter}.${cleanExtension}`;
    counter += 1;
  }

  existingNames.add(fileName);
  return fileName;
}

export function createImagePreview(file) {
  return URL.createObjectURL(file);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No fue posible leer la imagen. El archivo puede estar corrupto."));
    };

    image.src = url;
  });
}

export function resizeImageToCanvas(image, settings) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const maxWidth = Number(settings.maxWidth) || sourceWidth;
  const shouldResize =
    maxWidth > 0 &&
    sourceWidth !== maxWidth &&
    (!settings.preventUpscale || sourceWidth > maxWidth);
  const targetWidth = shouldResize ? maxWidth : sourceWidth;
  const targetHeight = settings.keepAspectRatio
    ? Math.round(sourceHeight * (targetWidth / sourceWidth))
    : sourceHeight;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.clearRect(0, 0, targetWidth, targetHeight);
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  return {
    canvas,
    dimensions: {
      width: targetWidth,
      height: targetHeight,
    },
  };
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("El navegador no pudo exportar la imagen optimizada."));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function optimizeImage(file, settings) {
  const image = await loadImage(file);
  const originalDimensions = {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
  };
  const { canvas, dimensions } = resizeImageToCanvas(image, settings);
  const quality = Math.min(1, Math.max(0.01, Number(settings.quality || 82) / 100));
  const blob = await canvasToBlob(canvas, "image/webp", quality);
  const optimizedUrl = URL.createObjectURL(blob);

  return {
    blob,
    optimizedUrl,
    optimizedSize: blob.size,
    reductionPercentage: calculateReduction(file.size, blob.size),
    originalDimensions,
    dimensions,
    metadataMessage: settings.removeMetadata
      ? "Metadatos eliminados en la exportacion."
      : "La exportacion por Canvas puede omitir metadatos del archivo original.",
  };
}

export function downloadBlob(blob, fileName) {
  if (!blob) {
    return;
  }

  saveAs(blob, fileName);
}

export async function downloadImagesZip(images, fileName = "imagenes-optimizadas-webp.zip") {
  const zip = new JSZip();

  images.forEach((image) => {
    if (image.optimizedBlob) {
      zip.file(image.outputName, image.optimizedBlob);
    }
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, fileName);
}
