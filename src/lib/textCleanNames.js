const cleanNameLine = (line) =>
  line
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");

export const toCleanNames = (text) => {
  const used = new Set();
  const nextCounts = new Map();

  return text
    .split(/(\r\n|\n|\r)/)
    .map((part) => {
      if (/^(?:\r\n|\n|\r)$/.test(part)) return part;

      const clean = cleanNameLine(part);
      if (!clean) return "";

      if (!used.has(clean)) {
        used.add(clean);
        return clean;
      }

      let count = nextCounts.get(clean) ?? 2;
      let unique = `${clean}_${count}`;

      while (used.has(unique)) {
        count++;
        unique = `${clean}_${count}`;
      }

      used.add(unique);
      nextCounts.set(clean, count + 1);

      return unique;
    })
    .join("");
};
