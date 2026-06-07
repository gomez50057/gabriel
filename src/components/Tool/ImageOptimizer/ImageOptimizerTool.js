"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createImagePreview,
  downloadBlob,
  downloadImagesZip,
  formatBytes,
  getOutputFileName,
  optimizeImage,
} from "@/lib/imageOptimizer/imageHelpers";
import DownloadActions from "./DownloadActions";
import GlobalSettingsPanel from "./GlobalSettingsPanel";
import ImageCatalog from "./ImageCatalog";
import ImageSettingsPanel from "./ImageSettingsPanel";
import ImageUploader from "./ImageUploader";
import OptimizationSummary from "./OptimizationSummary";
import styles from "./ImageOptimizerTool.module.css";

const defaultGlobalSettings = {
  outputFormat: "webp",
  quality: 82,
  maxWidth: 1920,
  removeMetadata: true,
  keepAspectRatio: true,
  preventUpscale: true,
  smartOptimization: true,
};

function revokeUrl(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function getExtension(fileName = "") {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

function createImageRecord(file, settings, existingNames) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    file,
    originalName: file.name,
    originalExtension: getExtension(file.name),
    outputName: getOutputFileName(file.name, "webp", existingNames),
    originalSize: file.size,
    optimizedSize: 0,
    reductionPercentage: 0,
    originalUrl: createImagePreview(file),
    optimizedUrl: "",
    optimizedBlob: null,
    status: "pending",
    selected: true,
    settings: { ...settings },
    error: "",
    originalDimensions: null,
    optimizedDimensions: null,
    metadataMessage: "",
  };
}

function clearOptimizedOutput(image) {
  revokeUrl(image.optimizedUrl);

  return {
    ...image,
    optimizedUrl: "",
    optimizedBlob: null,
    optimizedSize: 0,
    reductionPercentage: 0,
    optimizedDimensions: null,
    metadataMessage: "",
  };
}

