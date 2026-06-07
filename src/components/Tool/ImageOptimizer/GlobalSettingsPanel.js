export default function GlobalSettingsPanel({
  settings,
  disabled,
  onSettingsChange,
  onApplyToAll,
  onApplyToSelected,
  onReset,
  styles,
}) {
  const updateSetting = (field, value) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.eyebrow}>Configuracion</span>
        <h2>Configuracion global</h2>
        <p>Estos valores se usan para todas las imagenes, salvo que una tenga configuracion individual.</p>
      </div>

      <label className={styles.toggleLabel}>
        <input
          type="checkbox"
          checked={settings.smartOptimization}
          disabled={disabled}
          onChange={(event) => updateSetting("smartOptimization", event.target.checked)}
        />
        Optimizacion inteligente
      </label>

      <div className={styles.formGroup}>
        <label htmlFor="global-quality">Calidad</label>
        <input
          id="global-quality"
          type="range"
          min="1"
          max="100"
          value={settings.quality}
          disabled={disabled}
          onChange={(event) => updateSetting("quality", Number(event.target.value))}
        />
        <span className={styles.valuePill}>{settings.quality}%</span>
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.formGroup}>
          <label htmlFor="global-width">Ancho maximo</label>
          <input
            id="global-width"
            type="number"
            min="1"
            step="1"
            value={settings.maxWidth}
            disabled={disabled}
            onChange={(event) => updateSetting("maxWidth", Number(event.target.value))}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="global-format">Formato de salida</label>
          <select id="global-format" value={settings.outputFormat} disabled={disabled} onChange={() => null}>
            <option value="webp">WebP</option>
          </select>
        </div>
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

      <div className={styles.panelActions}>
        <button type="button" className={styles.secondaryButton} disabled={disabled} onClick={onApplyToAll}>
          Aplicar a todas
        </button>
        <button type="button" className={styles.secondaryButton} disabled={disabled} onClick={onApplyToSelected}>
          Aplicar a seleccionadas
        </button>
        <button type="button" className={styles.textButton} disabled={disabled} onClick={onReset}>
          Restablecer configuracion
        </button>
      </div>
    </aside>
  );
}
