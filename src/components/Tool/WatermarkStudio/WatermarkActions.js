export default function WatermarkActions({
  hasFile,
  hasOutput,
  isProcessing,
  onResetConfig,
  onGenerate,
  onDownload,
  onClearFile,
  styles,
}) {
  return (
    <section className={styles.actionsPanel}>
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={isProcessing}
        onClick={onResetConfig}
      >
        Restablecer configuracion
      </button>
      <button
        type="button"
        className={styles.primaryButton}
        disabled={!hasFile || isProcessing}
        onClick={onGenerate}
      >
        {isProcessing ? "Procesando..." : "Generar archivo"}
      </button>
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={!hasOutput || isProcessing}
        onClick={onDownload}
      >
        Descargar archivo
      </button>
      <button
        type="button"
        className={styles.dangerButton}
        disabled={!hasFile || isProcessing}
        onClick={onClearFile}
      >
        Limpiar archivo
      </button>
    </section>
  );
}
