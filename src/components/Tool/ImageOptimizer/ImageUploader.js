export default function ImageUploader({ disabled, onFilesSelect, onError, styles }) {
  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);

    if (!files.length) {
      return;
    }

    onFilesSelect(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleChange = (event) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  return (
    <section className={styles.uploadPanel} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className={styles.uploadText}>
        <span className={styles.eyebrow}>Carga local</span>
        <h2>Cargar imagenes</h2>
        <p>Arrastra una o varias imagenes, o seleccionalas desde tu equipo.</p>
        <p className={styles.fieldHint}>
          Se aceptan PNG, JPG, JPEG, WEBP y otros formatos de imagen compatibles con el navegador.
        </p>
      </div>

      <label className={styles.fileButton}>
        Cargar imagenes
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={disabled}
          onChange={handleChange}
          onClick={() => onError("")}
        />
      </label>
    </section>
  );
}
