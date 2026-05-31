export async function parseJsonFile(file) {
  if (!file?.name?.toLowerCase().endsWith(".json")) {
    throw new Error("Selecciona un archivo JSON valido.");
  }

  let parsedData;

  try {
    parsedData = JSON.parse(await file.text());
  } catch {
    throw new Error("El JSON no es valido.");
  }

  if (!Array.isArray(parsedData)) {
    throw new Error("El JSON debe ser un arreglo de objetos.");
  }

  if (parsedData.some((item) => item == null || Array.isArray(item) || typeof item !== "object")) {
    throw new Error("Cada elemento del JSON debe ser un objeto.");
  }

  return parsedData;
}
