"use client";

import { useMemo, useState, useRef } from "react";
import styles from "./TextCaseConverter.module.css";

const DEFAULT_STOP_WORDS = [
  // artículos
  "el", "la", "los", "las", "un", "una", "unos", "unas",
  // contracciones comunes
  "al", "del",
  // preposiciones
  "a", "ante", "bajo", "con", "contra", "de", "desde", "en", "entre",
  "hacia", "hasta", "para", "por", "según", "sin", "sobre", "tras", "durante",
  // conjunciones
  "y", "e", "o", "u", "ni", "que",
  // otros conectores frecuentes
  "como", "así", "pero", "sino", "aunque"
];

const OTHER_MODES = new Set(["camel", "kebab", "snake"]);

const OTHER_LABELS = {
  camel: "camelCase",
  kebab: "guiones medios",
  snake: "guiones bajos",
};

// Extrae palabras unicode (letras y números)
const getWords = (text) => {
  const matches = text.match(/[\p{L}\p{N}]+/gu);
  return matches ? matches : [];
};

// Utilidad: capitaliza primera letra de una palabra ya en lower-case
const capitalizeWord = (lowerWord, locale = "es-ES") => {
  if (!lowerWord) return lowerWord;
  const first = lowerWord[0].toLocaleUpperCase(locale);
  return first + lowerWord.slice(1);
};

// 1) TODO MAYÚSCULAS
const toAllUpper = (text, locale = "es-ES") =>
  text.toLocaleUpperCase(locale);

// 2) TODO minúsculas
const toAllLower = (text, locale = "es-ES") =>
  text.toLocaleLowerCase(locale);

// 3) Capitalizar cada palabra (sin excluir nada)
const toCapitalizeAllWords = (text, locale = "es-ES") => {
  return text.replace(/\p{L}+/gu, (word) => {
    const lower = word.toLocaleLowerCase(locale);
    return capitalizeWord(lower, locale);
  });
};

// 4) Estilo oración: mayúsculas después de punto/!/?
//    Nota: convierte primero a minúsculas para uniformidad.
const toSentenceCase = (text, locale = "es-ES") => {
  const lower = text.toLocaleLowerCase(locale);
  let result = "";
  let capNext = true;

  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    const isLetter = /\p{L}/u.test(ch);

    if (capNext && isLetter) {
      result += ch.toLocaleUpperCase(locale);
      capNext = false;
    } else {
      result += ch;
    }

    if (ch === "." || ch === "!" || ch === "?" || ch === "\n") {
      capNext = true;
    }
  }
  return result;
};

// 5) Title Case con exclusión de conexiones/artículos
const toTitleCaseExceptStopWords = (
  text,
  stopWordsSet,
  locale = "es-ES"
) => {
  let wordIndex = 0;

  return text.replace(/\p{L}+/gu, (word) => {
    const lower = word.toLocaleLowerCase(locale);
    const isFirst = wordIndex === 0;
    wordIndex++;

    if (isFirst) return capitalizeWord(lower, locale);
    if (stopWordsSet.has(lower)) return lower;

    return capitalizeWord(lower, locale);
  });
};

// ====== FORMATOS "OTROS" ======

const toCamelCase = (text, locale = "es-ES") => {
  const words = getWords(text).map(w => w.toLocaleLowerCase(locale));
  if (words.length === 0) return "";

  const [first, ...rest] = words;
  return first + rest.map(w => capitalizeWord(w, locale)).join("");
};

const toKebabCase = (text, locale = "es-ES") => {
  const words = getWords(text).map(w => w.toLocaleLowerCase(locale));
  return words.join("-");
};

const toSnakeCase = (text, locale = "es-ES") => {
  const words = getWords(text).map(w => w.toLocaleLowerCase(locale));
  return words.join("_");
};

