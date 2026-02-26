// **Texto**   → Texto en negrita
// *Texto*     → Texto en cursiva
// **_Texto_** → Texto en negrita y cursiva
// `código`    → renderizado como <Snippet inline>

import styles from "@/styles/blog/FullPost.module.css";
import Snippet from "@/shared/blogStructure/Snippet";
import { Fragment } from "react";

export const normalizeName = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

export const renderTextWithStyles = (text) => {
  // Captura **_texto_**, **texto**, *texto*
  const combinedRegex = /(\*\*_(.*?)_\*\*)|(\*\*(.*?)\*\*)|(\*(.*?)\*)/g;

  const elements = [];
  let lastIndex = 0;

  String(text).replace(
    combinedRegex,
    (match, boldItalic, boldItalicText, bold, boldText, italic, italicText, offset) => {
      if (offset > lastIndex) {
        elements.push(String(text).substring(lastIndex, offset));
      }

      if (boldItalic) {
        // **_texto_**
        elements.push(
          <strong key={`bi-${offset}`}>
            <em>{boldItalicText}</em>
          </strong>
        );
      } else if (bold) {
        // **texto**
        elements.push(<strong key={`b-${offset}`}>{boldText}</strong>);
      } else if (italic) {
        // *texto*
        elements.push(<em key={`i-${offset}`}>{italicText}</em>);
      }

      lastIndex = offset + match.length;
    }
  );

  if (lastIndex < String(text).length) {
    elements.push(String(text).substring(lastIndex));
  }

  return elements;
};

/* ===== Preservar \n como <br/> ===== */
const withNewlines = (nodes) => {
  const out = [];
  let k = 0;

  const pushWithBreaks = (str) => {
    const parts = String(str).split("\n");
    parts.forEach((p, i) => {
      if (p) out.push(p);
      if (i < parts.length - 1) out.push(<br key={`br-${k++}`} />);
    });
  };

  for (const n of [].concat(nodes)) {
    if (typeof n === "string") pushWithBreaks(n);
    else out.push(n);
  }
  return out;
};

const renderInlineWithStyles = (text) => {
  const parts = String(text).split(/(`[^`]+`)/g);

  return parts.map((seg, i) => {
    if (/^`[^`]+`$/.test(seg)) {
      return (
        <Snippet key={`code-${i}`} inline code={seg.slice(1, -1)} language="txt" />
      );
    }
    // Preserva \n en el texto normal
    return <span key={`t-${i}`}>{withNewlines(renderTextWithStyles(seg))}</span>;
  });
};

const parseFenceHeader = (rawHeader = "") => {
  const tokens = rawHeader.trim().split(/\s+/).filter(Boolean);
  const meta = {
    language: "txt",
    fileName: undefined,
    showLineNumbers: false,
    wrap: false,
  };

  if (tokens.length > 0 && !tokens[0].includes("=")) {
    meta.language = tokens.shift();
  }

  for (const t of tokens) {
    if (t.startsWith("file=")) meta.fileName = t.slice(5);
    else if (t === "lines") meta.showLineNumbers = true;
    else if (t === "wrap") meta.wrap = true;
  }
  return meta;
};

