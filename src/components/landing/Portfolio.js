'use client';

import { memo, useMemo } from 'react';
import styles from '@/styles/Portfolio.module.css';

const projectsData = [
  // Fila 1
  [
    {
      img: 'img/proyectos/proyecto1.webp',
      alt: 'repostería web',
      title: 'Copo de Nieve',
      tech: 'HTML│JS│CSS│Bootstrap',
      links: [
        { href: 'https://gomez50057.github.io/LaunchX-FrontEnd-Reposteria', icon: 'fa-solid fa-eye', label: 'Ver Copo de Nieve' },
        { href: 'https://github.com/gomez50057/LaunchX-FrontEnd-Reposteria', icon: 'fa-brands fa-github', label: 'Repositorio Copo de Nieve' },
      ],
    },
    {
      img: 'img/proyectos/fuego.webp',
      alt: 'covid vacunación',
      title: 'El Fuego',
      tech: 'HTML│JS│CSS',
      links: [
        { href: 'https://gomez50057.github.io/el-fuego', icon: 'fa-solid fa-eye', label: 'Ver El Fuego' },
        { href: 'https://gomez50057.github.io/el-fuego', icon: 'fa-brands fa-github', label: 'Repositorio El Fuego' },
      ],
    },
    {
      img: 'img/proyectos/MG.webp',
      alt: 'MG Inmobiliaria',
      title: 'MG Inmobiliaria',
      tech: 'HTML│JS│CSS│Wordpress',
      links: [
        { href: 'https://mginmobiliariamexico.com/', icon: 'fa-solid fa-eye', label: 'Ver MG Inmobiliaria' },
        { href: 'https://mginmobiliariamexico.com/', icon: 'fa-brands fa-github', label: 'Repositorio MG Inmobiliaria' },
      ],
    },
  ],
  // Fila 2
  [
    {
      img: 'img/proyectos/proyectos/IQ.webp',
      alt: 'IQ English',
      title: 'IQ English',
      tech: 'HTML│JS│CSS│Wordpress',
      links: [
        { href: 'https://iqenglishpachuca.com/', icon: 'fa-solid fa-eye', label: 'Ver IQ English' },
        { href: 'https://iqenglishpachuca.com/', icon: 'fa-brands fa-github', label: 'Repositorio IQ English' },
      ],
    },
    {
      img: 'img/proyectos/proyecto5.webp',
      alt: 'Pronóstico del tiempo',
      title: 'Pronóstico del tiempo',
      tech: 'HTML│React JS│CSS',
      links: [
        { href: 'https://gomez50057.github.io/temperatura/', icon: 'fa-solid fa-eye', label: 'Ver Pronóstico del tiempo' },
        { href: 'https://github.com/gomez50057/temperatura/', icon: 'fa-brands fa-github', label: 'Repositorio Pronóstico del tiempo' },
      ],
    },
    {
      img: 'img/proyectos/proyecto6.webp',
      alt: 'CNC cortes en caja',
      title: 'Fresadora',
      tech: 'SolidWorks│CNC',
      links: [
        { href: 'Pag/portafolio.html', icon: 'fa-solid fa-eye', label: 'Ver Fresadora' },
      ],
    },
  ],
  // Fila 3
  [
    {
      img: 'img/proyectos/proyecto7.webp',
      alt: 'Ansys',
      title: 'Perilla - Deformación nodal',
      tech: 'Ansys',
      links: [
        { href: 'https://giphy.com/embed/nNrsWKrKxKHwcMIJx5', icon: 'fa-solid fa-eye', label: 'Ver Perilla - Deformación nodal' },
      ],
    },
    {
      img: 'img/proyectos/proyecto8.webp',
      alt: 'carrito de compras inteligente',
      title: 'Carrito inteligente',
      tech: 'Solidworks',
      links: [
        { href: 'https://sketchfab.com/models/2453f8b6f65540bc8115f6906331edc9/embed', icon: 'fa-solid fa-eye', label: 'Ver Carrito inteligente' },
      ],
    },
    {
      img: 'img/proyectos/proyecto9.webp',
      alt: 'Casa render Solidworks',
      title: 'Casa',
      tech: 'Solidworks',
      links: [
        { href: 'https://sketchfab.com/models/b74bb885a1c94f68822ae241e6b2207e/embed?ui_theme=dark', icon: 'fa-solid fa-eye', label: 'Ver Casa' },
      ],
    },
  ],
];

const MemberCard = memo(function MemberCard({ project, priority }) {
  return (
    <div className={styles.project}>
      <div className={styles.member}>
        <div className={styles.imageWrap} aria-hidden="true">
          <img
            src={`/${project.img}`}
            alt={project.alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}   // <-- aquí el fix
            decoding="async"
            width={project.width}
            height={project.height}
            className={styles.image}
          />
        </div>

        <div className={styles.memberInfo}>
          <div className={styles.memberInfoContent}>
            <h4>{project.title}</h4>
            <span>{project.tech}</span>
          </div>
          <div className={styles.social}>
            {project.links?.map((l, idx) => (
              <a
                key={idx}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
              >
                <i className={l.icon} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Portfolio() {
  const rows = useMemo(() => projectsData, []);

  return (
    <section id="portfolio" className={`${styles.portfolio} seccion`}>
      <div className={styles.titleSection}>
        {/* <h2>Últimamente he dado vida a…</h2> */}
        {/* <p>Ideas que hoy ya son proyectos reales.</p> */}
        <h2>Recientemente he trabajado en…</h2>
        <p>Lo último que he llevado de la idea a la realidad.</p>
      </div>

      {rows.map((row, rowIdx) => (
        <div className={styles.row} key={`row-${rowIdx}`}>
          {row.map((proj, colIdx) => (
            <MemberCard
              key={`${proj.title}-${colIdx}`}
              project={proj}
              // Prioriza imágenes visibles primero (solo la primera fila)
              priority={rowIdx === 0}
            />
          ))}
        </div>
      ))}

      <div className={styles.moreWrapper}>
        <a href="portafolio" rel="noopener noreferrer" className={styles.moreLink}>
          MÁS PROYECTOS . . .
        </a>
      </div>
    </section>
  );
}
