"use client";

import { useEffect, useRef, useState } from "react";
import { Page } from "react-pdf";
import styles from "./PdfOrganizer.module.css";

export default function PdfThumbnail({ pdf, pageNumber, rotation }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={styles.thumbnail} aria-hidden="true">
      {isVisible && pdf ? (
        <Page
          pdf={pdf}
          pageNumber={pageNumber}
          width={220}
          rotate={rotation}
          devicePixelRatio={1}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          loading={<span className={styles.thumbnailPlaceholder}>Cargando…</span>}
          error={<span className={styles.thumbnailPlaceholder}>Sin vista previa</span>}
        />
      ) : (
        <span className={styles.thumbnailPlaceholder}>Cargando…</span>
      )}
    </div>
  );
}
