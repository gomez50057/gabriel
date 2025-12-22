"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import styles from "./ImageBoard.module.css";
import { defaultItems, defaultLayouts } from "@/utils/portafolio/portfolioBoardData";
import { clearBoardState, loadBoardState, saveBoardState } from "@/utils/portafolio/imageBoardStorage";
import { ensureLayoutsForItems, mergeSavedIntoDefaults, pickViewLayouts } from "@/utils/portafolio/imageBoardLayout";

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "image-board-v2";
const LEGACY_KEYS = ["image-board-v1"];

const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480 };
const cols = { lg: 12, md: 10, sm: 6, xs: 4 };

const ROW_HEIGHT = 60;
const GAP = 12;
const CONTAINER_PADDING = 12;

function EyeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.2 12s3.6-7 9.8-7 9.8 7 9.8 7-3.6 7-9.8 7-9.8-7-9.8-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function ImageBoard() {
  const [items, setItems] = useState(defaultItems);
  const [layouts, setLayouts] = useState(() =>
    ensureLayoutsForItems(defaultItems, defaultLayouts, cols)
  );

  const [groupFilter, setGroupFilter] = useState("all");
  const [viewer, setViewer] = useState(null);

  // Refs para evitar closures viejas al guardar
  const itemsRef = useRef(items);
  const layoutsRef = useRef(layouts);
  useEffect(() => void (itemsRef.current = items), [items]);
  useEffect(() => void (layoutsRef.current = layouts), [layouts]);

  // Throttle simple de guardado
  const saveTimerRef = useRef(null);
  const scheduleSave = useCallback((patch = {}) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      const next = { items: itemsRef.current, layouts: layoutsRef.current, ...patch };
      saveBoardState(STORAGE_KEY, next);
    }, 250);
  }, []);

  useEffect(() => {
    // cleanup
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Carga estado (1 sola vez)
  useEffect(() => {
    const saved = loadBoardState(STORAGE_KEY, LEGACY_KEYS);

    const mergedItems = mergeSavedIntoDefaults(saved?.items, defaultItems);
    const baseLayouts = saved?.layouts || defaultLayouts;
    const fixedLayouts = ensureLayoutsForItems(mergedItems, baseLayouts, cols);

    setItems(mergedItems);
    setLayouts(fixedLayouts);

    // normaliza y persiste
    itemsRef.current = mergedItems;
    layoutsRef.current = fixedLayouts;
    saveBoardState(STORAGE_KEY, { items: mergedItems, layouts: fixedLayouts });
  }, []);

  const groups = useMemo(() => {
    const set = new Set(items.map((it) => it.group || "Sin grupo"));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const visibleItems = useMemo(() => {
    if (groupFilter === "all") return items;
    return items.filter((it) => (it.group || "Sin grupo") === groupFilter);
  }, [items, groupFilter]);

  const visibleIds = useMemo(() => new Set(visibleItems.map((it) => it.id)), [visibleItems]);

  const viewLayouts = useMemo(() => {
    if (groupFilter === "all") return layouts;
    return pickViewLayouts(layouts, cols, visibleIds);
  }, [layouts, groupFilter, visibleIds]);

  const isFiltered = groupFilter !== "all";

  const onLayoutChangeSafe = useCallback(
    (_current, allLayouts) => {
      if (isFiltered) return;

      const fixed = ensureLayoutsForItems(itemsRef.current, allLayouts, cols);
      setLayouts(fixed);
      layoutsRef.current = fixed;
      scheduleSave({ layouts: fixed });
    },
    [isFiltered, scheduleSave]
  );

  const closeViewer = useCallback(() => setViewer(null), []);

  useEffect(() => {
    if (!viewer) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeViewer();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [viewer, closeViewer]);

  const handleView = useCallback((it) => {
    const kind = it.kind || (it.href ? "link" : "image");

    if (kind === "link") {
      if (it.href) window.open(it.href, "_blank", "noopener,noreferrer");
      return;
    }

    setViewer({
      src: it.fullSrc || it.src,
      title: it.title || "Imagen",
      group: it.group || "Sin grupo",
    });
  }, []);

  const resetAll = useCallback(() => {
    clearBoardState(STORAGE_KEY, LEGACY_KEYS);

    setGroupFilter("all");

    const fixedLayouts = ensureLayoutsForItems(defaultItems, defaultLayouts, cols);
    setItems(defaultItems);
    setLayouts(fixedLayouts);

    itemsRef.current = defaultItems;
    layoutsRef.current = fixedLayouts;
    saveBoardState(STORAGE_KEY, { items: defaultItems, layouts: fixedLayouts });
  }, []);

  return (
    <section className={styles.wrap}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.title}>Tablero de Imágenes</h2>
          <p className={styles.subtitle}>Arrastra y redimensiona directamente.</p>
        </div>

        <div className={styles.toolbarRight}>
          <label className={styles.filterLabel}>
            <span className={styles.filterText}>Grupo</span>
            <select
              className={styles.select}
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>

          <button className={styles.btnDanger} onClick={resetAll}>
            Reset
          </button>
        </div>
      </header>

      <div className={styles.board}>
        <ResponsiveGridLayout
          layouts={viewLayouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={ROW_HEIGHT}
          margin={[GAP, GAP]}
          containerPadding={[CONTAINER_PADDING, CONTAINER_PADDING]}
          isDraggable={!isFiltered}
          isResizable={!isFiltered}
          preventCollision={false}
          compactType={isFiltered ? null : "vertical"}
          onLayoutChange={onLayoutChangeSafe}
          draggableCancel=".noDrag"
        >
          {visibleItems.map((it) => (
            <div key={it.id} className={styles.tile}>
              <div className={styles.tileInner}>
                <img
                  src={it.src}
                  alt={it.title || "Imagen"}
                  className={styles.img}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />

                <div className={styles.hoverOverlay}>
                  <div className={styles.hoverCenter}>
                    <div className={styles.hoverTitle}>{it.title || "Sin título"}</div>
                    <div className={styles.hoverGroup}>{it.group || "Sin grupo"}</div>

                    <button
                      type="button"
                      className={`${styles.eyeBtn} noDrag`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => handleView(it)}
                      title={it.kind === "link" ? "Abrir enlace" : "Ver imagen"}
                      aria-label={it.kind === "link" ? "Abrir enlace" : "Ver imagen"}
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {viewer && (
        <div className={styles.modalBackdrop} onMouseDown={closeViewer}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={closeViewer}
              aria-label="Cerrar"
              title="Cerrar"
            >
              ×
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{viewer.title}</div>
              <div className={styles.modalGroup}>{viewer.group}</div>
            </div>

            <img src={viewer.src} alt={viewer.title} className={styles.modalImg} />
          </div>
        </div>
      )}
    </section>
  );
}
