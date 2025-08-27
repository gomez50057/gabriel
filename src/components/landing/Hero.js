'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/Hero.module.css';

export default function Hero() {
  const strings = [
    'Full Stack developer',
    'Ingeniero en Sistemas y Tecnologías Industriales',
  ];
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (subIndex === strings[index].length + 1 && !deleting) {
      const t = setTimeout(() => setDeleting(true), 1500);
      return () => clearTimeout(t);
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % strings.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? 50 : 120);
    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, strings]);

  useEffect(() => {
    setText(strings[index].substring(0, subIndex));
  }, [subIndex, index, strings]);

  return (
    <section className={styles.seccion} id="inicio">
      {/* Fondo con imagen centrada y overlay */}
      <div className={styles.heroImageContainerOverlay} aria-hidden="true">
        <img
          src="/img/hero/gabriel-gomez.png"
          alt=""
          className={styles.heroImageOverlay}
        />
        <div className={styles.heroOverlay} />
      </div>

      {/* Contenido por encima */}
      <div className={styles.contenido}>
        <div className={styles.presentacion}>
          <h2 className={styles.inlineHero}>
            Soy <span className={styles.name}>Gabriel Gómez,</span>{' '}
            <span className={styles.typed}>{text}</span>
            <span className={styles.cursor}>|</span>
          </h2>
          <p className={styles.descripcion}>DESARROLLO DE PLATAFORMAS Y SITIOS WEB · PLANES DE LOGÍSTICA Y CALIDAD</p>
        </div>
        <div className={styles.heroImageContainer}>
          <img
            src="/img/hero/persona.png"
            alt="Hero Image"
            className={styles.heroImage}
          />
        </div>

        {/* Indicador Portafolio giratorio */}
        <div className={styles.ctaCircleWrap}>
          <a
            href="#portfolio"
            className={styles.ctaCircleButton}
            aria-label="Ir a Portafolio"
            title="Ver portafolio"
            onClick={(e) => {
              const el = document.getElementById('portfolio');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                window.location.href = '/#portfolio';
              }
            }}
          >
            <div className={styles.ctaCircle}>
              <svg viewBox="0 0 100 100" className={styles.rotatingText}>
                <defs>
                  <path id="textcircle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <text>
                  <textPath href="#textcircle" startOffset="0">
                    {` Portafolio - Portafolio - `}
                  </textPath>
                </text>
              </svg>
              <span className={styles.arrow} aria-hidden="true">↓</span>
            </div>
          </a>
        </div>

      </div>
    </section>
  );
}
