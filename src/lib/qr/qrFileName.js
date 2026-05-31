export function slugifyFileName(value = "codigo-qr") {
  const slug = String(value)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "codigo-qr";
}

export function ensureUniqueFileName(baseName, usedNames) {
  const cleanBaseName = slugifyFileName(baseName);
  let candidate = cleanBaseName;
  let counter = 1;

  while (usedNames.has(candidate)) {
    candidate = `${cleanBaseName}-${counter}`;
    counter += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

export function getRecordFileName(record, usedNames = new Set()) {
  return ensureUniqueFileName(record.fileName || record.title, usedNames);
}
