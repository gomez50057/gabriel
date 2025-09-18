"use client";

import { useMemo, useState } from "react";
import styles from "./AguinaldoCalculator.module.css";

const NIVELES = [
  { nivel: "007",  nombramiento: "Técnico/a Especializado/a",  mensual:  9645.00 },
  { nivel: "09C",  nombramiento: "Jefatura de Departamento C",  mensual: 17299.00 },
  { nivel: "10A",  nombramiento: "Subdirección Adjunta A",      mensual: 19459.00 },
  { nivel: "10C",  nombramiento: "Subdirección de Área C",      mensual: 23718.00 },
  { nivel: "11B",  nombramiento: "Dirección de Área B",         mensual: 32230.00 },
  { nivel: "12B",  nombramiento: "Dirección General B",         mensual: 46640.00 },
  { nivel: "14B",  nombramiento: "Secretaría B",                mensual: 58630.00 },
  { nivel: "89A",  nombramiento: "Jefatura de Área A",          mensual: 11485.00 },
  { nivel: "89B",  nombramiento: "Jefatura de Área B",          mensual: 12938.00 },
];

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

function redondear2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Props:
 * - theme: "auto" | "light" | "dark"  (default: "auto")
 */
export default function AguinaldoCalculator({ theme = "auto" }) {
  const [nivel, setNivel] = useState(NIVELES[0].nivel);

  const registro = useMemo(
    () => NIVELES.find((r) => r.nivel === nivel) ?? NIVELES[0],
    [nivel]
  );

  const resultados = useMemo(() => {
    const mensual = registro.mensual;
    const diario = redondear2(mensual / 30);
    const base65 = redondear2(diario * 65);
    const nov30 = redondear2(base65 * 0.30);
    const dic70 = redondear2(base65 * 0.70);
    const total = base65;
    return { mensual, diario, base65, nov30, dic70, total };
  }, [registro]);

  return (
    <section
      className={styles.card}
      aria-labelledby="titulo-aguinaldo"
      data-theme={theme} // <- controla tema
    >
      <h2 id="titulo-aguinaldo" className={styles.title}>
        Calculadora de Aguinaldo (Gobierno)
      </h2>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.row}>
          <label htmlFor="nivel" className={styles.label}>Nivel del puesto</label>
          <select
            id="nivel"
            className={styles.select}
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            aria-describedby="ayuda-nivel"
          >
            {NIVELES.map((r) => (
              <option key={r.nivel} value={r.nivel}>
                {r.nivel} — {r.nombramiento}
              </option>
            ))}
          </select>
          <div id="ayuda-nivel" className={styles.help}>
            Selecciona el nivel para calcular el aguinaldo conforme a 65 días.
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.item}>
            <span className={styles.k}>Nombramiento</span>
            <span className={styles.v}>{registro.nombramiento}</span>
          </div>
          <div className={styles.item}>
            <span className={styles.k}>Remuneración mensual bruta</span>
            <span className={styles.v}>{MXN.format(resultados.mensual)}</span>
          </div>
          <div className={styles.item}>
            <span className={styles.k}>Sueldo diario (mensual/30)</span>
            <span className={styles.v}>{MXN.format(resultados.diario)}</span>
          </div>
          <div className={styles.itemHighlight}>
            <span className={styles.kStrong}>Base 65 días (diario × 65)</span>
            <span className={styles.vStrong}>{MXN.format(resultados.base65)}</span>
          </div>
        </div>

        <hr className={styles.hr} />

        <div className={styles.columns}>
          <div className={styles.col}>
            <h3 className={styles.subtitle}>Primera parte (Noviembre)</h3>
            <p className={styles.muted}>30% de la base de 65 días</p>
            <div className={styles.totalBox}>
              {MXN.format(resultados.nov30)}
            </div>
          </div>

          <div className={styles.col}>
            <h3 className={styles.subtitle}>Segunda parte (Diciembre)</h3>
            <p className={styles.muted}>70% restante</p>
            <div className={styles.totalBox}>
              {MXN.format(resultados.dic70)}
            </div>
          </div>

          <div className={styles.col}>
            <h3 className={styles.subtitle}>Aguinaldo total (100%)</h3>
            <p className={styles.muted}>Suma de ambas partes</p>
            <div className={styles.totalBoxPrimary}>
              {MXN.format(resultados.total)}
            </div>
          </div>
        </div>
      </form>

      <details className={styles.details}>
        <summary>Fórmula aplicada</summary>
        <ol className={styles.list}>
          <li><code>diario = remuneración_mensual_bruta / 30</code></li>
          <li><code>base65 = diario × 65</code></li>
          <li><code>noviembre (30%) = base65 × 0.30</code></li>
          <li><code>diciembre (70%) = base65 × 0.70</code></li>
          <li><code>total (100%) = base65</code></li>
        </ol>
      </details>
    </section>
  );
}
