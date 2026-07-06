"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CopyButton.module.css";

const CLOSE_MS = 260;

async function writeClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export default function CopyButton({
  text = "",
  getText,
  children = "Copiar",
  copiedText,
  errorText = "No se pudo copiar.",
  durationMs = 5500,
  className = "",
  disabled = false,
  title,
  ariaLabel,
  placement = "top",
}) {
  const [notice, setNotice] = useState(null);
  const [closing, setClosing] = useState(false);
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const closeTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const tickTimerRef = useRef(null);

  const clearTimers = () => {
    window.clearTimeout(closeTimerRef.current);
    window.clearTimeout(hideTimerRef.current);
    window.clearInterval(tickTimerRef.current);
  };

  const closeNotice = () => {
    window.clearTimeout(closeTimerRef.current);
    setClosing(true);
    hideTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      setClosing(false);
    }, CLOSE_MS);
  };

  const showNotice = (type) => {
    const startedAt = Date.now();

    clearTimers();
    setClosing(false);
    setNotice({ type, key: startedAt });
    setRemainingMs(durationMs);

    tickTimerRef.current = window.setInterval(() => {
      setRemainingMs(Math.max(0, durationMs - (Date.now() - startedAt)));
    }, 200);

    closeTimerRef.current = window.setTimeout(closeNotice, durationMs);
  };

  useEffect(
    () => () => {
      window.clearTimeout(closeTimerRef.current);
      window.clearTimeout(hideTimerRef.current);
      window.clearInterval(tickTimerRef.current);
    },
    []
  );

  const handleCopy = async () => {
    try {
      await writeClipboard(String(getText ? getText() : text));
      showNotice("success");
    } catch {
      showNotice("error");
    }
  };

  const message =
    notice?.type === "error" ? errorText : copiedText ?? "Copiado al portapapeles.";

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={className}
        onClick={handleCopy}
        disabled={disabled}
        title={title}
        aria-label={ariaLabel}
      >
        {children}
      </button>

      {notice && (
        <span
          key={notice.key}
          className={`${styles.notice} ${
            placement === "bottom" ? styles.bottom : ""
          } ${closing ? styles.closing : ""} ${
            notice.type === "error" ? styles.error : ""
          }`}
          role={notice.type === "error" ? "alert" : "status"}
          aria-live="polite"
          style={{ "--copy-toast-duration": `${durationMs}ms` }}
        >
          <span className={styles.message}>{message}</span>
          <span className={styles.timer}>{Math.ceil(remainingMs / 1000)}s</span>
          <button
            type="button"
            className={styles.close}
            onClick={closeNotice}
            aria-label="Cerrar mensaje"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
          <span className={styles.bar} />
        </span>
      )}
    </span>
  );
}
