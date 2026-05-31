import * as XLSX from "xlsx";

const REQUIRED_COLUMNS = ["title", "type", "value"];

function assertRequiredColumns(rows = []) {
  const firstRow = rows[0] || {};
  const fields = Object.keys(firstRow).map((field) => String(field || "").trim());
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !fields.includes(column));

  if (missingColumns.length) {
    throw new Error("El Excel debe contener las columnas title, type y value.");
  }
}

export async function parseExcelFile(file) {
  if (!file?.name?.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Selecciona un archivo Excel .xlsx valido.");
  }

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("El archivo Excel no contiene hojas.");
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    defval: "",
  });

  assertRequiredColumns(rows);
  return rows;
}
