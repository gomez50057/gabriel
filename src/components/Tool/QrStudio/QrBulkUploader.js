const ACCEPT_BY_MODE = {
  csv: ".csv,text/csv",
  json: ".json,application/json",
  excel: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const LABEL_BY_MODE = {
  csv: "CSV",
  json: "JSON",
  excel: "Excel",
};

export default function QrBulkUploader({
  mode,
  fileName,
  validCount,
  invalidCount,
  errors,
  disabled,
  onFileSelect,
  onClear,
  onDownloadRecord,
  onDownloadTemplate,
  validRecords,
  styles,
}) {
  const label = LABEL_BY_MODE[mode] || "archivo";

  if (!ACCEPT_BY_MODE[mode]) {
    return null;
  }

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove(styles.uploadPanelActive);

    if (disabled) {
      return;
    }

    const [file] = event.dataTransfer.files || [];
    onFileSelect(file);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.eyebrow}>Carga masiva</span>
        <h2>Registros desde {label}</h2>
      </div>

      <div
        className={styles.uploadPanel}
        onDragOver={(event) => {
          event.preventDefault();
          event.currentTarget.classList.add(styles.uploadPanelActive);
        }}
        onDragLeave={(event) => event.currentTarget.classList.remove(styles.uploadPanelActive)}
        onDrop={handleDrop}
      >
        <div>
          <h3>{fileName || `Arrastra un archivo ${label}`}</h3>
          <p>Columnas requeridas: title, type y value. fileName es opcional.</p>
          <div className={styles.templateActions}>
            <span className={styles.templateLabel}>
              Descarga ejemplo / plantilla {label}
            </span>
            <button
              type="button"
              className={styles.textButton}
              disabled={disabled}
              onClick={() => onDownloadTemplate?.(mode)}
            >
              Descargar ejemplo {label}
            </button>
          </div>
        </div>

        <label className={styles.fileButton}>
          Seleccionar
          <input
            type="file"
            accept={ACCEPT_BY_MODE[mode]}
            disabled={disabled}
            onChange={(event) => onFileSelect(event.target.files?.[0])}
          />
        </label>

        {fileName && (
          <div className={styles.bulkStats}>
            <span>{validCount} validos</span>
            <span>{invalidCount} con errores</span>
            <button type="button" className={styles.textButton} disabled={disabled} onClick={onClear}>
              Limpiar
            </button>
          </div>
        )}
      </div>

      {validRecords.length > 0 && (
        <div className={styles.bulkTableWrap}>
          <table className={styles.bulkTable}>
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Tipo</th>
                <th>Archivo</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {validRecords.slice(0, 10).map((record, index) => (
                <tr key={`${record.title}-${record.value}-${index}`}>
                  <td>{record.title}</td>
                  <td>{record.type}</td>
                  <td>{record.fileName || record.title}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.smallButton}
                      disabled={disabled}
                      onClick={() => onDownloadRecord(record)}
                    >
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {validRecords.length > 10 && <p className={styles.fieldHint}>Mostrando 10 de {validRecords.length} registros.</p>}
        </div>
      )}

      {errors.length > 0 && (
        <div className={styles.errorList}>
          {errors.slice(0, 6).map((item, index) => (
            <p key={`${item.rowIndex}-${item.field}-${index}`}>
              Fila {item.rowIndex || "-"}: {item.message}
            </p>
          ))}
          {errors.length > 6 && <p>Hay {errors.length - 6} errores adicionales.</p>}
        </div>
      )}
    </section>
  );
}
