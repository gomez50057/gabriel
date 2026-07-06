import {
  BODY_SHAPES,
  CORNER_DOT_SHAPES,
  CORNER_SQUARE_SHAPES,
  ERROR_CORRECTION_LEVELS,
  EXPORT_FORMATS,
  DEFAULT_QR_LOGOS,
  MAX_LOGO_SIZE_BYTES,
  QR_COLOR_SWATCHES,
} from "@/lib/qr/qrDefaults";

const BODY_LABELS = {
  square: "Cuadros rectos",
  rounded: "Cuadros suaves",
  dots: "Puntos",
  "extra-rounded": "Muy redondeado",
  classy: "Cortes elegantes",
  "classy-rounded": "Cortes suaves",
};

const CORNER_LABELS = {
  square: "Marco cuadrado",
  dot: "Marco circular",
  "extra-rounded": "Marco redondeado",
};

const DOT_LABELS = {
  square: "Centro cuadrado",
  dot: "Centro circular",
};

const ERROR_LABELS = {
  L: "Basica",
  M: "Media",
  Q: "Alta",
  H: "Maxima",
};

function SelectField({ id, label, value, options, labels = {}, disabled, onChange, styles }) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] || option.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

function ColorField({ id, label, value, disabled, onChange, styles }) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.colorRow}>
        <input id={id} type="color" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
        <input type="text" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      </div>
      <div className={styles.swatches}>
        {QR_COLOR_SWATCHES.map((color) => (
          <button
            key={`${id}-${color}`}
            type="button"
            className={styles.swatch}
            style={{ backgroundColor: color }}
            aria-label={`Usar color ${color}`}
            disabled={disabled}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  );
}

function BodyShapeIcon({ value }) {
  const commonModules = [
    [12, 12],
    [28, 12],
    [44, 12],
    [20, 28],
    [36, 28],
    [52, 28],
    [12, 44],
    [28, 44],
    [44, 44],
  ];

  if (value === "dots") {
    return (
      <>
        {commonModules.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x + 5} cy={y + 5} r="5" />
        ))}
      </>
    );
  }

  if (value === "extra-rounded") {
    return (
      <>
        <rect x="9" y="9" width="20" height="20" rx="9" />
        <rect x="35" y="9" width="20" height="20" rx="9" />
        <rect x="9" y="35" width="20" height="20" rx="9" />
        <rect x="35" y="35" width="20" height="20" rx="9" />
        <rect x="29" y="29" width="8" height="8" rx="3" />
      </>
    );
  }

  if (value === "classy") {
    return (
      <>
        <path d="M9 9h18v10h-8v8H9z" />
        <path d="M37 9h18v18H45v-8h-8z" />
        <path d="M9 37h18v18H17v-8H9z" />
        <path d="M37 37h18v10h-8v8H37z" />
        <rect x="29" y="29" width="8" height="8" />
      </>
    );
  }

  if (value === "classy-rounded") {
    return (
      <>
        <path d="M9 17a8 8 0 0 1 8-8h10v10h-8v8H9z" />
        <path d="M37 9h10a8 8 0 0 1 8 8v10H45v-8h-8z" />
        <path d="M9 37h10v8h8v10H17a8 8 0 0 1-8-8z" />
        <path d="M45 37h10v10a8 8 0 0 1-8 8H37V45h8z" />
        <rect x="29" y="29" width="8" height="8" rx="3" />
      </>
    );
  }

  return (
    <>
      {commonModules.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="10" height="10" rx={value === "rounded" ? "3" : "0"} />
      ))}
    </>
  );
}

function CornerShapeIcon({ value }) {
  if (value === "dot") {
    return (
      <>
        <circle cx="32" cy="32" r="21" fill="none" stroke="currentColor" strokeWidth="9" />
        <circle cx="32" cy="32" r="7" />
      </>
    );
  }

  return (
    <>
      <rect
        x="12"
        y="12"
        width="40"
        height="40"
        rx={value === "extra-rounded" ? "13" : "0"}
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
      />
      <rect x="27" y="27" width="10" height="10" rx={value === "extra-rounded" ? "4" : "0"} />
    </>
  );
}

