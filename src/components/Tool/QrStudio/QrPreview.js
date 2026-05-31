"use client";

import { useEffect, useRef, useState } from "react";
import { createQrForRecord } from "@/lib/qr/qrGenerator";
import { validateQrConfig, validateQrRecord } from "@/lib/qr/qrValidation";

export default function QrPreview({ record, config, logoPreparing, styles }) {
  const containerRef = useRef(null);
  const [message, setMessage] = useState("Agrega contenido para ver el codigo.");
  const fileLabel = record?.fileName || record?.title;

  useEffect(() => {
    let isActive = true;
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    container.innerHTML = "";

    if (logoPreparing) {
      setMessage("Preparando logo...");
      return undefined;
    }

    if (!record?.title || !record?.value) {
      setMessage("Agrega contenido para ver el codigo.");
      return undefined;
    }

    const configErrors = validateQrConfig(config);
    const recordValidation = validateQrRecord(record);

    if (configErrors.length || recordValidation.errors.length) {
      setMessage(recordValidation.errors[0]?.message || configErrors[0] || "Revisa la configuracion.");
      return undefined;
    }

    try {
      const qrCode = createQrForRecord(recordValidation.record, config);

      qrCode.append(container);

      if (isActive) {
        setMessage("");
      }
    } catch (error) {
      if (isActive) {
        setMessage(error.message || "No fue posible generar la vista previa.");
      }
    }

    return () => {
      isActive = false;
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [record, config, logoPreparing]);

  return (
    <section className={styles.previewPanel}>
      <div className={styles.previewHeader}>
        <div>
          <span className={styles.eyebrow}>Vista previa</span>
          <h2>{record?.title || "Codigo QR"}</h2>
          {fileLabel && (
            <p className={styles.previewMeta}>
              {fileLabel}.{config.exportFormat}
            </p>
          )}
        </div>
        <span className={styles.previewBadge}>{config.exportFormat.toUpperCase()}</span>
      </div>

      <div className={styles.previewCanvas}>
        <div
          className={message ? styles.qrFrameHidden : styles.qrFrame}
          ref={containerRef}
          aria-label="Vista previa del codigo QR"
        />
        {message && <div className={styles.previewPlaceholder}>{message}</div>}
      </div>
    </section>
  );
}
