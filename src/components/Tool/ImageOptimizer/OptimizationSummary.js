import { formatBytes } from "@/lib/imageOptimizer/imageHelpers";

export default function OptimizationSummary({ images, styles }) {
  const optimizedImages = images.filter((image) => image.optimizedBlob);
  const originalTotal = optimizedImages.reduce((total, image) => total + image.originalSize, 0);
  const optimizedTotal = optimizedImages.reduce((total, image) => total + image.optimizedSize, 0);
  const reduction = originalTotal ? Math.max(0, Math.round(((originalTotal - optimizedTotal) / originalTotal) * 100)) : 0;

  return (
    <section className={styles.summaryPanel}>
      <div className={styles.summaryItem}>
        <span>Imagenes optimizadas</span>
        <strong>
          {optimizedImages.length} / {images.length}
        </strong>
      </div>
      <div className={styles.summaryItem}>
        <span>Peso original</span>
        <strong>{formatBytes(originalTotal)}</strong>
      </div>
      <div className={styles.summaryItem}>
        <span>Peso optimizado</span>
        <strong>{formatBytes(optimizedTotal)}</strong>
      </div>
      <div className={styles.summaryItem}>
        <span>Reduccion</span>
        <strong>{reduction}%</strong>
      </div>
    </section>
  );
}
