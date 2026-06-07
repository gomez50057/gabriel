import { formatBytes } from "@/lib/imageOptimizer/imageHelpers";

const STATUS_LABELS = {
  pending: "Pendiente",
  processing: "Procesando",
  optimized: "Optimizada",
  error: "Error",
};

export default function ImageCard({
  image,
  isActive,
  disabled,
  onSelect,
  onToggle,
  onOptimize,
  onDownload,
  onRemove,
  styles,
}) {
  return (
    <article className={isActive ? styles.imageCardActive : styles.imageCard}>
      <div className={styles.cardTop}>
        <label className={styles.selectionLabel}>
          <input
            type="checkbox"
            checked={image.selected}
            disabled={disabled}
            onChange={() => onToggle(image.id)}
          />
          Seleccionar
        </label>
        <span className={styles.statusBadge}>{STATUS_LABELS[image.status] || image.status}</span>
      </div>

      <button type="button" className={styles.previewButton} onClick={() => onSelect(image.id)}>
        <img src={image.optimizedUrl || image.originalUrl} alt={`Vista previa de ${image.originalName}`} />
      </button>

      <div className={styles.cardBody}>
        <h3>{image.originalName}</h3>
        <dl className={styles.metaGrid}>
          <div>
            <dt>Peso original</dt>
            <dd>{formatBytes(image.originalSize)}</dd>
          </div>
          <div>
            <dt>Peso optimizado</dt>
            <dd>{image.optimizedSize ? formatBytes(image.optimizedSize) : "-"}</dd>
          </div>
          <div>
            <dt>Reduccion</dt>
            <dd>{image.optimizedSize ? `${image.reductionPercentage}%` : "-"}</dd>
          </div>
        </dl>
        {image.error && <p className={styles.cardError}>{image.error}</p>}
      </div>

      <div className={styles.cardActions}>
        <button type="button" className={styles.smallButton} disabled={disabled} onClick={() => onOptimize(image.id)}>
          Convertir a WebP
        </button>
        <button
          type="button"
          className={styles.smallButton}
          disabled={disabled || !image.optimizedBlob}
          onClick={() => onDownload(image.id)}
        >
          Descargar imagen
        </button>
        <button type="button" className={styles.textButton} disabled={disabled} onClick={() => onRemove(image.id)}>
          Quitar
        </button>
      </div>
    </article>
  );
}
