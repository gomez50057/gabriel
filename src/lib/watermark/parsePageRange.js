function parsePositiveInteger(value, fieldName) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`${fieldName} no es valida.`);
  }

  return page;
}

function assertPageExists(page, totalPages) {
  if (page > totalPages) {
    throw new Error("El rango de paginas no es valido.");
  }
}

function normalizePages(pages, totalPages) {
  const uniquePages = Array.from(new Set(pages));

  uniquePages.forEach((page) => {
    assertPageExists(page, totalPages);
  });

  return uniquePages.sort((a, b) => a - b).map((page) => page - 1);
}

export function parsePageSelection(config, totalPages) {
  if (!Number.isInteger(totalPages) || totalPages < 1) {
    throw new Error("No fue posible leer las paginas del PDF.");
  }

  if (config.applyMode === "all") {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  if (config.applyMode === "single") {
    const page = parsePositiveInteger(config.pageNumber, "La pagina");
    return normalizePages([page], totalPages);
  }

  if (config.applyMode === "range") {
    const range = String(config.pageRange || "").trim();

    if (!/^\d+\s*-\s*\d+$/.test(range)) {
      throw new Error("El rango de paginas no es valido.");
    }

    const [start, end] = range.split("-").map((part) => parsePositiveInteger(part.trim(), "La pagina"));

    if (start > end) {
      throw new Error("El rango de paginas no es valido.");
    }

    const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
    return normalizePages(pages, totalPages);
  }

  if (config.applyMode === "specific") {
    const specificPages = String(config.specificPages || "").trim();

    if (!/^\d+(\s*,\s*\d+)*$/.test(specificPages)) {
      throw new Error("El rango de paginas no es valido.");
    }

    const pages = specificPages
      .split(",")
      .map((page) => parsePositiveInteger(page.trim(), "La pagina"));

    return normalizePages(pages, totalPages);
  }

  throw new Error("Selecciona un modo de aplicacion valido.");
}

export function parsePageRange(config, totalPages) {
  return parsePageSelection(config, totalPages);
}
