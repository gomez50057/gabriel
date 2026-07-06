"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { emptyQrRecord, defaultQrConfig, MAX_BULK_RECORDS, MAX_LOGO_SIZE_BYTES } from "@/lib/qr/qrDefaults";
import { exportSingleQr } from "@/lib/qr/qrExport";
import { parseCsvFile } from "@/lib/qr/qrCsvParser";
import { parseJsonFile } from "@/lib/qr/qrJsonParser";
import { parseExcelFile } from "@/lib/qr/qrExcelParser";
import { downloadQrTemplate } from "@/lib/qr/qrBulkTemplates";
import { validateBulkRecords } from "@/lib/qr/qrBulkValidator";
import { validateQrConfig, validateQrRecord } from "@/lib/qr/qrValidation";
import { generateBulkQrZip } from "@/lib/qr/qrZipExport";
import { prepareQrLogoImage } from "@/lib/qr/qrLogoCanvas";
import QrActions from "./QrActions";
import QrBulkUploader from "./QrBulkUploader";
import QrDesignControls from "./QrDesignControls";
import QrManualForm from "./QrManualForm";
import QrModeTabs from "./QrModeTabs";
import QrPreview from "./QrPreview";
import styles from "./QrStudio.module.css";

const initialBulkState = {
  fileName: "",
  validRecords: [],
  invalidRecords: [],
  errors: [],
};

function getParser(mode) {
  if (mode === "csv") {
    return parseCsvFile;
  }

  if (mode === "json") {
    return parseJsonFile;
  }

  if (mode === "excel") {
    return parseExcelFile;
  }

  return null;
}

