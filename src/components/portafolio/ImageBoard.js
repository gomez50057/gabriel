"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import styles from "./ImageBoard.module.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "image-board-v1";

const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480 };
const cols = { lg: 12, md: 10, sm: 6, xs: 4 };

// Fijos (sin UI)
const ROW_HEIGHT = 60;
const GAP = 12;
const CONTAINER_PADDING = 12;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const defaultItems = [
  { id: "1", src: "https://picsum.photos/id/1015/1200/800", title: "Imagen 1" },
  { id: "2", src: "https://picsum.photos/id/1025/1200/800", title: "Imagen 2" },
  { id: "3", src: "https://picsum.photos/id/1035/1200/800", title: "Imagen 3" },
];

const defaultLayouts = {
  lg: [
    { i: "1", x: 0, y: 0, w: 4, h: 5 },
    { i: "2", x: 4, y: 0, w: 5, h: 4 },
    { i: "3", x: 9, y: 0, w: 3, h: 6 },
  ],
  md: [
    { i: "1", x: 0, y: 0, w: 4, h: 5 },
    { i: "2", x: 4, y: 0, w: 4, h: 4 },
    { i: "3", x: 0, y: 5, w: 4, h: 5 },
  ],
  sm: [
    { i: "1", x: 0, y: 0, w: 3, h: 5 },
    { i: "2", x: 3, y: 0, w: 3, h: 4 },
    { i: "3", x: 0, y: 5, w: 6, h: 5 },
  ],
  xs: [
    { i: "1", x: 0, y: 0, w: 4, h: 5 },
    { i: "2", x: 0, y: 5, w: 4, h: 4 },
    { i: "3", x: 0, y: 9, w: 4, h: 6 },
  ],
};

function ensureLayoutsForItems(items, layouts, colsMap) {
  const nextLayouts = { ...layouts };

  Object.keys(colsMap).forEach((bp) => {
    const colCount = colsMap[bp];
    const arr = Array.isArray(nextLayouts[bp]) ? [...nextLayouts[bp]] : [];
    const existing = new Set(arr.map((l) => l.i));

    items.forEach((it) => {
      if (existing.has(it.id)) return;
      const w = clamp(Math.round(colCount / 3), 2, colCount);
      const h = 5;
      arr.push({ i: it.id, x: 0, y: Infinity, w, h });
      existing.add(it.id);
    });

    nextLayouts[bp] = arr;
  });

  const validIds = new Set(items.map((it) => it.id));
  Object.keys(colsMap).forEach((bp) => {
    nextLayouts[bp] = (nextLayouts[bp] || []).filter((l) => validIds.has(l.i));
  });

  return nextLayouts;
}

export default function ImageBoard() {
  const [items, setItems] = useState(defaultItems);
  const [layouts, setLayouts] = useState(defaultLayouts);

  const saveTimerRef = useRef(null);
  const scheduleSave = useCallback((nextState) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveState(nextState), 250);
  }, []);

  const persistAll = useCallback(
    (patch) => {
      const next = { items, layouts, ...patch };
      scheduleSave(next);
    },
    [items, layouts, scheduleSave]
  );

  useEffect(() => {
    const saved = loadState();
    if (!saved) return;

    const savedItems = Array.isArray(saved.items) ? saved.items : defaultItems;
    const savedLayouts = saved.layouts || defaultLayouts;

    setItems(savedItems);
    const fixed = ensureLayoutsForItems(savedItems, savedLayouts, cols);
    setLayouts(fixed);

    scheduleSave({ items: savedItems, layouts: fixed });
  }, [scheduleSave]);

  const onLayoutChange = useCallback(
    (_currentLayout, allLayouts) => {
      const fixed = ensureLayoutsForItems(items, allLayouts, cols);
      setLayouts(fixed);
      persistAll({ layouts: fixed });
    },
    [items, persistAll]
  );

  return (
    <section className={styles.wrap}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.title}>Tablero de Imágenes</h2>
          <p className={styles.subtitle}>Arrastra y redimensiona directamente.</p>
        </div>

        <div className={styles.toolbarRight}>
          <button
            className={styles.btnDanger}
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setItems(defaultItems);
              setLayouts(defaultLayouts);
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <div className={styles.board}>
        <ResponsiveGridLayout
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={ROW_HEIGHT}
          margin={[GAP, GAP]}
          containerPadding={[CONTAINER_PADDING, CONTAINER_PADDING]}
          isDraggable
          isResizable
          preventCollision={false}
          compactType="vertical"
          onLayoutChange={onLayoutChange}
        >
          {items.map((it) => (
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

              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </section>
  );
}
