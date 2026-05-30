import {
  APPLY_MODE_OPTIONS,
  COLOR_SWATCHES,
  FONT_WEIGHTS,
  MAX_WATERMARK_FONT_SIZE,
  MIN_WATERMARK_FONT_SIZE,
  POSITION_OPTIONS,
} from "@/lib/watermark/watermarkDefaults";

export default function WatermarkControls({
  config,
  fileKind,
  totalPages,
  isProcessing,
  onConfigChange,
  styles,
}) {
  const updateConfig = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

  const isPdf = fileKind === "pdf";

  return (
    <section className={styles.controlsPanel}>
      <div className={styles.panelHeader}>
        <span className={styles.eyebrow}>Configuracion</span>
        <h3>Marca de agua</h3>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="watermark-text">Texto</label>
        <textarea
          id="watermark-text"
          maxLength={120}
          value={config.text}
          disabled={isProcessing}
          onChange={(event) => updateConfig("text", event.target.value)}
        />
        <span className={styles.fieldHint}>{config.text.length}/120 caracteres</span>
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.formGroup}>
          <label htmlFor="watermark-size">Tamano</label>
          <input
            id="watermark-size"
            type="range"
            min={MIN_WATERMARK_FONT_SIZE}
            max={MAX_WATERMARK_FONT_SIZE}
            step="1"
            value={config.fontSize}
            disabled={isProcessing}
            onChange={(event) => updateConfig("fontSize", Number(event.target.value))}
          />
          <input
            type="number"
            min={MIN_WATERMARK_FONT_SIZE}
            max={MAX_WATERMARK_FONT_SIZE}
            step="1"
            value={config.fontSize}
            disabled={isProcessing}
            onChange={(event) => updateConfig("fontSize", event.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="watermark-opacity">Opacidad</label>
          <input
            id="watermark-opacity"
            type="range"
            min="0.05"
            max="1"
            step="0.01"
            value={config.opacity}
            disabled={isProcessing}
            onChange={(event) => updateConfig("opacity", Number(event.target.value))}
          />
          <span className={styles.valuePill}>{Math.round(Number(config.opacity) * 100)}%</span>
        </div>
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.formGroup}>
          <label htmlFor="watermark-color">Color</label>
          <div className={styles.colorRow}>
            <input
              id="watermark-color"
              type="color"
              value={config.color}
              disabled={isProcessing}
              onChange={(event) => updateConfig("color", event.target.value)}
            />
            <input
              type="text"
              value={config.color}
              disabled={isProcessing}
              onChange={(event) => updateConfig("color", event.target.value)}
            />
          </div>
          <div className={styles.swatches} aria-label="Colores sugeridos">
            {COLOR_SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                className={styles.swatch}
                style={{ backgroundColor: color }}
                disabled={isProcessing}
                aria-label={`Usar color ${color}`}
                onClick={() => updateConfig("color", color)}
              />
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="watermark-weight">Peso Montserrat</label>
          <select
            id="watermark-weight"
            value={config.fontWeight}
            disabled={isProcessing}
            onChange={(event) => updateConfig("fontWeight", Number(event.target.value))}
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight} value={weight}>
                {weight}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.formGroup}>
          <label htmlFor="watermark-position">Posicion</label>
          <select
            id="watermark-position"
            value={config.position}
            disabled={isProcessing}
            onChange={(event) => updateConfig("position", event.target.value)}
          >
            {POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="watermark-rotation">Rotacion</label>
          <input
            id="watermark-rotation"
            type="range"
            min="-90"
            max="90"
            step="1"
            value={config.rotation}
            disabled={isProcessing}
            onChange={(event) => updateConfig("rotation", Number(event.target.value))}
          />
          <span className={styles.valuePill}>{config.rotation} grados</span>
        </div>
      </div>

      {config.position === "custom" && (
        <div className={styles.twoColumns}>
          <div className={styles.formGroup}>
            <label htmlFor="watermark-custom-x">Coordenada X</label>
            <input
              id="watermark-custom-x"
              type="number"
              min="0"
              step="1"
              value={config.customX ?? ""}
              disabled={isProcessing}
              onChange={(event) => updateConfig("customX", event.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="watermark-custom-y">Coordenada Y</label>
            <input
              id="watermark-custom-y"
              type="number"
              min="0"
              step="1"
              value={config.customY ?? ""}
              disabled={isProcessing}
              onChange={(event) => updateConfig("customY", event.target.value)}
            />
          </div>
        </div>
      )}

      <div className={styles.toggleRow}>
        <label>
          <input
            type="checkbox"
            checked={config.repeat}
            disabled={isProcessing}
            onChange={(event) => updateConfig("repeat", event.target.checked)}
          />
          Patron repetido
        </label>
      </div>

      {config.repeat && (
        <div className={styles.twoColumns}>
          <div className={styles.formGroup}>
            <label htmlFor="watermark-gap-x">Separacion X</label>
            <input
              id="watermark-gap-x"
              type="number"
              min="40"
              step="10"
              value={config.repeatGapX}
              disabled={isProcessing}
              onChange={(event) => updateConfig("repeatGapX", event.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="watermark-gap-y">Separacion Y</label>
            <input
              id="watermark-gap-y"
              type="number"
              min="40"
              step="10"
              value={config.repeatGapY}
              disabled={isProcessing}
              onChange={(event) => updateConfig("repeatGapY", event.target.value)}
            />
          </div>
        </div>
      )}

      {isPdf && (
        <div className={styles.pdfControls}>
          <div className={styles.formGroup}>
            <label htmlFor="watermark-apply-mode">
              Aplicacion en PDF {totalPages ? `(${totalPages} paginas)` : ""}
            </label>
            <select
              id="watermark-apply-mode"
              value={config.applyMode}
              disabled={isProcessing}
              onChange={(event) => updateConfig("applyMode", event.target.value)}
            >
              {APPLY_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {config.applyMode === "single" && (
            <div className={styles.formGroup}>
              <label htmlFor="watermark-page-number">Pagina</label>
              <input
                id="watermark-page-number"
                type="number"
                min="1"
                max={totalPages || undefined}
                step="1"
                value={config.pageNumber}
                disabled={isProcessing}
                onChange={(event) => updateConfig("pageNumber", event.target.value)}
              />
            </div>
          )}

          {config.applyMode === "range" && (
            <div className={styles.formGroup}>
              <label htmlFor="watermark-page-range">Rango</label>
              <input
                id="watermark-page-range"
                type="text"
                placeholder="2-5"
                value={config.pageRange}
                disabled={isProcessing}
                onChange={(event) => updateConfig("pageRange", event.target.value)}
              />
            </div>
          )}

          {config.applyMode === "specific" && (
            <div className={styles.formGroup}>
              <label htmlFor="watermark-specific-pages">Paginas especificas</label>
              <input
                id="watermark-specific-pages"
                type="text"
                placeholder="1,3,7"
                value={config.specificPages}
                disabled={isProcessing}
                onChange={(event) => updateConfig("specificPages", event.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
