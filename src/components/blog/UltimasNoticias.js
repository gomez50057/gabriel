import styles from "./UltimasNoticias.module.css";
import Link from "next/link";
import { normalizeName, renderDescription } from "@/utils/blogData";

const UltimasNoticias = ({ posts }) => {
  const MAX_LENGTH = 50; // Máxima longitud antes de mostrar "..."

  return (
    <section className={styles.ultimasNoticias}>
      <h2 className={styles.sectionTitle}> <span className="span-doarado">Últimas </span> Noticias</h2>
      <div className={styles.newsGrid}>
        {posts.map((post, index) => (
          <div key={index} className={styles.newsItem}>
            <img src={post.image} alt={post.name} className={styles.newsImage} />
            <h3 className={styles.newsTitle}>{post.name}</h3>
            <p className={styles.newsDate}>{post.date}</p>
            {/* Descripción procesada con estilos */}
            <div className={styles.newsDescription}>
              {post.description.length > MAX_LENGTH
                ? renderDescription(`${post.description.slice(0, MAX_LENGTH)}...`)
                : renderDescription(post.description)}
            </div>

            {/* Botón para ver más detalles */}
            <Link href={`/blog/${normalizeName(post.name)}`} className="readMoreBtn" >Leer más</Link>
            {/* Mostrar cita si existe */}
            {post.quote && <div className={styles.quote}>&quot;{post.quote}&quot;</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default UltimasNoticias;
