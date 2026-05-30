"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const WatermarkPdfPagePreview = dynamic(() => import("./WatermarkPdfPagePreview"), {
  ssr: false,
  loading: () => null,
});

const SINGLE_POSITION_CLASS = {
  center: "watermarkCenter",
  "top-left": "watermarkTopLeft",
  "top-right": "watermarkTopRight",
  "bottom-left": "watermarkBottomLeft",
  "bottom-right": "watermarkBottomRight",
};

function useElementWidth(ref, trigger = "") {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, trigger]);

  return width;
}

function getPreviewFontSize(fontSize, displayScale) {
  const size = Number(fontSize);
  const scale = Number(displayScale);

  if (!Number.isFinite(size)) {
    return 42;
  }

  if (!Number.isFinite(scale) || scale <= 0) {
    return Math.max(18, Math.min(280, size * 0.72));
  }

  return Math.max(14, Math.min(280, size * scale));
}

function getCustomPositionStyle(config, sourceSize, fileKind) {
  const x = Number(config.customX);
  const y = Number(config.customY);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return {};
  }

  if (sourceSize.width && sourceSize.height) {
    const top = fileKind === "pdf" ? sourceSize.height - y : y;

    return {
      left: `${(x / sourceSize.width) * 100}%`,
      top: `${(top / sourceSize.height) * 100}%`,
    };
  }

  return {
    left: x,
    top: y,
  };
}

function WatermarkOverlay({
  config,
  fileKind,
  sourceSize,
  displayScale,
  isDragging,
  onDragStart,
  styles,
}) {
  const previewFontSize = getPreviewFontSize(config.fontSize, displayScale);
  const overlayStyle = {
    color: config.color,
    opacity: Number(config.opacity),
    fontWeight: Number(config.fontWeight),
    fontSize: `${previewFontSize}px`,
    "--watermark-rotation": `${Number(config.rotation)}deg`,
  };

  if (config.repeat) {
    const aspectRatio =
      sourceSize.width && sourceSize.height ? sourceSize.height / sourceSize.width : 1;
    const itemCount = Math.min(240, Math.max(64, Math.ceil(aspectRatio * 48)));
    const repeatedItems = Array.from({ length: itemCount }, (_, index) => index);
    const scale = Number.isFinite(displayScale) && displayScale > 0 ? displayScale : 0.42;

    return (
      <div
        className={styles.watermarkPattern}
        style={{
          ...overlayStyle,
          "--watermark-gap-x": `${Math.max(80, Number(config.repeatGapX) * scale)}px`,
          "--watermark-gap-y": `${Math.max(64, Number(config.repeatGapY) * scale)}px`,
        }}
      >
        {repeatedItems.map((item) => (
          <span key={item}>{config.text}</span>
        ))}
      </div>
    );
  }

  const customStyle =
    config.position === "custom" ? getCustomPositionStyle(config, sourceSize, fileKind) : {};
  const positionClass = SINGLE_POSITION_CLASS[config.position] || SINGLE_POSITION_CLASS.center;

  return (
    <span
      className={`${styles.watermarkSingle} ${styles[positionClass]} ${
        isDragging ? styles.watermarkDragging : ""
      }`}
      style={{
        ...overlayStyle,
        ...customStyle,
      }}
      role="button"
      tabIndex={0}
      aria-label="Arrastrar marca de agua"
      onPointerDown={onDragStart}
    >
      {config.text}
    </span>
  );
}

