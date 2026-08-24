"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { downloadBlob } from "@/lib/watermark/downloadFile";
import { parsePageRange, parseRangeGroups } from "@/lib/pdf/pageRanges.mjs";
import { loadPdfWithPages } from "@/lib/pdf/loadPdf.mjs";
import { buildPdfFromPages, buildPdfZip } from "@/lib/pdf/pdfOperations.mjs";
import styles from "./PdfOrganizer.module.css";

const MAX_TOTAL_BYTES = 250 * 1024 * 1024;
const ACCESSIBILITY_WARNING =
  "Nota: el PDF reconstruido puede perder etiquetas de accesibilidad (Tagged). Conserva el original si necesitas esa estructura.";

const PdfThumbnail = dynamic(() => import("./PdfThumbnail"), {
  ssr: false,
  loading: () => (
    <div className={styles.thumbnail}>
      <span className={styles.thumbnailPlaceholder}>Cargando…</span>
    </div>
  ),
});

let pdfJsPromise;

function loadPreviewPdf(bytes) {
  pdfJsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    return pdfjs;
  });

  return pdfJsPromise.then((pdfjs) =>
    pdfjs.getDocument({ data: bytes.slice() }).promise
  );
}

function moveItem(items, index, offset) {
  const target = index + offset;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function safeName(value) {
  return String(value || "documento-organizado")
    .replace(/\.pdf$/i, "")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .trim() || "documento-organizado";
}

export default function PdfOrganizer() {
  const idRef = useRef(0);
  const previewDocumentsRef = useRef(new Map());
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [pages, setPages] = useState([]);
  const [range, setRange] = useState("");
  const [splitRanges, setSplitRanges] = useState("");
  const [rotation, setRotation] = useState(90);
  const [outputName, setOutputName] = useState("documento-organizado");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const totalBytes = documents.reduce((sum, document) => sum + document.size, 0);
  const documentById = new Map(
    documents.map((document) => [document.id, document])
  );

  useEffect(() => {
    const activeIds = new Set(documents.map((document) => document.id));

    for (const [documentId, previewPdf] of previewDocumentsRef.current) {
      if (!activeIds.has(documentId)) {
        previewPdf.destroy();
        previewDocumentsRef.current.delete(documentId);
      }
    }
  }, [documents]);

  useEffect(
    () => () => {
      for (const previewPdf of previewDocumentsRef.current.values()) {
        previewPdf.destroy();
      }
      previewDocumentsRef.current.clear();
    },
    []
  );

  useEffect(() => {
    if (previewEnabled) return;
    for (const previewPdf of previewDocumentsRef.current.values()) {
      previewPdf.destroy();
    }
    previewDocumentsRef.current.clear();
  }, [previewEnabled]);

  const clearMessages = () => {
    setError("");
    setStatus("");
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    clearMessages();

    if (files.some((file) => !file.name.toLowerCase().endsWith(".pdf"))) {
      setError("Selecciona únicamente archivos PDF.");
      return;
    }
    if (totalBytes + files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES) {
      setError("El total de archivos no puede superar 250 MB.");
      return;
    }

    const loaded = [];
    setBusy(true);
    try {
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const pdf = await loadPdfWithPages(bytes, file.name);

        let previewPdf = null;
        if (previewEnabled) {
          try {
            previewPdf = await loadPreviewPdf(bytes);
          } catch {
            throw new Error(`No se pudo generar la vista previa de ${file.name}.`);
          }
        }

        loaded.push({
          id: `document-${idRef.current++}`,
          name: file.name,
          size: file.size,
          bytes,
          pageCount: pdf.getPageCount(),
          pageRotations: pdf.getPages().map((page) => page.getRotation().angle),
          previewPdf,
        });
      }

      loaded.forEach((document) => {
        if (document.previewPdf) {
          previewDocumentsRef.current.set(document.id, document.previewPdf);
        }
      });

      setDocuments((current) => [...current, ...loaded]);
      setPages((current) => [
        ...current,
        ...loaded.flatMap((document) =>
          Array.from({ length: document.pageCount }, (_, pageIndex) => ({
            id: `page-${idRef.current++}`,
            docId: document.id,
            docName: document.name,
            pageIndex,
            baseRotation: document.pageRotations[pageIndex],
            rotation: 0,
          }))
        ),
      ]);
      setStatus(`${loaded.length} PDF${loaded.length === 1 ? "" : "s"} agregado${loaded.length === 1 ? "" : "s"}.`);
    } catch (uploadError) {
      loaded.forEach((document) => document.previewPdf?.destroy());
      setError(uploadError.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePreview = async (enabled) => {
    clearMessages();
    setPreviewEnabled(enabled);

    if (!enabled) {
      setDocuments((current) =>
        current.map((document) => ({ ...document, previewPdf: null }))
      );
      setStatus("Vista previa desactivada.");
      return;
    }

    if (!documents.length) {
      setStatus("Vista previa activada.");
      return;
    }

    const generated = [];
    setBusy(true);
    try {
      for (const document of documents) {
        if (document.previewPdf) continue;
        try {
          generated.push([document.id, await loadPreviewPdf(document.bytes)]);
        } catch {
          throw new Error(`No se pudo generar la vista previa de ${document.name}.`);
        }
      }

      const generatedById = new Map(generated);
      generated.forEach(([documentId, previewPdf]) => {
        previewDocumentsRef.current.set(documentId, previewPdf);
      });
      setDocuments((current) =>
        current.map((document) => ({
          ...document,
          previewPdf: generatedById.get(document.id) || document.previewPdf,
        }))
      );
      setStatus("Vista previa activada.");
    } catch (previewError) {
      generated.forEach(([, previewPdf]) => previewPdf.destroy());
      setPreviewEnabled(false);
      setError(previewError.message);
    } finally {
      setBusy(false);
    }
  };

  const reorderDocument = (index, offset) => {
    const nextDocuments = moveItem(documents, index, offset);
    setDocuments(nextDocuments);
    setPages((current) =>
      nextDocuments.flatMap((document) => current.filter((page) => page.docId === document.id))
    );
    clearMessages();
  };

  const removeDocument = (documentId) => {
    const document = documents.find((item) => item.id === documentId);
    const pageCount = pages.filter((page) => page.docId === documentId).length;
    if (
      !document ||
      !window.confirm(
        `¿Seguro que deseas quitar ${document.name}? Se eliminarán ${pageCount} hoja${pageCount === 1 ? "" : "s"} del resultado.`
      )
    ) {
      return;
    }

    setDocuments((current) => current.filter((document) => document.id !== documentId));
    setPages((current) => current.filter((page) => page.docId !== documentId));
    clearMessages();
  };

  const resetPages = () => {
    setPages(
      documents.flatMap((document) =>
        Array.from({ length: document.pageCount }, (_, pageIndex) => ({
          id: `page-${idRef.current++}`,
          docId: document.id,
          docName: document.name,
          pageIndex,
          baseRotation: document.pageRotations[pageIndex],
          rotation: 0,
        }))
      )
    );
    clearMessages();
  };

  const applyRangeOrder = () => {
    clearMessages();
    try {
      const indexes = parsePageRange(range, pages.length);
      setPages(
        indexes.map((index) => ({ ...pages[index], id: `page-${idRef.current++}` }))
      );
      setRange("");
      setStatus("El orden y la selección se aplicaron al resultado.");
    } catch (rangeError) {
      setError(rangeError.message);
    }
  };

  const removeRange = () => {
    clearMessages();
    try {
      const selected = new Set(parsePageRange(range, pages.length));
      const next = pages.filter((_, index) => !selected.has(index));
      if (!next.length) throw new Error("El resultado debe conservar al menos una página.");
      if (
        !window.confirm(
          `¿Seguro que deseas eliminar ${selected.size} hoja${selected.size === 1 ? "" : "s"} del resultado?`
        )
      ) {
        return;
      }
      setPages(next);
      setRange("");
      setStatus("Las páginas seleccionadas se eliminaron.");
    } catch (rangeError) {
      setError(rangeError.message);
    }
  };

  const rotateRange = () => {
    clearMessages();
    try {
      const selected = new Set(parsePageRange(range, pages.length));
      setPages((current) =>
        current.map((page, index) =>
          selected.has(index)
            ? { ...page, rotation: (page.rotation + rotation + 360) % 360 }
            : page
        )
      );
      setStatus("La rotación se aplicó al rango indicado.");
    } catch (rangeError) {
      setError(rangeError.message);
    }
  };

  const rotatePage = (pageId, amount) => {
    setPages((current) =>
      current.map((page) =>
        page.id === pageId
          ? { ...page, rotation: (page.rotation + amount + 360) % 360 }
          : page
      )
    );
    clearMessages();
  };

  const removePage = (page, index) => {
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar la hoja ${index + 1} del resultado? El PDF original no se modificará.`
      )
    ) {
      return;
    }
    setPages((current) => current.filter((item) => item.id !== page.id));
    clearMessages();
    setStatus("Hoja eliminada del resultado.");
  };

  const downloadMerged = async () => {
    if (!pages.length) return;
    clearMessages();
    setBusy(true);
    try {
      const bytes = await buildPdfFromPages(documents, pages, outputName);
      downloadBlob(new Blob([bytes], { type: "application/pdf" }), `${safeName(outputName)}.pdf`);
      setStatus("PDF generado correctamente.");
    } catch (generationError) {
      setError(`No se pudo generar el PDF: ${generationError.message}`);
    } finally {
      setBusy(false);
    }
  };

  const downloadSplit = async () => {
    if (!pages.length) return;
    clearMessages();
    setBusy(true);
    try {
      const groups = parseRangeGroups(splitRanges, pages.length);
      const zipBytes = await buildPdfZip(documents, pages, groups, outputName);
      downloadBlob(
        new Blob([zipBytes], { type: "application/zip" }),
        `${safeName(outputName)}-partes.zip`
      );
      setStatus(`${groups.length} archivos PDF generados dentro de un ZIP.`);
    } catch (splitError) {
      setError(`No se pudieron separar los rangos: ${splitError.message}`);
    } finally {
      setBusy(false);
    }
  };

  const clearAll = () => {
    if (!window.confirm("¿Seguro que deseas quitar todos los PDF y reiniciar la herramienta?")) {
      return;
    }
    setDocuments([]);
    setPages([]);
    setRange("");
    setSplitRanges("");
    clearMessages();
  };

  return (
    <section className={styles.wrapper}>
      <header className={styles.hero}>
        <div>
          <span className={styles.kicker}>PDF Studio</span>
          <h1>Unir y organizar archivos PDF</h1>
          <p>
            Combina documentos, cambia el orden de sus páginas, extrae rangos,
            gira hojas y separa el resultado en varios PDF.
          </p>
        </div>
        <aside className={styles.privacyNote}>
          Todo se procesa localmente en tu navegador. Los archivos no se suben
          ni se almacenan en ningún servidor.
        </aside>
      </header>

      <div className={styles.previewSetting}>
        <div>
          <strong>Miniaturas de las hojas</strong>
          <span>Actívalas cuando necesites revisar visualmente cada página.</span>
        </div>
        <label className={styles.previewToggle}>
          <input
            type="checkbox"
            checked={previewEnabled}
            disabled={busy}
            onChange={(event) => togglePreview(event.target.checked)}
          />
          <span className={styles.toggleTrack} aria-hidden="true"><span /></span>
          <span>{previewEnabled ? "Activadas" : "Desactivadas"}</span>
        </label>
      </div>

      <label className={styles.uploader}>
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          disabled={busy}
          onChange={async (event) => {
            await handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <strong>{busy ? "Procesando archivos…" : "Seleccionar archivos PDF"}</strong>
        <span>Puedes elegir varios a la vez · máximo total 250 MB</span>
      </label>

      {documents.length > 0 && (
        <>
          <div className={styles.workspace}>
            <section className={styles.panel} aria-labelledby="documents-title">
              <div className={styles.panelHeader}>
                <div>
                  <h2 id="documents-title">Archivos</h2>
                  <p>{documents.length} PDF · {formatBytes(totalBytes)}</p>
                </div>
                <button type="button" className={styles.textButton} onClick={clearAll} disabled={busy}>
                  Quitar todos
                </button>
              </div>

              <ol className={styles.documentList}>
                {documents.map((document, index) => (
                  <li key={document.id}>
                    <span className={styles.orderNumber}>{index + 1}</span>
                    <div className={styles.documentInfo}>
                      <strong>{document.name}</strong>
                      <span>
                        {document.pageCount} página{document.pageCount === 1 ? "" : "s"} · {formatBytes(document.size)}
                      </span>
                    </div>
                    <div className={styles.rowActions}>
                      <button type="button" onClick={() => reorderDocument(index, -1)} disabled={busy || index === 0} aria-label={`Subir ${document.name}`}>↑</button>
                      <button type="button" onClick={() => reorderDocument(index, 1)} disabled={busy || index === documents.length - 1} aria-label={`Bajar ${document.name}`}>↓</button>
                      <button type="button" onClick={() => removeDocument(document.id)} disabled={busy} aria-label={`Quitar ${document.name}`}>×</button>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.panel} aria-labelledby="ranges-title">
              <div className={styles.panelHeader}>
                <div>
                  <h2 id="ranges-title">Rangos y orden libre</h2>
                  <p>Usa la numeración actual del resultado.</p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pdf-range">Páginas</label>
                <input id="pdf-range" value={range} onChange={(event) => setRange(event.target.value)} placeholder="Ej. 3, 1-2, 8-6" disabled={busy || !pages.length} />
                <small>Admite páginas sueltas, rangos, orden descendente y repeticiones.</small>
              </div>

              <div className={styles.actionGrid}>
                <button type="button" onClick={applyRangeOrder} disabled={busy || !pages.length}>Aplicar orden / extraer</button>
                <button type="button" onClick={removeRange} disabled={busy || !pages.length}>Eliminar rango</button>
                <select value={rotation} onChange={(event) => setRotation(Number(event.target.value))} aria-label="Ángulo de giro" disabled={busy}>
                  <option value={90}>Girar 90°</option>
                  <option value={180}>Girar 180°</option>
                  <option value={-90}>Girar -90°</option>
                </select>
                <button type="button" onClick={rotateRange} disabled={busy || !pages.length}>Girar rango</button>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pdf-split-ranges">Separar en varios PDF</label>
                <textarea id="pdf-split-ranges" value={splitRanges} onChange={(event) => setSplitRanges(event.target.value)} placeholder="Ej. 1-3; 4-6; 7, 9" rows={2} disabled={busy || !pages.length} />
                <small>Separa cada archivo con punto y coma. Se descargarán dentro de un ZIP.</small>
              </div>
              <button type="button" className={styles.secondaryButton} onClick={downloadSplit} disabled={busy || !pages.length}>
                Separar y descargar ZIP
              </button>
            </section>
          </div>

          <section className={styles.pagesPanel} aria-labelledby="pages-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="pages-title">Orden final</h2>
                <p>{pages.length} hoja{pages.length === 1 ? "" : "s"}</p>
              </div>
              <button type="button" className={styles.textButton} onClick={resetPages} disabled={busy}>
                Restablecer hojas
              </button>
            </div>

            <ol className={styles.pageList}>
              {pages.map((page, index) => (
                <li key={page.id}>
                  <span className={styles.pagePosition}>{index + 1}</span>
                  {previewEnabled ? (
                    <PdfThumbnail
                      pdf={documentById.get(page.docId)?.previewPdf}
                      pageNumber={page.pageIndex + 1}
                      rotation={(page.baseRotation + page.rotation + 360) % 360}
                    />
                  ) : (
                    <div className={styles.thumbnail} aria-hidden="true">
                      <span className={styles.thumbnailPlaceholder}>Vista previa desactivada</span>
                    </div>
                  )}
                  <div className={styles.pageInfo}>
                    <strong>Hoja {index + 1}</strong>
                    <span title={page.docName}>Pág. {page.pageIndex + 1} · {page.docName}{page.rotation ? ` · ${page.rotation}°` : ""}</span>
                  </div>
                  <div className={`${styles.rowActions} ${styles.pageActions}`}>
                    <button type="button" onClick={() => setPages((current) => moveItem(current, index, -1))} disabled={busy || index === 0} aria-label={`Subir página ${index + 1}`}>↑</button>
                    <button type="button" onClick={() => setPages((current) => moveItem(current, index, 1))} disabled={busy || index === pages.length - 1} aria-label={`Bajar página ${index + 1}`}>↓</button>
                    <button type="button" onClick={() => rotatePage(page.id, -90)} disabled={busy} aria-label={`Girar página ${index + 1} a la izquierda`}>↺</button>
                    <button type="button" onClick={() => rotatePage(page.id, 90)} disabled={busy} aria-label={`Girar página ${index + 1} a la derecha`}>↻</button>
                    <button type="button" onClick={() => removePage(page, index)} disabled={busy || pages.length === 1} aria-label={`Eliminar página ${index + 1}`}>×</button>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.downloadPanel}>
            <div className={styles.formGroup}>
              <label htmlFor="pdf-output-name">Nombre del resultado</label>
              <input id="pdf-output-name" value={outputName} onChange={(event) => setOutputName(event.target.value)} disabled={busy} />
            </div>
            <div className={styles.downloadAction}>
              <button type="button" className={styles.primaryButton} onClick={downloadMerged} disabled={busy || !pages.length}>
                {busy ? "Generando…" : "Unir y descargar PDF"}
              </button>
              <p className={styles.accessibilityNote}>{ACCESSIBILITY_WARNING}</p>
            </div>
          </section>
        </>
      )}

      <div className={styles.messages} aria-live="polite">
        {error && <p className={styles.error}>{error}</p>}
        {status && <p className={styles.success}>{status}</p>}
      </div>
    </section>
  );
}
