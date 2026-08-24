import assert from "node:assert/strict";
import test from "node:test";
import JSZip from "jszip";
import { degrees, PDFDocument } from "pdf-lib";
import { buildPdfFromPages, buildPdfZip } from "./pdfOperations.mjs";

async function createSourcePdf() {
  const source = await PDFDocument.create();
  source.addPage().setRotation(degrees(90));
  source.addPage();
  return source.save();
}

test("genera un PDF real y conserva la rotación solicitada", async () => {
  const documents = [{
    id: "source",
    name: "origen.pdf",
    bytes: await createSourcePdf(),
  }];
  const pages = [
    { docId: "source", pageIndex: 1, rotation: 90 },
    { docId: "source", pageIndex: 0, rotation: 0 },
  ];

  const output = await PDFDocument.load(
    await buildPdfFromPages(documents, pages, "resultado")
  );
  assert.equal(output.getPageCount(), 2);
  assert.deepEqual(output.getPages().map((page) => page.getRotation().angle), [90, 90]);
});

test("genera un ZIP con un PDF por grupo", async () => {
  const documents = [{
    id: "source",
    name: "origen.pdf",
    bytes: await createSourcePdf(),
  }];
  const pages = [
    { docId: "source", pageIndex: 0, rotation: 0 },
    { docId: "source", pageIndex: 1, rotation: 0 },
  ];

  const zip = await JSZip.loadAsync(
    await buildPdfZip(documents, pages, [[0], [1]], "resultado")
  );
  assert.deepEqual(Object.keys(zip.files).sort(), [
    "resultado-parte-1.pdf",
    "resultado-parte-2.pdf",
  ]);
  for (const file of Object.values(zip.files)) {
    const pdf = await PDFDocument.load(await file.async("uint8array"));
    assert.equal(pdf.getPageCount(), 1);
  }
});
