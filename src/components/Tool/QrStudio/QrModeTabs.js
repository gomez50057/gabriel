import { QR_MODES } from "@/lib/qr/qrDefaults";

export default function QrModeTabs({ mode, disabled, onModeChange, styles }) {
  return (
    <div className={styles.modeTabs} role="tablist" aria-label="Modo de carga">
      {QR_MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={mode === item.value}
          className={mode === item.value ? styles.modeTabActive : styles.modeTab}
          disabled={disabled}
          onClick={() => onModeChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
