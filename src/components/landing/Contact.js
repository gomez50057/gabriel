'use client';

import { memo } from 'react';
import styles from '@/styles/Contact.module.css';

const ICON_SIZE = { w: 60, h: 60 };

const LINKS = [
  {
    href: 'mailto:gomez50057@gmail.com',
    label: 'Enviar correo a gomez50057@gmail.com',
    text: 'Gmail',
    iconSrc: '/img/icons/email.png',
    newTab: false,
  },
  {
    href: 'https://t.me/gomez50057',
    label: 'Abrir Telegram de gomez50057',
    text: 'Telegram',
    iconSrc: '/img/icons/telegram.png',
    newTab: true,
  },
  {
    href: 'https://www.linkedin.com/in/gomez50057/',
    label: 'Perfil de LinkedIn de gomez50057',
    text: 'LinkedIn',
    iconSrc: '/img/icons/linkedin.png',
    newTab: true,
  },
  {
    href: 'https://github.com/gomez50057',
    label: 'Perfil de GitHub de gomez50057',
    text: 'GitHub',
    iconSrc: '/img/icons/github.png',
    newTab: true,
  },
];

const ContactLink = memo(function ContactLink({
  href,
  label,
  text,
  iconSrc,
  newTab,
}) {
  const target = newTab ? '_blank' : undefined;
  const rel = newTab ? 'noopener noreferrer' : undefined;

  return (
    <a
      href={href}
      aria-label={label}
      target={target}
      rel={rel}
      className={styles.link}
    >
      <div className={styles.layer} aria-hidden="true">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span className={styles.icon} aria-hidden="true">
          <img
            src={iconSrc}
            alt=""
            width={ICON_SIZE.w}
            height={ICON_SIZE.h}
            loading="lazy"
            decoding="async"
          />
        </span>
      </div>
      <div className={styles.text}>{text}</div>
    </a>
  );
});

export default function Contact() {
  return (
    <section className="seccion" id="contacto">
      <div className={styles.title}>
        <h2>Contacto</h2>
        <p>Estamos a un clic de distancia</p>
      </div>

      <div className={styles.icons}>
        {LINKS.map((item) => (
          <ContactLink key={item.text} {...item} />
        ))}
      </div>
    </section>
  );
}