export default function TextCaseConverter({
  initialText = "",
  locale = "es-ES",
  stopWords = DEFAULT_STOP_WORDS
}) {
  const [text, setText] = useState(initialText);
  const [mode, setMode] = useState("sentence");

  // Dropdown "Otros"
  const [othersOpen, setOthersOpen] = useState(false);

  // Estado de copiado
  const [copyStatus, setCopyStatus] = useState("idle");
  // "idle" | "success" | "error"
  const copyTimerRef = useRef(null);

  const stopWordsSet = useMemo(
    () =>
      new Set(
        (stopWords || []).map(w => String(w).toLocaleLowerCase(locale))
      ),
    [stopWords, locale]
  );

  const output = useMemo(() => {
    if (!text) return "";

    switch (mode) {
      case "sentence":
        return toSentenceCase(text, locale);
      case "capitalizeAll":
        return toCapitalizeAllWords(text, locale);
      case "upper":
        return toAllUpper(text, locale);
      case "lower":
        return toAllLower(text, locale);
      case "titleExcept":
        return toTitleCaseExceptStopWords(text, stopWordsSet, locale);

      // Otros
      case "camel":
        return toCamelCase(text, locale);
      case "kebab":
        return toKebabCase(text, locale);
      case "snake":
        return toSnakeCase(text, locale);

      default:
        return text;
    }
  }, [text, mode, locale, stopWordsSet]);

  const handleCopy = async () => {
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }

    const show = (status) => {
      setCopyStatus(status);
      copyTimerRef.current = setTimeout(() => {
        setCopyStatus("idle");
      }, 1600);
    };

    try {
      // API moderna
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(output ?? "");
        show("success");
        return;
      }

      // Fallback clásico
      const ta = document.createElement("textarea");
      ta.value = output ?? "";
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();

      const ok = document.execCommand("copy");
      document.body.removeChild(ta);

      if (ok) show("success");
      else show("error");
    } catch {
      show("error");
    }
  };

  const handleSwap = () => {
    setText(output);
  };

  const handleClear = () => setText("");

  const isOtherActive = OTHER_MODES.has(mode);
  const otherButtonLabel = isOtherActive
    ? `Otros: ${OTHER_LABELS[mode] ?? ""}`
    : "Otros";

  const selectOtherMode = (m) => {
    setMode(m);
    setOthersOpen(false);
  };

  const selectMainMode = (m) => {
    setMode(m);
    // Si el usuario elige un modo principal, cierra “Otros”
    setOthersOpen(false);
  };

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h2 className={styles.title}>Conversor de mayúsculas y minúsculas</h2>
        <p className={styles.subtitle}>
          Selecciona un formato y transforma tu texto de manera inmediata.
        </p>
      </header>

      <div className={styles.grid}>
        {/* ENTRADA */}
        <div className={styles.panel}>
          <label className={styles.label}>Texto de entrada</label>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe o pega tu texto aquí…"
          />
          <div className={styles.row}>
            <button className={styles.secondaryBtn} onClick={handleClear}>
              Limpiar
            </button>
            <div className={styles.spacer} />
            <span className={styles.hint}>{text.length} caracteres</span>
          </div>
        </div>

        {/* SALIDA / MODOS */}
        <div className={styles.panel}>
          <label className={styles.label}>Formato</label>

          <div className={styles.modes}>
            <button
              className={`${styles.modeBtn} ${mode === "sentence" ? styles.active : ""}`}
              onClick={() => selectMainMode("sentence")}
              type="button"
            >
              Mayúsculas después del punto
            </button>

            <button
              className={`${styles.modeBtn} ${mode === "capitalizeAll" ? styles.active : ""}`}
              onClick={() => selectMainMode("capitalizeAll")}
              type="button"
            >
              Capitalizar texto
            </button>

            <button
              className={`${styles.modeBtn} ${mode === "titleExcept" ? styles.active : ""}`}
              onClick={() => selectMainMode("titleExcept")}
              type="button"
            >
              Capitalizar excepto conexiones y artículos
            </button>

            <button
              className={`${styles.modeBtn} ${mode === "upper" ? styles.active : ""}`}
              onClick={() => selectMainMode("upper")}
              type="button"
            >
              Todo MAYÚSCULAS
            </button>

            <button
              className={`${styles.modeBtn} ${mode === "lower" ? styles.active : ""}`}
              onClick={() => selectMainMode("lower")}
              type="button"
            >
              Todo minúsculas
            </button>

            {/* ===== BOTÓN DESPLEGABLE "OTROS" ===== */}
            <div className={styles.dropdown}>
              <button
                type="button"
                className={`${styles.dropdownBtn} ${isOtherActive ? styles.active : ""}`}
                onClick={() => setOthersOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={othersOpen}
              >
                {otherButtonLabel}
                <span className={styles.caret} />
              </button>

              {othersOpen && (
                <div className={styles.dropdownMenu} role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.dropdownItem} ${mode === "camel" ? styles.activeItem : ""}`}
                    onClick={() => selectOtherMode("camel")}
                  >
                    camelCase
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.dropdownItem} ${mode === "kebab" ? styles.activeItem : ""}`}
                    onClick={() => selectOtherMode("kebab")}
                  >
                    guiones medios
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.dropdownItem} ${mode === "snake" ? styles.activeItem : ""}`}
                    onClick={() => selectOtherMode("snake")}
                  >
                    guiones bajos
                  </button>
                </div>
              )}
            </div>
          </div>

          <label className={`${styles.label} ${styles.mt}`}>
            Resultado
          </label>

          <textarea
            className={`${styles.textarea} ${styles.output}`}
            value={output}
            readOnly
          />

          <div className={styles.row}>
            <div className={styles.copyArea}>
              {copyStatus === "success" && (
                <span
                  className={`${styles.copyMsg} ${styles.copyMsgSuccess}`}
                  role="status"
                  aria-live="polite"
                >
                  Texto copiado
                </span>
              )}

              {copyStatus === "error" && (
                <span
                  className={`${styles.copyMsg} ${styles.copyMsgError}`}
                  role="alert"
                >
                  Ocurrió un error
                </span>
              )}

              <button className={styles.primaryBtn} onClick={handleCopy}>
                Copiar resultado
              </button>
            </div>

            <button className={styles.secondaryBtn} onClick={handleSwap}>
              Usar resultado como entrada
            </button>
          </div>

          <p className={styles.note}>
            Nota: El modo “Mayúsculas después del punto” convierte el texto a
            minúsculas antes de aplicar capitalización por oración.
          </p>
        </div>
      </div>
    </section>
  );
}
