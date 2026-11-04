function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function exportIdentifier(mode, record) {
  const prefix = mode === "PC" ? "PC-" : "";
  return `${prefix}${record.month}-${record.day}-${record.series}`;
}

export function buildRecordExportHtml(personName, mode, records) {
  const label = mode === "PC" ? "IAR" : "RIS";
  const rows = records
    .map((record) => `<tr><td>${escapeHtml(exportIdentifier(mode, record))}</td></tr>`)
    .join("");
  return `<table><tr><td>${escapeHtml(personName)}</td></tr><tr><td>${label}</td></tr>${rows}</table>`;
}
