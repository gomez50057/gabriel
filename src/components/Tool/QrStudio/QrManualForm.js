import { QR_TYPES } from "@/lib/qr/qrDefaults";

const VALUE_HINTS = {
  url: "https://sitio.gob.mx",
  text: "Texto libre",
  email: "correo@dominio.gob.mx",
  phone: "+527711234567",
  whatsapp: "+527711234567",
  wifi: "WIFI:T:WPA;S:NombreRed;P:Clave;;",
  vcard: "BEGIN:VCARD...",
  location: "20.1011,-98.7591",
};

export default function QrManualForm({ record, disabled, onChange, styles }) {
  const updateField = (field, value) => {
    onChange({
      ...record,
      [field]: value,
    });
  };

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.eyebrow}>Datos</span>
        <h2>Contenido del QR</h2>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="qr-title">Titulo</label>
        <input
          id="qr-title"
          type="text"
          value={record.title}
          disabled={disabled}
          placeholder="Nombre visible del codigo"
          onChange={(event) => updateField("title", event.target.value)}
        />
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.formGroup}>
          <label htmlFor="qr-type">Tipo</label>
          <select
            id="qr-type"
            value={record.type}
            disabled={disabled}
            onChange={(event) => updateField("type", event.target.value)}
          >
            {QR_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="qr-file-name">Nombre de archivo</label>
          <input
            id="qr-file-name"
            type="text"
            value={record.fileName}
            disabled={disabled}
            placeholder="Opcional"
            onChange={(event) => updateField("fileName", event.target.value)}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="qr-value">Valor</label>
        <textarea
          id="qr-value"
          value={record.value}
          disabled={disabled}
          placeholder={VALUE_HINTS[record.type] || "Contenido"}
          onChange={(event) => updateField("value", event.target.value)}
        />
        <span className={styles.fieldHint}>{VALUE_HINTS[record.type] || "Contenido estatico"}</span>
      </div>
    </section>
  );
}
