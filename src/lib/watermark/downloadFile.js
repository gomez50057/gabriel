export function downloadFile(blobUrl, fileName) {
  if (!blobUrl || !fileName) {
    return;
  }

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function downloadBlob(blob, fileName) {
  if (!blob || !fileName) {
    return;
  }

  const blobUrl = URL.createObjectURL(blob);
  downloadFile(blobUrl, fileName);

  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}
