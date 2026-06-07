export default function ImageSettingsPanel({ image, disabled, onSettingsChange, onOptimize, styles }) {
  if (!image) {
    return (
      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.eyebrow}>Individual</span>
          <h2>Configuracion individual</h2>
          <p>Selecciona una imagen del catalogo para ajustar sus valores.</p>
        </div>
      </aside>
    );
  }

  const settings = image.settings;
  const updateSetting = (field, value) => {
    onSettingsChange(image.id, {
      ...settings,
      [field]: value,
    });
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.eyebrow}>Individual</span>
        <h2>Configuracion individual</h2>
        <p>{image.originalName}</p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="image-quality">Calidad</label>
        <input
          id="image-quality"
          type="range"
          min="1"
          max="100"
          value={settings.quality}
          disabled={disabled}
          onChange={(event) => updateSetting("quality", Number(event.target.value))}
        />
        <span className={styles.valuePill}>{settings.quality}%</span>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="image-width">Ancho maximo</label>
        <input
          id="image-width"
          type="number"
          min="1"
          step="1"
          value={settings.maxWidth}
          disabled={disabled}
          onChange={(event) => updateSetting("maxWidth", Number(event.target.value))}
        />
      </div>

      <label className={styles.toggleLabel}>
        <input
          type="checkbox"
          checked={settings.removeMetadata}
          disabled={disabled}
          onChange={(event) => updateSetting("removeMetadata", event.target.checked)}
        />
        Eliminar metadatos
      </label>

      <label className={styles.toggleLabel}>
        <input
          type="checkbox"
          checked={settings.keepAspectRatio}
          disabled={disabled}
          onChange={(event) => updateSetting("keepAspectRatio", event.target.checked)}
        />
        Mantener proporcion
      </label>

      <label className={styles.toggleLabel}>
        <input
          type="checkbox"
          checked={settings.preventUpscale}
          disabled={disabled}
          onChange={(event) => updateSetting("preventUpscale", event.target.checked)}
        />
        No agrandar imagenes pequenas
      </label>

      <button type="button" className={styles.primaryButton} disabled={disabled} onClick={() => onOptimize(image.id)}>
        Optimizar imagen
      </button>
    </aside>
  );
}