function DotShapeIcon({ value }) {
  if (value === "dot") {
    return (
      <>
        <circle cx="20" cy="20" r="8" />
        <circle cx="44" cy="20" r="8" />
        <circle cx="20" cy="44" r="8" />
        <circle cx="44" cy="44" r="8" />
      </>
    );
  }

  return (
    <>
      <rect x="12" y="12" width="16" height="16" />
      <rect x="36" y="12" width="16" height="16" />
      <rect x="12" y="36" width="16" height="16" />
      <rect x="36" y="36" width="16" height="16" />
    </>
  );
}

function ShapePreview({ type, value, label, styles }) {
  return (
    <svg className={styles.shapeSvg} viewBox="0 0 64 64" role="img" aria-label={label}>
      {type === "body" && <BodyShapeIcon value={value} />}
      {type === "corner" && <CornerShapeIcon value={value} />}
      {type === "dot" && <DotShapeIcon value={value} />}
    </svg>
  );
}

function ShapePicker({ legend, type, value, options, labels, disabled, onChange, styles }) {
  return (
    <fieldset className={styles.shapePicker}>
      <legend>{legend}</legend>
      <div className={styles.shapeGrid}>
        {options.map((option) => {
          const label = labels[option] || option;
          const isSelected = option === value;

          return (
            <button
              key={option}
              type="button"
              className={isSelected ? styles.shapeOptionActive : styles.shapeOption}
              aria-pressed={isSelected}
              aria-label={label}
              title={label}
              disabled={disabled}
              onClick={() => onChange(option)}
            >
              <ShapePreview type={type} value={option} label={label} styles={styles} />
              <span className={styles.srOnly}>{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function CollapsibleSection({ title, children, styles, defaultOpen = true }) {
  return (
    <details className={styles.controlSection} open={defaultOpen}>
      <summary>
        <span>{title}</span>
        <span className={styles.sectionChevron} aria-hidden="true" />
      </summary>
      <div className={styles.sectionBody}>{children}</div>
    </details>
  );
}

export default function QrDesignControls({
  config,
  disabled,
  logoPreparing,
  onConfigChange,
  onLogoSelect,
  onDefaultLogoSelect,
  onLogoRemove,
  styles,
}) {
  const updateField = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.eyebrow}>Diseno</span>
        <h2>Estilo y descarga</h2>
      </div>

      <CollapsibleSection title="Tamano y archivo" styles={styles}>
        <div className={styles.twoColumns}>
          <div className={styles.formGroup}>
            <label htmlFor="qr-size">Tamano</label>
            <input
              id="qr-size"
              type="number"
              min="256"
              max="2048"
              step="64"
              value={config.size}
              disabled={disabled}
              onChange={(event) => updateField("size", Number(event.target.value))}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="qr-margin">Margen blanco</label>
            <input
              id="qr-margin"
              type="number"
              min="0"
              max="80"
              step="4"
              value={config.margin}
              disabled={disabled}
              onChange={(event) => updateField("margin", Number(event.target.value))}
            />
          </div>
        </div>

        <div className={styles.twoColumns}>
          <SelectField
            id="qr-error"
            label="Lectura"
            value={config.errorCorrectionLevel}
            options={ERROR_CORRECTION_LEVELS}
            labels={ERROR_LABELS}
            disabled={disabled}
            onChange={(value) => updateField("errorCorrectionLevel", value)}
            styles={styles}
          />
          <SelectField
            id="qr-export"
            label="Descarga"
            value={config.exportFormat}
            options={EXPORT_FORMATS}
            disabled={disabled}
            onChange={(value) => updateField("exportFormat", value)}
            styles={styles}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Formas" styles={styles}>
        <ShapePicker
          legend="Cuerpo del QR"
          type="body"
          value={config.bodyShape}
          options={BODY_SHAPES}
          labels={BODY_LABELS}
          disabled={disabled}
          onChange={(value) => updateField("bodyShape", value)}
          styles={styles}
        />
        <ShapePicker
          legend="Marco de esquinas"
          type="corner"
          value={config.cornerSquareShape}
          options={CORNER_SQUARE_SHAPES}
          labels={CORNER_LABELS}
          disabled={disabled}
          onChange={(value) => updateField("cornerSquareShape", value)}
          styles={styles}
        />
        <ShapePicker
          legend="Centro de esquinas"
          type="dot"
          value={config.cornerDotShape}
          options={CORNER_DOT_SHAPES}
          labels={DOT_LABELS}
          disabled={disabled}
          onChange={(value) => updateField("cornerDotShape", value)}
          styles={styles}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Colores" styles={styles}>
        <div className={styles.colorGrid}>
          <ColorField id="qr-body-color" label="Cuerpo" value={config.bodyColor} disabled={disabled} onChange={(value) => updateField("bodyColor", value)} styles={styles} />
          <ColorField id="qr-corner-color" label="Marcos" value={config.cornerSquareColor} disabled={disabled} onChange={(value) => updateField("cornerSquareColor", value)} styles={styles} />
          <ColorField id="qr-dot-color" label="Centros" value={config.cornerDotColor} disabled={disabled} onChange={(value) => updateField("cornerDotColor", value)} styles={styles} />
          <ColorField id="qr-bg-color" label="Fondo" value={config.backgroundColor} disabled={disabled} onChange={(value) => updateField("backgroundColor", value)} styles={styles} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Logo" styles={styles} defaultOpen={false}>
        <div className={styles.logoBox}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={config.logoEnabled}
              disabled={disabled}
              onChange={(event) => updateField("logoEnabled", event.target.checked)}
            />
            Usar logo
          </label>

          <div className={styles.logoActions}>
            <label className={styles.fileButton}>
              Cargar logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                disabled={disabled}
                onChange={(event) => onLogoSelect(event.target.files?.[0])}
              />
            </label>
            {config.logoUrl && (
              <button type="button" className={styles.secondaryButton} disabled={disabled} onClick={onLogoRemove}>
                Quitar logo
              </button>
            )}
          </div>

          <div className={styles.logoPresets} aria-label="Logos por defecto">
            {DEFAULT_QR_LOGOS.map((logo) => (
              <button
                key={logo.url}
                type="button"
                className={config.logoUrl === logo.url ? styles.logoPresetActive : styles.logoPreset}
                disabled={disabled}
                onClick={() => onDefaultLogoSelect(logo)}
              >
                <img src={logo.url} alt="" aria-hidden="true" />
                <span>{logo.label}</span>
              </button>
            ))}
          </div>

          <p className={styles.fieldHint}>
            Maximo {(MAX_LOGO_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB. {logoPreparing ? "Preparando logo..." : config.logoName || ""}
          </p>
          <p className={styles.logoWarning}>
            Recomendado: logo menor al 25% y lectura en Maxima para mantener el QR facil de escanear.
          </p>

          <div className={styles.twoColumns}>
            <div className={styles.formGroup}>
              <label htmlFor="qr-logo-size">Tamano logo</label>
              <input
                id="qr-logo-size"
                type="range"
                min="0.05"
                max="0.25"
                step="0.01"
                value={config.logoSize}
                disabled={disabled}
                onChange={(event) => updateField("logoSize", Number(event.target.value))}
              />
              <span className={styles.valuePill}>{Math.round(Number(config.logoSize) * 100)}%</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="qr-logo-padding">Relleno logo</label>
              <input
                id="qr-logo-padding"
                type="range"
                min="0"
                max="40"
                step="1"
                value={config.logoPadding}
                disabled={disabled}
                onChange={(event) => updateField("logoPadding", Number(event.target.value))}
              />
              <span className={styles.valuePill}>{config.logoPadding}px</span>
            </div>
          </div>

          <div className={styles.twoColumns}>
            <ColorField id="qr-logo-bg" label="Fondo logo" value={config.logoBackgroundColor} disabled={disabled} onChange={(value) => updateField("logoBackgroundColor", value)} styles={styles} />
            <div className={styles.formGroup}>
              <label htmlFor="qr-logo-radius">Esquinas logo</label>
              <input
                id="qr-logo-radius"
                type="range"
                min="0"
                max="80"
                step="1"
                value={config.logoBorderRadius}
                disabled={disabled}
                onChange={(event) => updateField("logoBorderRadius", Number(event.target.value))}
              />
              <span className={styles.valuePill}>{config.logoBorderRadius}px</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </section>
  );
}
