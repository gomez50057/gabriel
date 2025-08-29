// Server Component por defecto
import styles from './HeroHacks.module.css';

export default function HeroHacks({
  subtitle = 'SENIOR EN PROCESO',
  intro = `Un espacio donde cada línea de código suma. Aquí comparto pequeños hacks, tutoriales y experimentos full stack: desde cómo implementar funciones y bibliotecas hasta tips que hacen más fácil el día a día en el desarrollo.

Porque igual que en un proyecto, yo también estoy en constante refactor: Lo que no se trackea, no escala.`,
  posts = [
    {
      id: 1,
      tag: 'CREATIVE',
      title: 'BEHIND THE CURTAIN A DAY IN THE LIFE OF A CREATIVE AGENCY',
      excerpt:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuscе convallis.',
      image: '/img/hacks/thumb-1.jpg',
      href: '#',
    },
    {
      id: 2,
      tag: 'BRANDING',
      title:
        'DESIGNING SUCCESS THE IMPACT OF CREATIVE AGENCIES ON BRAND EVOLUTION',
      excerpt:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuscе convallis.',
      image: '/img/hacks/thumb-2.jpg',
      href: '#',
      featured: true, // tarjeta central grande
    },
    {
      id: 3,
      tag: 'UI/DESIGN',
      title: 'HOW CREATIVE AGENCIES TURN IDEAS INTO ICONIC BRANDS',
      excerpt:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuscе convallis.',
      image: '/img/hacks/thumb-3.jpg',
      href: '#',
    },
  ],
}) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 id="hero-title" className={styles.title}>
            HACKS
          </h1>
          <span className={styles.pill} aria-label={subtitle}>
            {subtitle}
          </span>
        </div>

        <p className={styles.intro}>{intro}</p>
      </header>

      <div className={styles.grid} role="list">
        {posts.map((p) => (
          <article
            key={p.id}
            className={`${styles.card} ${p.featured ? styles.featured : ''}`}
            role="listitem"
          >
            <a className={styles.cardLink} href={p.href} aria-label={p.title}>
              <div className={styles.media}>
                <img
                  src={p.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={styles.image}
                />
              </div>

              <div className={styles.body}>
                <span className={styles.tag}>{p.tag}</span>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <p className={styles.excerpt}>{p.excerpt}</p>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
