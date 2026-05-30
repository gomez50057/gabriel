import {
  createOutputFileName,
  getImageOutputMime,
  getOutputExtensionFromMime,
} from "./fileTypeUtils";

const IMAGE_MARGIN = 40;

function getWatermarkPositionForImage(canvasWidth, canvasHeight, config) {
  if (config.position === "top-left") {
    return {
      x: IMAGE_MARGIN,
      y: IMAGE_MARGIN,
      textAlign: "left",
      textBaseline: "top",
    };
  }

  if (config.position === "top-right") {
    return {
      x: canvasWidth - IMAGE_MARGIN,
      y: IMAGE_MARGIN,
      textAlign: "right",
      textBaseline: "top",
    };
  }

  if (config.position === "bottom-left") {
    return {
      x: IMAGE_MARGIN,
      y: canvasHeight - IMAGE_MARGIN,
      textAlign: "left",
      textBaseline: "bottom",
    };
  }

  if (config.position === "bottom-right") {
    return {
      x: canvasWidth - IMAGE_MARGIN,
      y: canvasHeight - IMAGE_MARGIN,
      textAlign: "right",
      textBaseline: "bottom",
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
      x > canvasWidth ||
      y > canvasHeight
    ) {
      throw new Error("La posicion personalizada esta fuera de los limites de la imagen.");
    }

    return {
      x,
      y,
      textAlign: "center",
      textBaseline: "middle",
    };
  }

  return {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    textAlign: "center",
    textBaseline: "middle",
  };
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No fue posible leer la imagen."));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, mimeType, quality = 0.95) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

async function ensureMontserratLoaded(config) {
  if (!document.fonts?.load) {
    return;
  }

  await document.fonts.load(
    `${Number(config.fontWeight)} ${Number(config.fontSize)}px "Montserrat"`,
    String(config.text)
  );
  await document.fonts.ready;
}

function setupCanvasText(ctx, config) {
  ctx.font = `${Number(config.fontWeight)} ${Number(config.fontSize)}px "Montserrat", sans-serif`;
  ctx.fillStyle = config.color;
  ctx.globalAlpha = Number(config.opacity);
}

function drawRotatedText(ctx, text, x, y, config) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((Number(config.rotation) * Math.PI) / 180);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawSingleWatermark(ctx, canvas, config) {
  const position = getWatermarkPositionForImage(canvas.width, canvas.height, config);
  ctx.textAlign = position.textAlign;
  ctx.textBaseline = position.textBaseline;
  drawRotatedText(ctx, String(config.text).trim(), position.x, position.y, config);
}

function drawRepeatedWatermark(ctx, canvas, config) {
  const gapX = Math.max(Number(config.repeatGapX), 40);
  const gapY = Math.max(Number(config.repeatGapY), 40);
  const text = String(config.text).trim();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = -canvas.height; y <= canvas.height * 2; y += gapY) {
    for (let x = -canvas.width; x <= canvas.width * 2; x += gapX) {
      drawRotatedText(ctx, text, x, y, config);
    }
  }
}

export async function applyImageWatermark(file, config) {
  try {
    await ensureMontserratLoaded(config);

    const image = await loadImageFromFile(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No fue posible preparar el lienzo de imagen.");
    }

    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
    ctx.save();
    setupCanvasText(ctx, config);

    if (config.repeat) {
      drawRepeatedWatermark(ctx, canvas, config);
    } else {
      drawSingleWatermark(ctx, canvas, config);
    }

    ctx.restore();

    const requestedMime = getImageOutputMime(file);
    const quality = requestedMime === "image/png" ? undefined : 0.95;
    let outputMime = requestedMime;
    let blob = await canvasToBlob(canvas, requestedMime, quality);
    let warning = "";

    if (!blob) {
      outputMime = "image/png";
      blob = await canvasToBlob(canvas, outputMime);
      warning = "El navegador no pudo exportar el formato original; se genero PNG como alternativa.";
    }

    if (requestedMime === "image/webp" && blob?.type !== "image/webp") {
      outputMime = "image/png";
      blob = await canvasToBlob(canvas, outputMime);
      warning = "Tu navegador no exporto WEBP correctamente; se genero PNG como alternativa.";
    }

    if (!blob) {
      throw new Error("No fue posible generar la imagen.");
    }

    const extension = getOutputExtensionFromMime(outputMime);

    return {
      blob,
      fileName: createOutputFileName(file, extension),
      warning,
    };
  } catch (error) {
    console.error(error);

    if (error?.message?.includes("posicion")) {
      throw error;
    }

    throw new Error("No fue posible generar el archivo. Intenta con otro documento.");
  }
}
