export default function DownloadActions({
  images,
  disabled,
  onOptimizeAll,
  onDownloadSelected,
  onDownloadAll,
  onDownloadZip,
  onClear,
  styles,
}) {
  const optimizedCount = images.filter((image) => image.optimizedBlob).length;
  const selectedOptimizedCount = images.filter((image) => image.selected && image.optimizedBlob).length;

  return (
    <section className={styles.actionsPanel}>
      <button type="button" className={styles.primaryButton} disabled={disabled || !images.length} onClick={onOptimizeAll}>
        Optimizar todo
      </button>
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={disabled || !selectedOptimizedCount}
        onClick={onDownloadSelected}
      >
        Descargar seleccionadas
      </button>
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={disabled || !optimizedCount}
        onClick={onDownloadAll}
      >
        Descargar todo
      </button>
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={disabled || !optimizedCount}
        onClick={onDownloadZip}
      >
        Descargar ZIP
      </button>
      <button type="button" className={styles.textButton} disabled={disabled || !images.length} onClick={onClear}>
        Limpiar catalogo
      </button>
    </section>
  );
}
