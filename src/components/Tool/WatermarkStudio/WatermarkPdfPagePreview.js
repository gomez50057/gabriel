"use client";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function WatermarkPdfPagePreview({
  previewUrl,
  pageWidth,
  currentPreviewPage,
  onTotalPagesChange,
  onCurrentPreviewPageChange,
  onPageSizeChange,
  onError,
  styles,
}) {
  return (
    <Document
      file={previewUrl}
      loading={<div className={styles.previewPlaceholder}>Cargando PDF...</div>}
      error={<div className={styles.previewPlaceholder}>No fue posible previsualizar el PDF.</div>}
      onLoadSuccess={({ numPages }) => {
        onTotalPagesChange(numPages);

        if (currentPreviewPage > numPages) {
          onCurrentPreviewPageChange(numPages);
        }
      }}
      onLoadError={(error) => {
        console.error(error);
        onError("El PDF parece estar protegido, danado o no puede previsualizarse.");
      }}
    >
      <Page
        pageNumber={currentPreviewPage}
        width={pageWidth}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        onLoadSuccess={(page) => {
          const viewport = page.getViewport({ scale: 1 });
          onPageSizeChange({
            width: viewport.width,
            height: viewport.height,
          });
        }}
      />
    </Document>
  );
}
