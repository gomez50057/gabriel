import { PDFDocument } from "pdf-lib";

export async function loadPdfWithPages(bytes, fileName = "el archivo") {
  let pdf;
  try {
    pdf = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch {
    throw new Error(`No se pudo leer ${fileName}. Puede estar dañado o protegido.`);
  }

  if (pdf.getPageCount() === 0) {
    throw new Error(`${fileName} no contiene páginas.`);
  }

  return pdf;
}
