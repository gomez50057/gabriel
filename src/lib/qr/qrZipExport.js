import JSZip from "jszip";
import { saveAs } from "file-saver";
import { buildQrPayload } from "./qrPayloadBuilder";
import { getRecordFileName } from "./qrFileName";
import { createQrInstance } from "./qrGenerator";

function escapeCsvValue(value = "") {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function createResultsCsv(results) {
  const rows = [["title", "type", "fileName", "status", "message"]];

  results.forEach((result) => {
    rows.push([
      result.title,
      result.type,
      result.fileName,
      result.status,
      result.message,
    ]);
  });

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export async function generateBulkQrZip(records, config, onProgress) {
  const zip = new JSZip();
  const results = [];
  const usedNames = new Set();

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const fileName = getRecordFileName(record, usedNames);

    onProgress?.({
      current: index + 1,
      total: records.length,
      label: `Generando ${index + 1} de ${records.length}`,
    });

    try {
      const payload = buildQrPayload(record.type, record.value);
      const qrCode = createQrInstance(payload, config);
      const blob = await qrCode.getRawData(config.exportFormat);

      if (!blob) {
        throw new Error("No fue posible generar el QR.");
      }

      zip.file(`${fileName}.${config.exportFormat}`, blob);
      results.push({
        title: record.title,
        type: record.type,
        fileName,
        status: "ok",
        message: "Generado correctamente",
      });
    } catch (error) {
      results.push({
        title: record.title,
        type: record.type,
        fileName,
        status: "error",
        message: error.message || "No fue posible generar el QR.",
      });
    }
  }

  zip.file("respaldo.json", JSON.stringify(records, null, 2));
  zip.file("resultados.csv", createResultsCsv(results));

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "qr-codes.zip");

  return results;
}
