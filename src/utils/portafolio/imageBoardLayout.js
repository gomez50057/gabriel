export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const rectsOverlap = (a, b) =>
  !(
    a.x + a.w <= b.x ||
    a.x >= b.x + b.w ||
    a.y + a.h <= b.y ||
    a.y >= b.y + b.h
  );  

const findFirstFreeSpot = (layout, colsCount, w, h) => {
  const maxY = layout.reduce((m, it) => Math.max(m, it.y + it.h), 0);

  for (let y = 0; y <= maxY + 50; y += 1) {
    for (let x = 0; x <= colsCount - w; x += 1) {
      const candidate = { x, y, w, h };
      const collides = layout.some((it) => rectsOverlap(candidate, it));
      if (!collides) return { x, y };
    }
  }

  return { x: 0, y: maxY + 1 };
};

export const mergeSavedIntoDefaults = (savedItems, defaults) => {
  const map = new Map((Array.isArray(savedItems) ? savedItems : []).map((it) => [it.id, it]));
  return defaults.map((d) => {
    const s = map.get(d.id);
    if (!s) return d;
    // default manda (title/group/kind correctos)
    return { ...s, ...d };
  });
};

export const ensureLayoutsForItems = (items, layouts, colsMap) => {
  const nextLayouts = { ...layouts };

  Object.keys(colsMap).forEach((bp) => {
    const colCount = colsMap[bp];
    const arr = Array.isArray(nextLayouts[bp]) ? [...nextLayouts[bp]] : [];
    const existing = new Set(arr.map((l) => l.i));

    items.forEach((it) => {
      if (existing.has(it.id)) return;

      const w = clamp(Math.round(colCount / 3), 2, colCount);
      const h = 5;

      const pos = findFirstFreeSpot(arr, colCount, w, h);
      arr.push({ i: it.id, x: pos.x, y: pos.y, w, h });
      existing.add(it.id);
    });

    nextLayouts[bp] = arr;
  });

  const validIds = new Set(items.map((it) => it.id));
  Object.keys(colsMap).forEach((bp) => {
    nextLayouts[bp] = (nextLayouts[bp] || []).filter((l) => validIds.has(l.i));
  });

  return nextLayouts;
};

export const pickViewLayouts = (layouts, colsMap, visibleIds) => {
  const out = {};
  for (const bp of Object.keys(colsMap)) {
    out[bp] = (layouts[bp] || []).filter((l) => visibleIds.has(l.i));
  }
  return out;
};
