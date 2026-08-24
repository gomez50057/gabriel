export function parsePageRange(value, totalPages) {
  const parts = String(value || "").split(",").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) throw new Error("Escribe al menos una página o rango.");

  const pages = [];
  for (const part of parts) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!match) throw new Error(`Rango inválido: ${part}`);

    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
      throw new Error(`El rango ${part} debe estar entre 1 y ${totalPages}.`);
    }

    const step = start <= end ? 1 : -1;
    for (let page = start; page !== end + step; page += step) pages.push(page - 1);
  }

  return pages;
}

export function parseRangeGroups(value, totalPages) {
  const groups = String(value || "").split(/[;\n]+/).map((part) => part.trim()).filter(Boolean);
  if (!groups.length) throw new Error("Separa los rangos con punto y coma.");
  return groups.map((group) => parsePageRange(group, totalPages));
}
