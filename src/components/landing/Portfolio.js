import React from "react";
import styles from "@/styles/Portfolio.module.css";
import { EyeIcon, ExternalLinkIcon } from "@/shared/icons/PortfolioIcons";
import { portfolioRecentProjects } from "@/utils/portafolio/portfolioBoardData";

const ICON = {
  eye: EyeIcon,
  external: ExternalLinkIcon,
};

const normalizeIconKey = (icon) => {
  if (!icon) return "external";
  if (icon === "eye" || icon === "external") return icon;

  if (typeof icon === "string") {
    const s = icon.toLowerCase();
    if (s.includes("fa-eye")) return "eye";
    if (s.includes("fa-up-right-from-square") || s.includes("fa-external-link")) return "external";
    if (s.includes("fa-github") || s.includes("github")) return "external"; // compat (sin ícono Git)
  }
  return "external";
};

const LinkIcon = React.memo(function LinkIcon({ icon }) {
  const key = normalizeIconKey(icon);
  const IconCmp = ICON[key] || ICON.external;
  return <IconCmp />;
});

const safeHref = (href) => (typeof href === "string" && href.trim() ? href.trim() : "#");

const isExternalHref = (href) => {
  if (!href) return false;
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
};

const getAnchorAttrs = (href) => (isExternalHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});

function Portfolio({
  title = "Portafolio",
  projects = portfolioRecentProjects,
  moreHref = "/portfolio",
  moreText = "Ver más",
}) {
  const list = Array.isArray(projects) ? projects : [];

  return (
    <section className={styles.portfolio} aria-label={title}>
      <header className={styles.titleSection}>
        <h2>Recientemente he trabajado en…</h2>
        <p>Lo último que he llevado de la idea a la realidad.</p>
      </header>

      <div className={styles.row}>
        {list.map((p, i) => {
          const id = p?.id ?? `${p?.title ?? "project"}-${i}`;
          const projectTitle = p?.title ?? "Proyecto";
          const stack = p?.stack ?? "";
          const img = p?.image ?? "";
          const links = Array.isArray(p?.links) ? p.links : [];

          return (
            <article key={id} className={styles.project}>
              <div className={styles.member}>
                <div className={styles.imageWrap}>
                  {img ? (
                    <img
                      src={img}
                      alt={projectTitle}
                      className={styles.image}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>

                <div className={styles.memberInfo}>
                  <div className={styles.memberInfoContent}>
                    {projectTitle}
                    {stack ? <span>{stack}</span> : null}
                  </div>

                  {links.length ? (
                    <div className={styles.social}>
                      {links.map((l, idx) => {
                        const href = safeHref(l?.href);
                        const label = l?.label ?? "Ver";
                        return (
                          <a
                            key={`${id}-link-${idx}`}
                            href={href}
                            {...getAnchorAttrs(href)}
                            aria-label={label}
                            title={label}
                          >
                            <LinkIcon icon={l?.icon} />
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.moreWrapper}>
        <a href={moreHref} className={styles.moreLink}>
          {moreText}
        </a>
      </div>
    </section>
  );
}

export default React.memo(Portfolio);
