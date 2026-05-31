import { saveAs } from "file-saver";
import { getRecordFileName } from "./qrFileName";
import { createQrForRecord } from "./qrGenerator";

export async function exportSingleQr(record, config) {
  const qrCode = createQrForRecord(record, config);
  const fileName = getRecordFileName(record);

  await qrCode.download({
    name: fileName,
    extension: config.exportFormat,
  });
}

export function saveBlob(blob, fileName) {
  saveAs(blob, fileName);
}
