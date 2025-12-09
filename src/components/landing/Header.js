"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ThemeSwitch from "@/shared/ThemeSwitch";
import styles from "@/styles/Header.module.css";

/**
 * LINKS con subnivel
 */
const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#sobremi", label: "Sobre Mi" },
  { href: "/hacks", label: "Hacks" },
  { href: "/#portfolio", label: "Portafolio" },
  { href: "/#contacto", label: "Contacto" },
  {
    label: "Herramientas",
    children: [
      {
        href: "/herramientas/conversor-mayusculas-minusculas",
        label: "Convertidor de texto",
      },
      {
        href: "/herramientas/generador-clamp",
        label: "Generador de clamp",
      },
    ],
  },
];

const flattenLinks = (links) =>
  links.flatMap((l) => (l.children ? l.children : [l]));

const getHashId = (href) => {
  if (!href) return null;
  const idx = href.indexOf("#");
  if (idx === -1) return null;
  const id = href.slice(idx + 1);
  return id || null;
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#inicio");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  const lastY = useRef(0);
  const ticking = useRef(false);

  // Activar link según sección visible (para anclas tipo /#sobremi)
  useEffect(() => {
    const all = flattenLinks(LINKS);
    const ids = all.map((l) => getHashId(l.href)).filter(Boolean);
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive("#" + visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Sombra al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ocultar al bajar / mostrar al subir
  useEffect(() => {
    const THRESHOLD = 6;

    const onScrollDir = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY || 0);
        const delta = y - lastY.current;
        const nearTop = y < 24;

        if (open || nearTop) {
          setHidden(false);
        } else {
          if (delta > THRESHOLD) {
            setHidden(true);
          } else if (delta < -THRESHOLD) {
            setHidden(false);
          }
        }

        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScrollDir, { passive: true });
    return () => window.removeEventListener("scroll", onScrollDir);
  }, [open]);

  // Bloquear scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    if (open) document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  // Cerrar con Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href) => {
    const id = getHashId(href);
    return id ? active === `#${id}` : false;
  };

  return (
    <header
      className={`${styles.header} ${styles.glass} ${scrolled ? styles.scrolled : ""
        } ${hidden ? styles.headerHidden : ""}`}
    >
      <div className={styles.inner}>
        <a href="#inicio" aria-label="Ir al inicio" className={styles.logoLink}>
          <img src="/img/logo.svg" alt="Logo Gabriel Gomez" className={styles.logo} />
        </a>

        {/* Nav desktop */}
        <nav className={styles.navDesktop} aria-label="Principal">
          <ul className={styles.links}>
            {LINKS.map((link) => {
              // Item con subnivel (Herramientas)
              if (link.children?.length) {
                return (
                  <li key={link.label} className={styles.dropdown}>
                    <button
                      type="button"
                      className={styles.dropdownTrigger}
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <span className={styles.linkInner}>
                        {link.label}
                        <span className={styles.dropdownCaret} />
                      </span>
                    </button>

                    <div className={styles.dropdownMenuDesktop}>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={styles.dropdownLink}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </li>
                );
              }

              // Item normal
              const href = link.href;
              const label = link.label;

              return (
                <li key={href}>
                  {href.startsWith("/") ? (
                    <Link href={href} className={styles.link}>
                      <span
                        className={`${styles.linkInner} ${isActive(href) ? styles.active : ""
                          }`}
                      >
                        {label}
                      </span>
                    </Link>
                  ) : (
                    <a href={href} className={styles.link}>
                      <span
                        className={`${styles.linkInner} ${isActive(href) ? styles.active : ""
                          }`}
                      >
                        {label}
                      </span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.right}>
          <div className={styles.redes}>
            <a
              href="https://www.linkedin.com/in/gomez50057/"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/img/icons/linkedin.svg"
                alt=""
                width="22"
                height="22"
                className={styles.socialIcon}
              />
            </a>

            <a
              href="https://github.com/gomez50057"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/img/icons/github.svg"
                alt=""
                width="22"
                height="22"
                className={styles.socialIcon}
              />
            </a>
          </div>

          <ThemeSwitch className={styles.switch} />

          <button
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className={`${styles.burger} ${open ? styles.burgerOpen : ""}`}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Overlay móvil */}
      <div
        id="mobile-nav"
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      >
        <nav
          className={styles.menu}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className={styles.menuList} onClick={() => setOpen(false)}>
            {LINKS.map((link) => {
              if (link.children?.length) {
                return (
                  <li key={link.label}>
                    <span className={styles.menuGroupLabel}>{link.label}</span>
                    <ul className={styles.menuSubList}>
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} className={styles.menuLink}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }

              const href = link.href;
              const label = link.label;

              return (
                <li key={href}>
                  {href.startsWith("/") ? (
                    <Link href={href} className={styles.menuLink}>
                      {label}
                    </Link>
                  ) : (
                    <a href={href} className={styles.menuLink}>
                      {label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
