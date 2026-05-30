import { useState } from "react";
import { bytesToReadableSize } from "@/lib/watermark/fileTypeUtils";
import { MAX_FILE_SIZE_MB } from "@/lib/watermark/watermarkDefaults";

export default function WatermarkUploader({
  file,
  fileKind,
  isProcessing,
  onFileSelect,
  onError,
  styles,
}) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleFiles = (files) => {
    const selectedFile = files?.[0];

    if (!selectedFile) {
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDraggingFile(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDraggingFile(false);
    }
  };

  return (
    <section
      className={`${styles.uploadPanel} ${isDraggingFile ? styles.uploadPanelActive : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className={styles.uploadText}>
        <span className={styles.eyebrow}>Archivo base</span>
        <h3>Carga un PDF o imagen</h3>
        <p>Formatos permitidos: PDF, PNG, JPG, JPEG y WEBP. Limite: {MAX_FILE_SIZE_MB} MB.</p>
        <p className={styles.uploadWarning}>
          Alerta: PDFs pesados o imagenes muy grandes pueden consumir mucha memoria,
          trabar la pestana o fallar en canvas/PDF.js, sobre todo en equipos modestos.
        </p>
      </div>

      <label className={styles.fileButton}>
        Seleccionar archivo
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
          disabled={isProcessing}
          onChange={(event) => {
            onError("");
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {file ? (
        <dl className={styles.fileMeta}>
          <div>
            <dt>Nombre</dt>
            <dd>{file.name}</dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{fileKind === "pdf" ? "PDF" : file.type || "Imagen"}</dd>
          </div>
          <div>
            <dt>Tamano</dt>
            <dd>{bytesToReadableSize(file.size)}</dd>
          </div>
        </dl>
      ) : (
        <p className={styles.emptyText}>Arrastra el archivo aqui o usa el boton de seleccion.</p>
      )}
    </section>
  );
}
