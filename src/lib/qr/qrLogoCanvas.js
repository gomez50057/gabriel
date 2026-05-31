function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No fue posible leer el logo."));
    image.src = src;
  });
}

function drawRoundedRect(context, x, y, width, height, radius) {
  const nextRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + nextRadius, y);
  context.lineTo(x + width - nextRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + nextRadius);
  context.lineTo(x + width, y + height - nextRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - nextRadius, y + height);
  context.lineTo(x + nextRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - nextRadius);
  context.lineTo(x, y + nextRadius);
  context.quadraticCurveTo(x, y, x + nextRadius, y);
  context.closePath();
}

export async function prepareQrLogoImage(config) {
  if (!config.logoEnabled || !config.logoUrl) {
    return "";
  }

  const image = await loadImage(config.logoUrl);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const canvasSize = 512;
  const padding = Math.min(canvasSize * 0.32, Math.max(0, Number(config.logoPadding) || 0) * 4);
  const radius = Math.min(canvasSize / 2, Math.max(0, Number(config.logoBorderRadius) || 0) * 3);
  const drawableSize = canvasSize - padding * 2;
  const imageWidth = image.naturalWidth || image.width || drawableSize;
  const imageHeight = image.naturalHeight || image.height || drawableSize;
  const imageRatio = Math.min(drawableSize / imageWidth, drawableSize / imageHeight);
  const drawWidth = imageWidth * imageRatio;
  const drawHeight = imageHeight * imageRatio;
  const drawX = (canvasSize - drawWidth) / 2;
  const drawY = (canvasSize - drawHeight) / 2;

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  context.clearRect(0, 0, canvasSize, canvasSize);
  context.fillStyle = config.logoBackgroundColor || "#FFFFFF";
  drawRoundedRect(context, 0, 0, canvasSize, canvasSize, radius);
  context.fill();

  context.save();
  drawRoundedRect(context, padding, padding, drawableSize, drawableSize, Math.max(0, radius - padding));
  context.clip();
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();

  return canvas.toDataURL("image/png");
}
