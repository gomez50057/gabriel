import styles from '@/styles/blog/HeroHacks.module.css';

export default function HeroHacks({
  subtitle = 'SENIOR EN PROCESO',
  intro = `Un espacio donde cada línea de código suma. Aquí comparto pequeños hacks, tutoriales y experimentos full stack: desde cómo implementar funciones y bibliotecas hasta tips que hacen más fácil el día a día en el desarrollo. Porque igual que en un proyecto, yo también estoy en constante refactor: Lo que no se trackea, no escala.`,
  posts = [
    {
      id: 1,
      tag: 'Hacks',
      title: 'Cómo arreglar el bloqueo de Facebook, Instagram o WhatsApp (y cualquier página bloqueada en /etc/hosts)',
      excerpt:
        'Notas que varias páginas web simplemente no abren, aunque tu conexión esté perfectamente bien. Aquí te explico cómo arreglarlo.',
      image: '/img/tutoriales/fix-blocked-sites-hosts.jpg',
      href: '/hacks/como-arreglar-el-bloqueo-de-facebook-instagram-o-whatsapp-y-cualquier-pagina-bloqueada-en-etchosts',
    },
    {
      id: 2,
      tag: 'Desarrollo Web',
      title:
        'Guía paso a paso: crea tu proyecto con Next.js 15',
      excerpt:
        'Vamos a crear un proyecto de Next.js 15 desde cero, eligiendo opciones óptimas para tu stack',
      image: '/img/tutoriales/nextjs-setup.png',
      href: '/hacks/guia-paso-a-paso-crea-tu-proyecto-con-nextjs-15',
      featured: true, // tarjeta central grande
    },
    {
      id: 3,
      tag: 'Hacks',
      title: 'Cómo descomprimir archivos en Linux sin moverte de carpeta (CyberArk + WinSCP)',
      excerpt:
        'Cuando trabajamos con CyberArk y WinSCP, puede ocurrir que las carpetas no se suban correctamente.',
      image: '/img/tutoriales/linux-unzip-cyberark.png',
      href: '/hacks/conexion-ssh-que-necesitas-y-como-iniciar-sesion-de-forma-segura',
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
