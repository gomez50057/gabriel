function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanPhone(value) {
  return String(value || "").replace(/[\s().-]/g, "");
}

function isValidPhone(value) {
  return /^\+?\d{7,16}$/.test(cleanPhone(value));
}

function isValidLocation(value) {
  const parts = String(value || "").split(",").map((part) => part.trim());

  if (parts.length !== 2) {
    return false;
  }

  const lat = Number(parts[0]);
  const lng = Number(parts[1]);

  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function buildQrPayload(type, value) {
  const cleanValue = String(value || "").trim();

  if (type === "url") {
    if (!isValidUrl(cleanValue)) {
      throw new Error("La URL no es valida.");
    }
    return cleanValue;
  }

  if (type === "text") {
    return cleanValue;
  }

  if (type === "email") {
    if (!isValidEmail(cleanValue)) {
      throw new Error("El correo no es valido.");
    }
    return `mailto:${cleanValue}`;
  }

  if (type === "phone") {
    if (!isValidPhone(cleanValue)) {
      throw new Error("El numero telefonico no es valido.");
    }
    return `tel:${cleanPhone(cleanValue)}`;
  }

  if (type === "whatsapp") {
    if (!isValidPhone(cleanValue)) {
      throw new Error("El numero telefonico no es valido.");
    }
    return `https://wa.me/${cleanPhone(cleanValue).replace(/^\+/, "")}`;
  }

  if (type === "wifi" || type === "vcard") {
    return cleanValue;
  }

  if (type === "location") {
    if (!isValidLocation(cleanValue)) {
      throw new Error("La ubicacion debe tener formato lat,lng.");
    }
    return `geo:${cleanValue.replace(/\s+/g, "")}`;
  }

  throw new Error("El tipo de QR no es compatible.");
}
