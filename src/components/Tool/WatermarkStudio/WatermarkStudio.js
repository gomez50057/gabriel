"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { applyImageWatermark } from "@/lib/watermark/applyImageWatermark";
import { applyPdfWatermark } from "@/lib/watermark/applyPdfWatermark";
import { downloadBlob } from "@/lib/watermark/downloadFile";
import {
  getFileKind,
  isAllowedFile,
} from "@/lib/watermark/fileTypeUtils";
import {
  defaultWatermarkConfig,
  FILE_SIZE_LIMIT_ERROR,
  MAX_FILE_SIZE_BYTES,
  MAX_WATERMARK_FONT_SIZE,
} from "@/lib/watermark/watermarkDefaults";
import { validateWatermarkConfig } from "@/lib/watermark/validateWatermarkConfig";
import WatermarkActions from "./WatermarkActions";
import WatermarkControls from "./WatermarkControls";
import WatermarkPreview from "./WatermarkPreview";
import WatermarkUploader from "./WatermarkUploader";
import styles from "./WatermarkStudio.module.css";

function revokeUrl(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export default function WatermarkStudio() {
  const [file, setFile] = useState(null);
  const [fileKind, setFileKind] = useState("");
  const [config, setConfig] = useState(defaultWatermarkConfig);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [warning, setWarning] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputBlob, setOutputBlob] = useState(null);
  const [outputFileName, setOutputFileName] = useState("");
  const [totalPages, setTotalPages] = useState(null);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
  const previewUrlRef = useRef("");
  const outputUrlRef = useRef("");
  const largeImageAdjustmentRef = useRef(false);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    outputUrlRef.current = outputUrl;
  }, [outputUrl]);

  useEffect(() => {
    return () => {
      revokeUrl(previewUrlRef.current);
      revokeUrl(outputUrlRef.current);
    };
  }, []);

  const clearOutput = () => {
    revokeUrl(outputUrl);
    setOutputUrl("");
    setOutputBlob(null);
    setOutputFileName("");
    setWarning("");
  };

  const handleConfigChange = (nextConfig) => {
    clearOutput();
    setStatus("");
    setConfig(nextConfig);
  };

  const handleFileSelect = (selectedFile) => {
    setError("");
    setStatus("");
    clearOutput();

    if (!selectedFile || !isAllowedFile(selectedFile)) {
      setError("El formato no es compatible. Usa PDF, PNG, JPG, JPEG o WEBP.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(FILE_SIZE_LIMIT_ERROR);
      return;
    }

    revokeUrl(previewUrl);
    const nextPreviewUrl = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setFileKind(getFileKind(selectedFile));
    setPreviewUrl(nextPreviewUrl);
    setTotalPages(null);
    setCurrentPreviewPage(1);
    largeImageAdjustmentRef.current = false;
  };

  const handleClearFile = () => {
    revokeUrl(previewUrl);
    clearOutput();
    setFile(null);
    setFileKind("");
    setPreviewUrl("");
    setTotalPages(null);
    setCurrentPreviewPage(1);
    setError("");
    setStatus("");
    largeImageAdjustmentRef.current = false;
  };

  const handleResetConfig = () => {
    clearOutput();
    setConfig(defaultWatermarkConfig);
    setError("");
    setStatus("");
  };

  const handleCustomPositionChange = ({ x, y }) => {
    clearOutput();
    setStatus("");
    setConfig((currentConfig) => ({
      ...currentConfig,
      position: "custom",
      customX: x,
      customY: y,
    }));
  };

  const handleLargeImageDetected = ({ width, height }) => {
    const aspectRatio = height / width;

    if (largeImageAdjustmentRef.current || aspectRatio < 2.5) {
      return;
    }

    largeImageAdjustmentRef.current = true;
    clearOutput();
    setStatus("");
    setWarning(
      "Detectamos una imagen muy larga. Activamos un patron repetido y un tamano mas visible para que la marca se registre en la descarga."
    );

    setConfig((currentConfig) => ({
      ...currentConfig,
      repeat: true,
      fontSize: Math.max(
        Number(currentConfig.fontSize) || 48,
        Math.min(MAX_WATERMARK_FONT_SIZE, Math.round(width * 0.12))
      ),
      opacity: Math.max(Number(currentConfig.opacity) || 0.18, 0.28),
      repeatGapX: Math.max(Number(currentConfig.repeatGapX) || 220, Math.round(width * 0.45)),
      repeatGapY: Math.max(Number(currentConfig.repeatGapY) || 160, Math.round(width * 0.32)),
    }));
  };

  const handleGenerate = async () => {
    setError("");
    setStatus("");
    setWarning("");

    const validation = validateWatermarkConfig(file, config, totalPages);

    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    clearOutput();
    setIsProcessing(true);

    try {
      const result =
        fileKind === "pdf"
          ? await applyPdfWatermark(file, config)
          : await applyImageWatermark(file, config);
      const nextOutputUrl = URL.createObjectURL(result.blob);

      setOutputUrl(nextOutputUrl);
      setOutputBlob(result.blob);
      setOutputFileName(result.fileName);
      setWarning(result.warning || "");
      setStatus("Archivo generado correctamente. Puedes descargar la nueva copia.");
    } catch (processError) {
      setError(processError.message || "No fue posible generar el archivo. Intenta con otro documento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    downloadBlob(outputBlob, outputFileName);
  };

  return (
    <section className={styles.wrapper}>
      <header className={styles.hero}>
        <div>
          <span className={styles.kicker}>WatermarkStudio</span>
          <h1>Generador de marcas de agua</h1>
          <p>
            Agrega una marca de agua a PDFs e imagenes conservando dimensiones,
            orientacion y contenido base siempre que el formato lo permita.
          </p>
        </div>
        <aside className={styles.privacyNote}>
          Tus archivos se procesan localmente en tu navegador. No se almacenan,
          no se suben a servidores y no conservamos una copia del documento
          original ni del archivo generado.
        </aside>
      </header>

      <WatermarkUploader
        file={file}
        fileKind={fileKind}
        isProcessing={isProcessing}
        onFileSelect={handleFileSelect}
        onError={setError}
        styles={styles}
      />

      <div className={styles.workspace}>
        <WatermarkPreview
          file={file}
          fileKind={fileKind}
          previewUrl={previewUrl}
          config={config}
          totalPages={totalPages}
          currentPreviewPage={currentPreviewPage}
          isProcessing={isProcessing}
          onTotalPagesChange={setTotalPages}
          onCurrentPreviewPageChange={setCurrentPreviewPage}
          onCustomPositionChange={handleCustomPositionChange}
          onLargeImageDetected={handleLargeImageDetected}
          onError={setError}
          styles={styles}
        />

        <WatermarkControls
          config={config}
          fileKind={fileKind}
          totalPages={totalPages}
          isProcessing={isProcessing}
          onConfigChange={handleConfigChange}
          styles={styles}
        />
      </div>

      {fileKind === "pdf" && (
        <p className={styles.signatureNote}>
          Si el PDF tiene firma digital, cualquier modificacion puede invalidarla.
        </p>
      )}

      <WatermarkActions
        hasFile={Boolean(file)}
        hasOutput={Boolean(outputBlob)}
        isProcessing={isProcessing}
        onResetConfig={handleResetConfig}
        onGenerate={handleGenerate}
        onDownload={handleDownload}
        onClearFile={handleClearFile}
        styles={styles}
      />

      <div className={styles.messageArea} aria-live="polite">
        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            {error === FILE_SIZE_LIMIT_ERROR && (
              <div className={styles.contactAlert}>
                <span>Para archivos mas grandes, comunicate con Gabriel:</span>
                <a
                  href="https://t.me/gomez50057"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  Telegram
                </a>
                <a
                  href="mailto:gomez50057@gmail.com"
                  aria-label="Enviar correo a gomez50057@gmail.com"
                  title="gomez50057@gmail.com"
                  className={styles.contactIconLink}
                >
                  <Image src="/img/icons/email.png" alt="" width={18} height={18} sizes="18px" />
                  Correo
                </a>
              </div>
            )}
          </div>
        )}
        {warning && <p className={styles.warningMessage}>{warning}</p>}
        {status && <p className={styles.successMessage}>{status}</p>}
      </div>
    </section>
  );
}
