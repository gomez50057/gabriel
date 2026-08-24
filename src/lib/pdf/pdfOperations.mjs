import JSZip from "jszip";
import { degrees, PDFDocument } from "pdf-lib";
import { loadPdfWithPages } from "./loadPdf.mjs";

function safeName(value) {
  return String(value || "documento-organizado")
    .replace(/\.pdf$/i, "")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .trim() || "documento-organizado";
}

async function loadRequiredSources(documents, selectedPages) {
  const sources = new Map();
  const requiredDocumentIds = new Set(selectedPages.map((page) => page.docId));

  for (const document of documents) {
    if (!requiredDocumentIds.has(document.id)) continue;
    sources.set(document.id, await loadPdfWithPages(document.bytes, document.name));
  }

  return sources;
}

async function buildPdfFromSources(sources, selectedPages, outputName) {

  const output = await PDFDocument.create();
  output.setTitle(safeName(outputName));
  output.setAuthor("Gabriel Gómez Gómez");
  output.setCreator("Organizador de PDF de gabrielgomez.site");
  output.setSubject("PDF organizado localmente");

  for (const pageData of selectedPages) {
    const source = sources.get(pageData.docId);
    const [copiedPage] = await output.copyPages(source, [pageData.pageIndex]);
    copiedPage.setRotation(
      degrees((copiedPage.getRotation().angle + pageData.rotation + 360) % 360)
    );
    output.addPage(copiedPage);
  }

  return output.save({ useObjectStreams: true });
}

export async function buildPdfFromPages(documents, selectedPages, outputName) {
  const sources = await loadRequiredSources(documents, selectedPages);
  return buildPdfFromSources(sources, selectedPages, outputName);
}

export async function buildPdfZip(documents, pages, groups, outputName) {
  const sources = await loadRequiredSources(documents, pages);
  const zip = new JSZip();
  for (let index = 0; index < groups.length; index += 1) {
    const bytes = await buildPdfFromSources(
      sources,
      groups[index].map((pageIndex) => pages[pageIndex]),
      outputName
    );
    zip.file(`${safeName(outputName)}-parte-${index + 1}.pdf`, bytes);
  }
  return zip.generateAsync({ type: "uint8array", compression: "STORE" });
}
