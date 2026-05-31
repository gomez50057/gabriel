import Papa from "papaparse";

const REQUIRED_COLUMNS = ["title", "type", "value"];

function assertRequiredColumns(fields = []) {
  const normalizedFields = fields.map((field) => String(field || "").trim());
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !normalizedFields.includes(column));

  if (missingColumns.length) {
    throw new Error("El CSV debe contener las columnas title, type y value.");
  }
}

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    if (!file?.name?.toLowerCase().endsWith(".csv")) {
      reject(new Error("Selecciona un archivo CSV valido."));
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          assertRequiredColumns(result.meta.fields || []);
          resolve(result.data);
        } catch (error) {
          reject(error);
        }
      },
      error: () => reject(new Error("No fue posible leer el archivo CSV.")),
    });
  });
}