export const renderDescription = (description) => {
  // 1) NUEVO FORMATO: array de bloques
  if (Array.isArray(description)) {
    return description.map((block, idx) => {
      if (!block || typeof block !== "object") return null;

      switch (block.type) {
        case "h1":
          return (
            <li key={`h1-${idx}`} className={styles.noBullet}>
              <h1 className={styles.h1}>
                {renderInlineWithStyles(block.text || "")}
              </h1>
            </li>
          );

        case "h2":
          return (
            <li key={`h2-${idx}`} className={styles.noBullet}>
              <h2 className={styles.h2}>
                {renderInlineWithStyles(block.text || "")}
              </h2>
            </li>
          );

        case "h3":
          return (
            <li key={`h3-${idx}`} className={styles.noBullet}>
              <h3 className={styles.h3}>
                {renderInlineWithStyles(block.text || "")}
              </h3>
            </li>
          );

        case "p": {
          if (Array.isArray(block?.parts) && block.parts.length) {
            return (
              <li key={`p-${idx}`} className={styles.noBullet}>
                <p className={styles.paragraph}>
                  {block.parts.map((part, pIdx) => {
                    if (!part) return null;

                    if (part.type === "text") {
                      return (
                        <Fragment key={`pt-${idx}-${pIdx}`}>
                          {renderInlineWithStyles(part.text || "")}
                        </Fragment>
                      );
                    }

                    if (part.type === "link" && part.href) {
                      return (
                        <a
                          key={`pl-${idx}-${pIdx}`}
                          href={part.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          {renderInlineWithStyles(part.text || part.href)}
                        </a>
                      );
                    }
                    return null;
                  })}
                </p>
              </li>
            );
          }
          return (
            <li key={`p-${idx}`} className={styles.noBullet}>
              <p className={styles.paragraph}>{renderInlineWithStyles(block.text || "")}</p>
            </li>
          );
        }

        case "snippet":
          return (
            <li key={`s-${idx}`} className={styles.noBullet}>
              <Snippet
                code={block.code || ""}
                language={block.language || "txt"}
                fileName={block.fileName}
                showLineNumbers={!!block.showLineNumbers}
                wrap={!!block.wrap}
              />
            </li>
          );

        case "ul": {
          const items = Array.isArray(block.items) ? block.items : [];
          return (
            <li key={`ul-${idx}`} className={styles.noBullet}>
              <ul className={styles.list}>
                {items.map((it, j) => (
                  <li key={`uli-${j}`}>
                    {typeof it === "string"
                      ? renderInlineWithStyles(it)
                      : renderInlineWithStyles(it?.text || "")}
                  </li>
                ))}
              </ul>
            </li>
          );
        }

        case "image": {
          if (!block?.src) return null;

          const imgProps =
            block.width && block.height ? { width: block.width, height: block.height } : {};

          const variantClass =
            block.variant === "small" ? styles.inlineImageSmall : styles.inlineImage;

          return (
            <li key={`img-${idx}`} className={styles.noBullet}>
              <figure className={styles.figure}>
                <img
                  src={block.src}
                  alt={block.alt || ""}
                  className={variantClass}
                  loading="lazy"
                  decoding="async"
                  {...imgProps}
                />
                {block.caption && (
                  <figcaption className={styles.figCaption}>{block.caption}</figcaption>
                )}
              </figure>
            </li>
          );
        }

        case "link": {
          if (!block?.href) return null;

          return (
            <li key={`link-${idx}`} className={styles.noBullet}>
              <a
                href={block.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {block.text || block.href}
              </a>
            </li>
          );
        }

        case "downloadLink": {
          if (!block?.href) return null;

          return (
            <li key={`dl-${idx}`} className={styles.noBullet}>
              <a
                href={block.href}
                download={block.fileName || true}
                className={styles.downloadLink}
              >
                {block.text || block.fileName || "Descargar archivo"}
              </a>
            </li>
          );
        }


        default:
          return null;
      }
    });
  }

  // 2) FORMATO LEGACY: cadena con saltos de línea
  const lines = String(description).split("\n");

  const items = [];
  let i = 0;
  let inFence = false;
  let fenceMeta = null;
  let codeLines = [];

  while (i < lines.length) {
    const line = lines[i];

    // Apertura de fence ```<header opcional>
    const open = line.match(/^\s*```(.*)$/);
    if (open && !inFence) {
      inFence = true;
      fenceMeta = parseFenceHeader(open[1] || "");
      codeLines = [];
      i++;
      continue;
    }

    // Cierre de fence ```
    if (inFence && /^\s*```\s*$/.test(line)) {
      const code = codeLines.join("\n");
      items.push(
        <li key={`fence-${i}`} className={styles.noBullet}>
          <Snippet
            code={code}
            language={fenceMeta.language}
            fileName={fenceMeta.fileName}
            showLineNumbers={!!fenceMeta.showLineNumbers}
            wrap={!!fenceMeta.wrap}
          />
        </li>
      );
      inFence = false;
      fenceMeta = null;
      codeLines = [];
      i++;
      continue;
    }

    // Línea dentro del fence → acumula
    if (inFence) {
      codeLines.push(line);
      i++;
      continue;
    }

    const trimmed = line.trim();

    // Línea vacía → respeta el salto
    if (!trimmed) {
      items.push(
        <li key={`blank-${i}`} className={styles.noBullet}>
          <p className={styles.paragraph}>
            <br />
          </p>
        </li>
      );
      i++;
      continue;
    }

    // Encabezados markdown-lite: #, ##, ###
    const hMatch = line.match(/^\s*(#{1,3})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length; // 1, 2 o 3
      const text = hMatch[2];
      const key = `h-${i}-${level}`;
      if (level === 1) {
        items.push(
          <li key={key} className={styles.noBullet}>
            <h1 className={styles.h1}>{renderInlineWithStyles(text)}</h1>
          </li>
        );
      } else if (level === 2) {
        items.push(
          <li key={key} className={styles.noBullet}>
            <h2 className={styles.h2}>{renderInlineWithStyles(text)}</h2>
          </li>
        );
      } else {
        items.push(
          <li key={key} className={styles.noBullet}>
            <h3 className={styles.h3}>{renderInlineWithStyles(text)}</h3>
          </li>
        );
      }
      i++;
      continue;
    }

    // Viñeta con "* " o "- "
    if (/^\s*[\*\-]\s+/.test(line)) {
      const content = line.replace(/^\s*[\*\-]\s+/, "");
      items.push(
        <li key={`li-${i}`} className={styles.rightAlignedList}>
          {renderInlineWithStyles(content)}
        </li>
      );
      i++;
      continue;
    }

    // Párrafo "normal" (preserva \n internos vía renderInlineWithStyles)
    items.push(
      <li key={`p-${i}`} className={styles.noBullet}>
        <p className={styles.paragraph}>{renderInlineWithStyles(line)}</p>
      </li>
    );

    i++;
  }

  return items;
};
