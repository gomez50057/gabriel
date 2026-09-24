export function normalizeMunicipality(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildMunicipalityLookup(municipalities) {
  const lookup = new Map();

  municipalities.forEach((municipality) => {
    [municipality.officialName, ...(municipality.aliases || [])].forEach((name) => {
      lookup.set(normalizeMunicipality(name), municipality);
    });
  });

  return lookup;
}

export function findMunicipality(value, municipalities, level = 1) {
  const input = String(value ?? "").trim();

  if (!input) return null;

  if (level === 2) {
    return municipalities.find((municipality) => municipality.officialName === input) || null;
  }

  const normalizedInput = normalizeMunicipality(input);
  if (!normalizedInput) return null;

  const lookup = buildMunicipalityLookup(municipalities);
  const exactMatch = lookup.get(normalizedInput);
  if (exactMatch) return exactMatch;

  if (normalizedInput.length < 3) return null;

  const partialMatches = municipalities.filter((municipality) => {
    const names = [municipality.officialName, ...(municipality.aliases || [])];
    return names.some((name) => normalizeMunicipality(name).includes(normalizedInput));
  });

  return partialMatches.length === 1 ? partialMatches[0] : null;
}
