'use client';

import styles from '@/styles/AboutMe.module.css';

export default function AboutMe() {
  return (
    <section id="sobremi" className={styles.section}>
      {/* Imagen de encabezado completa */}
      <div className={styles.headerImage}>
        <img
          src="/img/about/sobre-mi-header.png" // ⬅️ usa tu archivo final
          alt="Sobre Mi - Hola, Soy Gabriel Gómez"
          className={styles.headerImg}
        />
      </div>

      {/* Tarjeta con descripción y botón */}
      <div className={styles.card}>
        <p className={styles.paragraph}>
          Desarrollador web con experiencia en el sector público, especializado en crear soluciones
          digitales desde cero: diseño, frontend, backend y despliegue. Apasionado por construir
          aplicaciones funcionales, accesibles y orientadas a mejorar la experiencia del usuario
          final, combinando creatividad, solidez técnica y un enfoque en resultados.
        </p>

        <p className={styles.paragraph}>
          Como ingeniero en STI, cuento también con experiencia en el diseño e implementación de
          funciones de apoyo: planeación, logística, compras y control de calidad, lo que me brinda
          una visión integral para la resolución de problemas y la optimización de procesos.
        </p>
      </div>

      <div className={styles.containerButton}>
        <a
          className={styles.cvButton}
          href="/pdf/CV-Gabriel-Gómez-G.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Descargar CV
        </a>
      </div>
    </section>
  );
}
