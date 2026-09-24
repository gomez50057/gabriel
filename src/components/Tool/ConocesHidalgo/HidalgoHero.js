import Image from "next/image";
import styles from "./HidalgoHero.module.css";

function Compass({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="50" cy="50" r="37" />
      <path d="M50 3v94M3 50h94M23 23l54 54M23 77l54-54" opacity=".55" />
      <path d="M50 12l7 31 31 7-31 7-7 31-7-31-31-7 31-7Z" />
      <path d="M50 12v38l-7-7Zm38 38H50l7-7ZM50 88V50l7 7ZM12 50h38l-7 7Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function HidalgoHero() {
  return (
    <header className={styles.hero} aria-labelledby="hidalgo-title">
      <Image className={styles.background} src="/conoces-hidalgo-hero.png" alt="" fill priority sizes="100vw" quality={90} />
      <div className={styles.content}>
        <h1 id="hidalgo-title" className={styles.title}>
          <span>¿Conoces</span><span>Hidalgo?</span>
        </h1>
        <h2 className={styles.subtitle}>Explora sus 84 municipios</h2>
        <p className={styles.description}>Descubre su historia, cultura, paisajes y tradiciones mediante retos interactivos que te llevarán a recorrer todo el territorio hidalguense.</p>
        <a className={styles.start} href="#games-title">
          Comenzar
          <svg viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 12h27M22 4l8 8-8 8" /></svg>
        </a>
      </div>
      <div className={styles.badge} aria-label="84 municipios">
        <Compass className={styles.badgeIcon} />
        <strong>84</strong><span>Municipios</span><i />
      </div>
      <div className={styles.cartography} aria-hidden="true">
        <span>N</span><Compass className={styles.compass} />
        <p>Historias<br />Paisajes<br />Tradiciones<br />Gente</p>
      </div>
    </header>
  );
}
