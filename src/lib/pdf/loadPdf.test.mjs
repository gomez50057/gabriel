import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { loadPdfWithPages } from "./loadPdf.mjs";

test("acepta un PDF con páginas", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const bytes = await pdf.save();

  assert.equal((await loadPdfWithPages(bytes, "archivo.pdf")).getPageCount(), 1);
});

test("rechaza PDFs sin páginas y bytes inválidos", async () => {
  const emptyPdf = await PDFDocument.create();
  const emptyBytes = await emptyPdf.save({ addDefaultPage: false });

  await assert.rejects(
    loadPdfWithPages(emptyBytes, "vacío.pdf"),
    /no contiene páginas/
  );
  await assert.rejects(
    loadPdfWithPages(new Uint8Array([1, 2, 3]), "protegido.pdf"),
    /dañado o protegido/
  );
});
