import * as XLSX from "xlsx";

const TEMPLATE_ROWS = [
  {
    title: "Sitio web principal",
    type: "url",
    value: "https://ejemplo.com",
    fileName: "sitio-web-principal",
  },
  {
    title: "WhatsApp ventas",
    type: "whatsapp",
    value: "https://wa.me/5217710000000",
    fileName: "whatsapp-ventas",
  },
  {
    title: "Correo de contacto",
    type: "email",
    value: "contacto@ejemplo.com",
    fileName: "correo-contacto",
  },
];

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getCsvContent(rows) {
  const header = ["title", "type", "value", "fileName"];
  const escapeValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const dataRows = rows.map((row) =>
    [row.title, row.type, row.value, row.fileName].map(escapeValue).join(",")
  );

  return [header.join(","), ...dataRows].join("\n");
}

function downloadCsvTemplate() {
  const content = getCsvContent(TEMPLATE_ROWS);
  const blob = new Blob([content], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, "plantilla-qr-ejemplo.csv");
}

function downloadJsonTemplate() {
  const blob = new Blob([JSON.stringify(TEMPLATE_ROWS, null, 2)], {
    type: "application/json;charset=utf-8;",
  });

  downloadBlob(blob, "plantilla-qr-ejemplo.json");
}

function downloadExcelTemplate() {
  const worksheet = XLSX.utils.json_to_sheet(TEMPLATE_ROWS);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "QR");
  XLSX.writeFile(workbook, "plantilla-qr-ejemplo.xlsx");
}

export function downloadQrTemplate(mode) {
  if (mode === "csv") {
    downloadCsvTemplate();
    return;
  }

  if (mode === "json") {
    downloadJsonTemplate();
    return;
  }

  if (mode === "excel") {
    downloadExcelTemplate();
  }
}
