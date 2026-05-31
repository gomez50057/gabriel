export default function QrActions({
  mode,
  hasManualRecord,
  validCount,
  disabled,
  progress,
  onClearData,
  onResetDesign,
  onDownloadSingle,
  onDownloadZip,
  styles,
}) {
  return (
    <section className={styles.actionsPanel}>
      <button
        type="button"
        className={styles.primaryButton}
        disabled={disabled || (mode === "manual" ? !hasManualRecord : validCount < 1)}
        onClick={onDownloadSingle}
      >
        Descargar QR
      </button>

      {mode !== "manual" && (
        <button
          type="button"
          className={styles.primaryButton}
          disabled={disabled || validCount < 1}
          onClick={onDownloadZip}
        >
          Descargar ZIP
        </button>
      )}

      <button type="button" className={styles.secondaryButton} disabled={disabled} onClick={onClearData}>
        Limpiar datos
      </button>

      <button type="button" className={styles.secondaryButton} disabled={disabled} onClick={onResetDesign}>
        Restablecer diseno
      </button>

      {progress?.label && (
        <div className={styles.progressBox} aria-live="polite">
          <span>{progress.label}</span>
          {progress.total > 0 && (
            <progress value={progress.current} max={progress.total}>
              {progress.current} de {progress.total}
            </progress>
          )}
        </div>
      )}
    </section>
  );
}