export default function ImageOptimizerTool() {
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [globalSettings, setGlobalSettings] = useState(defaultGlobalSettings);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const imagesRef = useRef([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        revokeUrl(image.originalUrl);
        revokeUrl(image.optimizedUrl);
      });
    };
  }, []);

  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedImageId) || images[0] || null,
    [images, selectedImageId]
  );

  const clearMessages = () => {
    setError("");
    setStatus("");
  };

  const handleFilesSelect = (files) => {
    clearMessages();

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    const invalidCount = files.length - validFiles.length;

    if (!validFiles.length) {
      setError("Selecciona al menos un archivo de imagen valido.");
      return;
    }

    setImages((currentImages) => {
      const existingNames = new Set(currentImages.map((image) => image.outputName));
      const nextImages = validFiles.map((file) => createImageRecord(file, globalSettings, existingNames));

      setSelectedImageId(nextImages[0]?.id || selectedImageId);

      return [...currentImages, ...nextImages];
    });

    setStatus(
      invalidCount
        ? `Se cargaron ${validFiles.length} imagenes. ${invalidCount} archivo(s) se omitieron por no ser imagen.`
        : `Se cargaron ${validFiles.length} imagenes correctamente.`
    );
  };

  const updateImage = (imageId, updater) => {
    setImages((currentImages) =>
      currentImages.map((image) => (image.id === imageId ? updater(image) : image))
    );
  };

  const processImageRecord = async (image) => {
    updateImage(image.id, (currentImage) => ({
      ...currentImage,
      status: "processing",
      error: "",
    }));

    try {
      const result = await optimizeImage(image.file, image.settings);

      updateImage(image.id, (currentImage) => {
        revokeUrl(currentImage.optimizedUrl);

        return {
          ...currentImage,
          optimizedBlob: result.blob,
          optimizedUrl: result.optimizedUrl,
          optimizedSize: result.optimizedSize,
          reductionPercentage: result.reductionPercentage,
          originalDimensions: result.originalDimensions,
          optimizedDimensions: result.dimensions,
          metadataMessage: result.metadataMessage,
          status: "optimized",
          error: "",
        };
      });

      return true;
    } catch (processError) {
      updateImage(image.id, (currentImage) => ({
        ...currentImage,
        optimizedBlob: null,
        optimizedSize: 0,
        reductionPercentage: 0,
        status: "error",
        error: processError.message || "No fue posible optimizar esta imagen.",
      }));

      return false;
    }
  };

  const handleOptimizeImage = async (imageId) => {
    clearMessages();

    const image = imagesRef.current.find((currentImage) => currentImage.id === imageId);

    if (!image) {
      setError("Selecciona una imagen valida.");
      return;
    }

    setProcessing(true);
    const ok = await processImageRecord(image);
    setProcessing(false);
    setStatus(ok ? "Imagen optimizada correctamente." : "");
  };

  const handleOptimizeAll = async () => {
    clearMessages();

    if (!imagesRef.current.length) {
      setError("Carga al menos una imagen antes de optimizar.");
      return;
    }

    setProcessing(true);
    let optimizedCount = 0;

    for (const image of imagesRef.current) {
      const ok = await processImageRecord(image);

      if (ok) {
        optimizedCount += 1;
      }
    }

    setProcessing(false);
    setStatus(`Optimizacion terminada: ${optimizedCount} de ${imagesRef.current.length} imagenes listas.`);
  };

  const handleToggleImage = (imageId) => {
    clearMessages();
    updateImage(imageId, (image) => ({
      ...image,
      selected: !image.selected,
    }));
  };

  const handleImageSettingsChange = (imageId, nextSettings) => {
    clearMessages();
    updateImage(imageId, (image) => ({
      ...clearOptimizedOutput(image),
      settings: nextSettings,
      status: image.optimizedBlob ? "pending" : image.status,
    }));
  };

  const handleApplyToAll = () => {
    clearMessages();
    setImages((currentImages) =>
      currentImages.map((image) => ({
        ...clearOptimizedOutput(image),
        settings: { ...globalSettings },
        status: image.optimizedBlob ? "pending" : image.status,
      }))
    );
    setStatus("Configuracion global aplicada a todo el catalogo.");
  };

  const handleApplyToSelected = () => {
    clearMessages();

    const selectedCount = imagesRef.current.filter((image) => image.selected).length;

    if (!selectedCount) {
      setError("Selecciona al menos una imagen.");
      return;
    }

    setImages((currentImages) =>
      currentImages.map((image) =>
        image.selected
          ? {
              ...clearOptimizedOutput(image),
              settings: { ...globalSettings },
              status: image.optimizedBlob ? "pending" : image.status,
            }
          : image
      )
    );
    setStatus(`Configuracion aplicada a ${selectedCount} imagen(es).`);
  };

  const handleResetSettings = () => {
    clearMessages();
    setGlobalSettings(defaultGlobalSettings);
    setStatus("Configuracion restablecida.");
  };

  const handleDownloadImage = (imageId) => {
    clearMessages();

    const image = imagesRef.current.find((currentImage) => currentImage.id === imageId);

    if (!image?.optimizedBlob) {
      setError("Primero optimiza la imagen seleccionada.");
      return;
    }

    downloadBlob(image.optimizedBlob, image.outputName);
  };

  const handleDownloadSelected = () => {
    clearMessages();

    const selectedImages = imagesRef.current.filter((image) => image.selected && image.optimizedBlob);

    if (!selectedImages.length) {
      setError("No hay imagenes seleccionadas optimizadas para descargar.");
      return;
    }

    selectedImages.forEach((image) => downloadBlob(image.optimizedBlob, image.outputName));
  };

  const handleDownloadAll = () => {
    clearMessages();

    const optimizedImages = imagesRef.current.filter((image) => image.optimizedBlob);

    if (!optimizedImages.length) {
      setError("No hay imagenes optimizadas para descargar.");
      return;
    }

    optimizedImages.forEach((image) => downloadBlob(image.optimizedBlob, image.outputName));
  };

  const handleDownloadZip = async () => {
    clearMessages();

    const optimizedImages = imagesRef.current.filter((image) => image.optimizedBlob);

    if (!optimizedImages.length) {
      setError("No hay imagenes optimizadas para empaquetar.");
      return;
    }

    setProcessing(true);

    try {
      await downloadImagesZip(optimizedImages);
      setStatus("ZIP generado correctamente.");
    } catch (zipError) {
      setError(zipError.message || "No fue posible generar el archivo ZIP.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveImage = (imageId) => {
    clearMessages();

    setImages((currentImages) => {
      const image = currentImages.find((currentImage) => currentImage.id === imageId);
      const nextImages = currentImages.filter((currentImage) => currentImage.id !== imageId);

      if (image) {
        revokeUrl(image.originalUrl);
        revokeUrl(image.optimizedUrl);
      }

      if (selectedImageId === imageId) {
        setSelectedImageId(nextImages[0]?.id || "");
      }

      return nextImages;
    });
  };

  const handleClearCatalog = () => {
    clearMessages();
    imagesRef.current.forEach((image) => {
      revokeUrl(image.originalUrl);
      revokeUrl(image.optimizedUrl);
    });
    setImages([]);
    setSelectedImageId("");
    setStatus("Catalogo limpiado.");
  };

  return (
    <section className={styles.wrapper}>
      <header className={styles.hero}>
        <div>
          <span className={styles.kicker}>ImageOptimizer</span>
          <h1>Optimizador de Imagenes Web</h1>
          <p>
            Convierte, comprime y optimiza imagenes para sitios web manteniendo la mayor calidad visual posible.
          </p>
        </div>
        <aside className={styles.privacyNote}>
          <p>
            Las imagenes se procesan localmente en tu navegador con Canvas. No se suben a servidores ni se guardan en una base de datos.
          </p>
          <p>Metadatos eliminados en la exportacion cuando se genera el nuevo archivo WebP.</p>
        </aside>
      </header>

      <ImageUploader
        disabled={processing}
        onFilesSelect={handleFilesSelect}
        onError={setError}
        styles={styles}
      />

      <OptimizationSummary images={images} styles={styles} />

      <div className={styles.workspace}>
        <div className={styles.leftColumn}>
          <section className={styles.previewPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.eyebrow}>Vista previa</span>
              <h2>Antes y despues</h2>
            </div>

            {selectedImage ? (
              <>
                <div className={styles.compareGrid}>
                  <figure>
                    <img src={selectedImage.originalUrl} alt={`Original de ${selectedImage.originalName}`} />
                    <figcaption>
                      Original - {formatBytes(selectedImage.originalSize)}
                    </figcaption>
                  </figure>
                  <figure>
                    {selectedImage.optimizedUrl ? (
                      <img src={selectedImage.optimizedUrl} alt={`Optimizada de ${selectedImage.originalName}`} />
                    ) : (
                      <div className={styles.previewPlaceholder}>Pendiente de optimizar</div>
                    )}
                    <figcaption>
                      Optimizada - {selectedImage.optimizedSize ? formatBytes(selectedImage.optimizedSize) : "-"}
                    </figcaption>
                  </figure>
                </div>

                <div className={styles.previewDetails}>
                  <span>Salida: {selectedImage.outputName}</span>
                  {selectedImage.optimizedDimensions && (
                    <span>
                      Dimensiones: {selectedImage.optimizedDimensions.width} x {selectedImage.optimizedDimensions.height}px
                    </span>
                  )}
                  {selectedImage.metadataMessage && <span>{selectedImage.metadataMessage}</span>}
                </div>
              </>
            ) : (
              <div className={styles.previewPlaceholder}>Carga una imagen para ver la comparacion.</div>
            )}
          </section>

          <ImageCatalog
            images={images}
            selectedImageId={selectedImage?.id || ""}
            disabled={processing}
            onSelectImage={setSelectedImageId}
            onToggleImage={handleToggleImage}
            onOptimizeImage={handleOptimizeImage}
            onDownloadImage={handleDownloadImage}
            onRemoveImage={handleRemoveImage}
            styles={styles}
          />
        </div>

        <div className={styles.rightColumn}>
          <GlobalSettingsPanel
            settings={globalSettings}
            disabled={processing}
            onSettingsChange={setGlobalSettings}
            onApplyToAll={handleApplyToAll}
            onApplyToSelected={handleApplyToSelected}
            onReset={handleResetSettings}
            styles={styles}
          />

          <ImageSettingsPanel
            image={selectedImage}
            disabled={processing}
            onSettingsChange={handleImageSettingsChange}
            onOptimize={handleOptimizeImage}
            styles={styles}
          />
        </div>
      </div>

      <DownloadActions
        images={images}
        disabled={processing}
        onOptimizeAll={handleOptimizeAll}
        onDownloadSelected={handleDownloadSelected}
        onDownloadAll={handleDownloadAll}
        onDownloadZip={handleDownloadZip}
        onClear={handleClearCatalog}
        styles={styles}
      />

      <div className={styles.messageArea} aria-live="polite">
        {processing && <p className={styles.infoMessage}>Procesando imagenes...</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {status && <p className={styles.successMessage}>{status}</p>}
      </div>
    </section>
  );
}
