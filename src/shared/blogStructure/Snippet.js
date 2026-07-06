"use client";

import { useMemo } from "react";
import CopyButton from "@/shared/CopyButton";
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
  const displayLang = useMemo(
    () => (language ? String(language).toUpperCase() : "TXT"),
    [language]
  );

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
          <CopyButton
            text={code}
            className={styles.copyBtn}
            copiedText="Código copiado."
            errorText="No se pudo copiar el código."
            ariaLabel="Copiar código al portapapeles"
            placement="bottom"
          >
            Copiar
          </CopyButton>
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