function revokeUrl(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export default function QrStudio() {
  const [mode, setMode] = useState("manual");
  const [manualRecord, setManualRecord] = useState(emptyQrRecord);
  const [bulkState, setBulkState] = useState(initialBulkState);
  const [config, setConfig] = useState(defaultQrConfig);
  const [preparedLogoUrl, setPreparedLogoUrl] = useState("");
  const [logoPreparing, setLogoPreparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const logoUrlRef = useRef("");

  useEffect(() => {
    logoUrlRef.current = config.logoUrl;
  }, [config.logoUrl]);

  useEffect(() => {
    return () => revokeUrl(logoUrlRef.current);
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!config.logoEnabled || !config.logoUrl) {
      setPreparedLogoUrl("");
      setLogoPreparing(false);
      return undefined;
    }

    setLogoPreparing(true);

    prepareQrLogoImage(config)
      .then((logoUrl) => {
        if (isActive) {
          setPreparedLogoUrl(logoUrl);
        }
      })
      .catch((logoError) => {
        if (isActive) {
          setPreparedLogoUrl("");
          setError(logoError.message || "No fue posible preparar el logo.");
        }
      })
      .finally(() => {
        if (isActive) {
          setLogoPreparing(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    config.logoEnabled,
    config.logoUrl,
    config.logoBackgroundColor,
    config.logoBorderRadius,
    config.logoPadding,
  ]);

  const exportConfig = useMemo(
    () => ({
      ...config,
      logoUrl: config.logoEnabled ? preparedLogoUrl : "",
      logoPadding: 0,
    }),
    [config, preparedLogoUrl]
  );

  const previewRecord = mode === "manual" ? manualRecord : bulkState.validRecords[0] || null;
  const busy = isProcessing || logoPreparing;

  const clearMessages = () => {
    setError("");
    setStatus("");
    setProgress(null);
  };

  const handleModeChange = (nextMode) => {
    clearMessages();
    setMode(nextMode);
  };

  const handleConfigChange = (nextConfig) => {
    clearMessages();
    setConfig(nextConfig);
  };

  const handleBulkFile = async (file) => {
    clearMessages();

    if (!file) {
      return;
    }

    const parser = getParser(mode);

    if (!parser) {
      setError("Selecciona un modo de carga valido.");
      return;
    }

    setIsProcessing(true);

    try {
      const records = await parser(file);
      const validation = validateBulkRecords(records);

      setBulkState({
        fileName: file.name,
        validRecords: validation.validRecords,
        invalidRecords: validation.invalidRecords,
        errors: validation.errors,
      });

      if (!validation.validRecords.length) {
        setError("No se encontraron registros validos.");
        return;
      }

      if (validation.errors.length) {
        setError(`Se cargaron ${validation.validRecords.length} registros validos y ${validation.errors.length} errores.`);
        return;
      }

      setStatus(`Se cargaron ${validation.validRecords.length} registros validos.`);
    } catch (fileError) {
      setBulkState(initialBulkState);
      setError(fileError.message || "No fue posible leer el archivo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearBulk = () => {
    clearMessages();
    setBulkState(initialBulkState);
  };

  const handleLogoSelect = (file) => {
    clearMessages();

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen valida para el logo.");
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setError("El logo supera el limite permitido.");
      return;
    }

    revokeUrl(config.logoUrl);
    const logoUrl = URL.createObjectURL(file);

    setConfig((currentConfig) => ({
      ...currentConfig,
      logoEnabled: true,
      logoFile: file,
      logoName: file.name,
      logoUrl,
    }));
  };

  const handleDefaultLogoSelect = (logo) => {
    clearMessages();
    revokeUrl(config.logoUrl);
    setConfig((currentConfig) => ({
      ...currentConfig,
      logoEnabled: true,
      logoFile: null,
      logoName: logo.name,
      logoUrl: logo.url,
    }));
  };

  const handleLogoRemove = () => {
    clearMessages();
    revokeUrl(config.logoUrl);
    setPreparedLogoUrl("");
    setConfig((currentConfig) => ({
      ...currentConfig,
      logoEnabled: false,
      logoFile: null,
      logoName: "",
      logoUrl: "",
    }));
  };

  const validateForExport = (record) => {
    const configErrors = validateQrConfig(exportConfig);

    if (configErrors.length) {
      throw new Error(configErrors[0]);
    }

    const validation = validateQrRecord(record);

    if (validation.errors.length) {
      throw new Error(validation.errors[0].message);
    }

    return validation.record;
  };

  const handleDownloadRecord = async (record) => {
    clearMessages();

    try {
      const nextRecord = validateForExport(record);

      setIsProcessing(true);
      await exportSingleQr(nextRecord, exportConfig);
      setStatus("Codigo descargado correctamente.");
    } catch (downloadError) {
      setError(downloadError.message || "No fue posible descargar el QR.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = () => {
    const record = mode === "manual" ? manualRecord : bulkState.validRecords[0];
    return handleDownloadRecord(record);
  };

  const handleDownloadZip = async () => {
    clearMessages();

    try {
      const configErrors = validateQrConfig(exportConfig);

      if (configErrors.length) {
        throw new Error(configErrors[0]);
      }

      if (!bulkState.validRecords.length) {
        throw new Error("Carga al menos un registro valido.");
      }

      setIsProcessing(true);
      const results = await generateBulkQrZip(bulkState.validRecords, exportConfig, setProgress);
      const failed = results.filter((item) => item.status === "error").length;

      setStatus(
        failed
          ? `ZIP generado con ${results.length - failed} codigos y ${failed} errores.`
          : `ZIP generado con ${results.length} codigos.`
      );
    } catch (zipError) {
      setError(zipError.message || "No fue posible generar el ZIP.");
    } finally {
      setProgress(null);
      setIsProcessing(false);
    }
  };

  const handleClearData = () => {
    clearMessages();

    if (mode === "manual") {
      setManualRecord(emptyQrRecord);
      return;
    }

    setBulkState(initialBulkState);
  };

  const handleResetDesign = () => {
    clearMessages();
    revokeUrl(config.logoUrl);
    setConfig(defaultQrConfig);
    setPreparedLogoUrl("");
    setLogoPreparing(false);
  };

  return (
    <section className={styles.wrapper}>
      <header className={styles.hero}>
        <div>
          <span className={styles.kicker}>QrStudio</span>
          <h1>Generador de codigos QR</h1>
          <p>
            Crea codigos QR estaticos, personalizados y descargables. Puedes generar uno solo o crear varios desde CSV, JSON o Excel.
          </p>
        </div>
        <aside className={styles.privacyNote}>
          <p>
            Los QR estaticos no caducan y no dependen de una base de datos. El contenido queda codificado directamente dentro del QR. Si el QR contiene una URL, seguira funcionando mientras esa URL exista.
          </p>
          <p>
            Los archivos se procesan localmente en el navegador. No se suben a servidores ni se guardan en una base de datos.
          </p>
        </aside>
      </header>

      <QrModeTabs mode={mode} disabled={busy} onModeChange={handleModeChange} styles={styles} />

      <div className={styles.workspace}>
        <div className={styles.leftColumn}>
          {mode === "manual" ? (
            <QrManualForm record={manualRecord} disabled={busy} onChange={setManualRecord} styles={styles} />
          ) : (
            <QrBulkUploader
              mode={mode}
              fileName={bulkState.fileName}
              validCount={bulkState.validRecords.length}
              invalidCount={bulkState.invalidRecords.length}
              errors={bulkState.errors}
              validRecords={bulkState.validRecords}
              disabled={busy}
              onFileSelect={handleBulkFile}
              onClear={handleClearBulk}
              onDownloadRecord={handleDownloadRecord}
              onDownloadTemplate={downloadQrTemplate}
              styles={styles}
            />
          )}

          {mode !== "manual" && (
            <p className={styles.limitNote}>
              Limite por lote: {MAX_BULK_RECORDS} registros. Los codigos se descargan junto con respaldo.json y resultados.csv.
            </p>
          )}

          <QrPreview record={previewRecord} config={exportConfig} logoPreparing={logoPreparing} styles={styles} />
        </div>

        <QrDesignControls
          config={config}
          disabled={busy}
          logoPreparing={logoPreparing}
          onConfigChange={handleConfigChange}
          onLogoSelect={handleLogoSelect}
          onDefaultLogoSelect={handleDefaultLogoSelect}
          onLogoRemove={handleLogoRemove}
          styles={styles}
        />
      </div>

      <QrActions
        mode={mode}
        hasManualRecord={Boolean(manualRecord.title && manualRecord.value)}
        validCount={bulkState.validRecords.length}
        disabled={busy}
        progress={progress}
        onClearData={handleClearData}
        onResetDesign={handleResetDesign}
        onDownloadSingle={handleDownloadSingle}
        onDownloadZip={handleDownloadZip}
        styles={styles}
      />

      <div className={styles.messageArea} aria-live="polite">
        {error && <p className={styles.errorMessage}>{error}</p>}
        {status && <p className={styles.successMessage}>{status}</p>}
      </div>
    </section>
  );
}
