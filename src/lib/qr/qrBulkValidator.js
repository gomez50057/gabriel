import { MAX_BULK_RECORDS } from "./qrDefaults";
import { slugifyFileName } from "./qrFileName";
import { validateQrRecord } from "./qrValidation";

export function validateBulkRecords(records = []) {
  const errors = [];
  const validRecords = [];
  const invalidRecords = [];
  const usedNames = new Map();

  if (records.length > MAX_BULK_RECORDS) {
    errors.push({
      rowIndex: 0,
      field: "file",
      message: `El archivo supera el limite de ${MAX_BULK_RECORDS} registros.`,
    });
  }

  records.slice(0, MAX_BULK_RECORDS).forEach((record, index) => {
    const validation = validateQrRecord(record, index);
    const fileName = slugifyFileName(validation.record.fileName || validation.record.title);
    const rowErrors = [...validation.errors];

    if (fileName && usedNames.has(fileName)) {
      rowErrors.push({
        rowIndex: index + 1,
        field: "fileName",
        message: "El nombre de archivo esta duplicado.",
      });
    }

    if (fileName) {
      usedNames.set(fileName, index);
    }

    if (rowErrors.length) {
      invalidRecords.push({ ...validation.record, errors: rowErrors });
      errors.push(...rowErrors);
      return;
    }

    validRecords.push(validation.record);
  });

  return {
    validRecords,
    invalidRecords,
    errors,
  };
}
