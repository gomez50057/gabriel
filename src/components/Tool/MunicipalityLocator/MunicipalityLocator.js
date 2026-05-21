"use client";

import { useMemo, useState } from "react";
import styles from "./MunicipalityLocator.module.css";
import { REGIONALIZACION_HIDALGO } from "./regionalizacionHidalgo";

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchValues(item) {
  return [
    item.municipio,
    item.region,
    item.macrorregion,
    item.microrregion,
    ...(item.aliases || []),
  ].map(normalizeText);
}

function findExactMunicipality(query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return null;

  return REGIONALIZACION_HIDALGO.find((item) =>
    [item.municipio, ...(item.aliases || [])]
      .map(normalizeText)
      .includes(normalizedQuery)
  );
}

function sortMunicipalities(items) {
  return [...items].sort((a, b) =>
    a.municipio.localeCompare(b.municipio, "es", {
      sensitivity: "base",
    })
  );
}

function getRelatedMunicipalities(selectedMunicipality, field) {
  if (!selectedMunicipality) return [];

  return sortMunicipalities(
    REGIONALIZACION_HIDALGO.filter(
      (item) =>
        item[field] === selectedMunicipality[field] &&
        item.municipio !== selectedMunicipality.municipio
    )
  );
}

function RegionPath({ item }) {
  return (
    <small className={styles.regionPath}>
      <span>{item.region}</span>
      <span>{item.macrorregion}</span>
      <span>{item.microrregion}</span>
    </small>
  );
}

function RelatedDropdown({ title, items, onSelect }) {
  return (
    <details className={styles.dropdownBox}>
      <summary className={styles.dropdownSummary}>{title}</summary>

      {items.length > 0 ? (
        <div className={styles.relatedList}>
          {items.map((item) => (
            <button
              key={item.municipio}
              type="button"
              className={styles.relatedItem}
              onClick={() => onSelect(item.municipio)}
            >
              <span>{item.municipio}</span>
              <RegionPath item={item} />
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.emptyText}>
          No hay otros municipios registrados en este grupo.
        </p>
      )}
    </details>
  );
}

export default function MunicipalityLocator({ initialMunicipio = "" }) {
  const [query, setQuery] = useState(initialMunicipio);

  const normalizedQuery = useMemo(() => normalizeText(query), [query]);

  const matches = useMemo(() => {
    if (!normalizedQuery) return [];

    return REGIONALIZACION_HIDALGO.filter((item) =>
      getSearchValues(item).some((value) => value.includes(normalizedQuery))
    ).slice(0, 12);
  }, [normalizedQuery]);

  const selectedMunicipality = useMemo(() => {
    const exactMatch = findExactMunicipality(query);

    if (exactMatch) return exactMatch;
    if (matches.length === 1) return matches[0];

    return null;
  }, [query, matches]);

  const relatedByRegion = useMemo(
    () => getRelatedMunicipalities(selectedMunicipality, "region"),
    [selectedMunicipality]
  );

  const relatedByMacrorregion = useMemo(
    () => getRelatedMunicipalities(selectedMunicipality, "macrorregion"),
    [selectedMunicipality]
  );

  const relatedByMicrorregion = useMemo(
    () => getRelatedMunicipalities(selectedMunicipality, "microrregion"),
    [selectedMunicipality]
  );

  const clearSearch = () => {
    setQuery("");
  };

  const selectMunicipality = (municipio) => {
    setQuery(municipio);
  };

  return (
    <section className={styles.container} aria-labelledby="locator-title">
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>
            Regionalización del Estado de Hidalgo
          </span>

          <h2 id="locator-title" className={styles.title}>
            Consulta a dónde pertenece un municipio
          </h2>

          <p className={styles.description}>
            Busca un municipio para identificar su región, macrorregión y
            microrregión.
          </p>
        </div>

        <div className={styles.counter}>
          <strong>{REGIONALIZACION_HIDALGO.length}</strong>
          <span>municipios cargados</span>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.searchCard}>
          <label className={styles.label} htmlFor="municipio-search">
            Municipio
          </label>

          <div className={styles.searchBox}>
            <input
              id="municipio-search"
              className={styles.input}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej. Pachuca, Tula, Zimapán..."
              autoComplete="off"
            />

            {query.length > 0 && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>

          <div className={styles.suggestions} aria-label="Sugerencias">
            {normalizedQuery && matches.length > 0 ? (
              matches.map((item) => {
                const isActive =
                  selectedMunicipality?.municipio === item.municipio;

                return (
                  <button
                    key={item.municipio}
                    type="button"
                    className={`${styles.suggestion} ${
                      isActive ? styles.activeSuggestion : ""
                    }`}
                    onClick={() => selectMunicipality(item.municipio)}
                  >
                    <span className={styles.suggestionName}>
                      {item.municipio}
                    </span>

                    <RegionPath item={item} />
                  </button>
                );
              })
            ) : normalizedQuery ? (
              <p className={styles.emptyText}>
                No se encontró coincidencia. Revisa acentos o escribe otro
                municipio.
              </p>
            ) : (
              <p className={styles.emptyText}>
                Escribe el nombre de un municipio para iniciar la búsqueda.
              </p>
            )}
          </div>
        </aside>

        <div className={styles.resultCard}>
          {selectedMunicipality ? (
            <>
              <div className={styles.resultHeader}>
                <span className={styles.resultLabel}>
                  Municipio seleccionado
                </span>

                <h3>{selectedMunicipality.municipio}</h3>
              </div>

              <div className={styles.resultGrid}>
                <article className={styles.resultItem}>
                  <span>Región</span>
                  <strong>{selectedMunicipality.region}</strong>
                </article>

                <article className={styles.resultItem}>
                  <span>Macrorregión</span>
                  <strong>{selectedMunicipality.macrorregion}</strong>
                </article>

                <article className={styles.resultItem}>
                  <span>Microrregión</span>
                  <strong>{selectedMunicipality.microrregion}</strong>
                </article>
              </div>


              <div className={styles.dropdownStack}>
                <RelatedDropdown
                  title="Municipios en la misma región"
                  items={relatedByRegion}
                  onSelect={selectMunicipality}
                />

                <RelatedDropdown
                  title="Municipios en la misma macrorregión"
                  items={relatedByMacrorregion}
                  onSelect={selectMunicipality}
                />

                <RelatedDropdown
                  title="Municipios en la misma microrregión"
                  items={relatedByMicrorregion}
                  onSelect={selectMunicipality}
                />
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>⌕</span>

              <h3>Selecciona un municipio</h3>

              <p>
                Usa el buscador o las sugerencias para ver su región,
                macrorregión y microrregión.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}