export default function WatermarkPreview({
  file,
  fileKind,
  previewUrl,
  config,
  totalPages,
  currentPreviewPage,
  isProcessing,
  onTotalPagesChange,
  onCurrentPreviewPageChange,
  onCustomPositionChange,
  onLargeImageDetected,
  onError,
  styles,
}) {
  const previewRef = useRef(null);
  const mediaFrameRef = useRef(null);
  const containerWidth = useElementWidth(previewRef);
  const mediaFrameWidth = useElementWidth(mediaFrameRef, `${previewUrl}-${fileKind}`);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [pdfPageSize, setPdfPageSize] = useState({ width: 0, height: 0 });
  const [isDraggingWatermark, setIsDraggingWatermark] = useState(false);

  const pageWidth = useMemo(() => {
    if (!containerWidth) {
      return 560;
    }

    return Math.max(240, Math.min(760, containerWidth - 32));
  }, [containerWidth]);

  const canGoBack = fileKind === "pdf" && currentPreviewPage > 1;
  const canGoNext = fileKind === "pdf" && totalPages && currentPreviewPage < totalPages;
  const sourceSize = fileKind === "pdf" ? pdfPageSize : imageSize;
  const displayScale =
    sourceSize.width && mediaFrameWidth ? mediaFrameWidth / sourceSize.width : null;

  useEffect(() => {
    setImageSize({ width: 0, height: 0 });
    setPdfPageSize({ width: 0, height: 0 });
  }, [previewUrl, fileKind]);

  const updateCustomPositionFromPointer = useCallback(
    (event) => {
      const frame = mediaFrameRef.current;

      if (!frame || !sourceSize.width || !sourceSize.height) {
        return;
      }

      const rect = frame.getBoundingClientRect();
      const relativeX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
      const relativeY = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
      const customX = Math.round((relativeX / rect.width) * sourceSize.width);
      const customY =
        fileKind === "pdf"
          ? Math.round(sourceSize.height - (relativeY / rect.height) * sourceSize.height)
          : Math.round((relativeY / rect.height) * sourceSize.height);

      onCustomPositionChange({ x: customX, y: customY });
    },
    [fileKind, onCustomPositionChange, sourceSize.height, sourceSize.width]
  );

  const handleWatermarkPointerDown = useCallback(
    (event) => {
      if (event.button !== 0 || config.repeat || isProcessing) {
        return;
      }

      event.preventDefault();
      setIsDraggingWatermark(true);
      updateCustomPositionFromPointer(event);
    },
    [config.repeat, isProcessing, updateCustomPositionFromPointer]
  );

  useEffect(() => {
    if (!isDraggingWatermark) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      updateCustomPositionFromPointer(event);
    };

    const handlePointerUp = () => {
      setIsDraggingWatermark(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingWatermark, updateCustomPositionFromPointer]);

  return (
    <section className={styles.previewPanel} ref={previewRef}>
      <div className={styles.previewHeader}>
        <div>
          <span className={styles.eyebrow}>Vista previa</span>
          <h3>{file ? file.name : "Sin archivo seleccionado"}</h3>
        </div>

        {fileKind === "pdf" && totalPages ? (
          <div className={styles.pageStepper}>
            <button
              type="button"
              disabled={!canGoBack || isProcessing}
              onClick={() => onCurrentPreviewPageChange(currentPreviewPage - 1)}
            >
              Anterior
            </button>
            <span>
              {currentPreviewPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={!canGoNext || isProcessing}
              onClick={() => onCurrentPreviewPageChange(currentPreviewPage + 1)}
            >
              Siguiente
            </button>
          </div>
        ) : null}
      </div>

      {previewUrl && fileKind === "image" && imageSize.width > 0 && (
        <p className={styles.previewMeta}>
          Vista previa escalada al ancho del panel. La descarga conserva {imageSize.width} x{" "}
          {imageSize.height} px.
        </p>
      )}

      <div className={styles.previewCanvas}>
        {!previewUrl && (
          <div className={styles.previewPlaceholder}>
            Carga un archivo para ver la marca de agua antes de generar la copia.
          </div>
        )}

        {previewUrl && fileKind === "image" && (
          <div className={styles.mediaFrame} ref={mediaFrameRef}>
            <img
              src={previewUrl}
              alt="Vista previa del archivo cargado"
              onLoad={(event) => {
                setImageSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                });
                onLargeImageDetected?.({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                });
              }}
            />
            <WatermarkOverlay
              config={config}
              fileKind={fileKind}
              sourceSize={sourceSize}
              displayScale={displayScale}
              isDragging={isDraggingWatermark}
              onDragStart={handleWatermarkPointerDown}
              styles={styles}
            />
          </div>
        )}

        {previewUrl && fileKind === "pdf" && (
          <div className={styles.mediaFrame} ref={mediaFrameRef}>
            <WatermarkPdfPagePreview
              previewUrl={previewUrl}
              pageWidth={pageWidth}
              currentPreviewPage={currentPreviewPage}
              onTotalPagesChange={onTotalPagesChange}
              onCurrentPreviewPageChange={onCurrentPreviewPageChange}
              onPageSizeChange={setPdfPageSize}
              onError={onError}
              styles={styles}
            />
            <WatermarkOverlay
              config={config}
              fileKind={fileKind}
              sourceSize={sourceSize}
              displayScale={displayScale}
              isDragging={isDraggingWatermark}
              onDragStart={handleWatermarkPointerDown}
              styles={styles}
            />
          </div>
        )}
      </div>
    </section>
  );
}
