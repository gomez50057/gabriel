"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/blog/Snippet.module.css";

export default function Snippet({
  code = "",
  language = "txt",
  inline = false,
  fileName,
  copy = true,
  wrap = false,
  showLineNumbers = false,
}) {
  const [copied, setCopied] = useState(false);

  const displayLang = useMemo(
    () => (language ? String(language).toUpperCase() : "TXT"),
    [language]
  );

  const handleCopy = async () => {
    try {
      await navigator?.clipboard?.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn("No se pudo copiar al portapapeles.", e);
    }
  };

  if (inline) {
    return (
      <code className={styles.inline} data-lang={displayLang}>
        {code}
      </code>
    );
  }

  return (
    <figure className={styles.root} data-lang={displayLang}>
      <header className={styles.toolbar}>
        <div className={styles.fileAndLang}>
          {fileName && <span className={styles.file}>{fileName}</span>}
          <span className={styles.lang}>{displayLang}</span>
        </div>

        {copy && (
          <button
            type="button"
            className={styles.copyBtn}
            onClick={handleCopy}
            aria-live="polite"
            aria-label="Copiar código al portapapeles"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        )}
      </header>

      <pre
        className={`${styles.pre} ${wrap ? styles.wrap : styles.scroll} ${
          showLineNumbers ? styles.withLines : ""
        }`}
      >
        <code className={styles.code}>{code}</code>
      </pre>
    </figure>
  );
}
