"use client";

import styles from "@/styles/shared/Footer.module.css";

const imgBasePath = "/img/icons/";
const year = new Date().getFullYear();

const LINKS = [
  { href: "mailto:gomez50057@gmail.com", label: "Enviar correo a gomez50057@gmail.com", icon: "email.png", text: "gomez50057@gmail.com", newTab: false },
  { href: "https://t.me/gomez50057", label: "Abrir Telegram de gomez50057", icon: "telegram.png", text: "@gomez50057", newTab: true },
  { href: "https://www.linkedin.com/in/gomez50057/", label: "Perfil de LinkedIn de gomez50057", icon: "linkedin.png", text: "/in/gomez50057", newTab: true },
  { href: "https://github.com/gomez50057", label: "Perfil de GitHub de gomez50057", icon: "github.png", text: "github.com/gomez50057", newTab: true },
];

export default function Footer() {
  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.footerRedes}>
        {LINKS.map((it) => (
          <a
            key={it.href}
            href={it.href}
            aria-label={it.label}
            target={it.newTab ? "_blank" : undefined}
            rel={it.newTab ? "noopener noreferrer" : undefined}
            title={it.text}
            className={styles.socialLink}
          >
            <img src={`${imgBasePath}${it.icon}`} alt="" loading="lazy" decoding="async" />
          </a>
        ))}
      </div>

      <div className={styles.footerContacto}>
        <div className={styles.footerContactoTxt}>
          <div className={styles.footerContactoIco}>
            <img src={`${imgBasePath}telegram.png`} alt="" loading="lazy" decoding="async" />
            <div>
              <p><span>CONTACTO:</span></p>
              <p><span>Gabriel Gómez Gómez</span></p>
            </div>
          </div>

          <div className={styles.contactList}>
            <p><span>Correo:</span> gomez50057@gmail.com</p>
            <p><span>Telegram:</span> @gomez50057</p>
            <p><span>LinkedIn:</span> /in/gomez50057</p>
            <p><span>GitHub:</span> github.com/gomez50057</p>
          </div>

          <div className={styles.lineaFooter}></div>

          <p>Portafolio / Sitio personal</p>
          <p className={styles.copyright}>
            © {year} Gabriel Gómez Gómez. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
