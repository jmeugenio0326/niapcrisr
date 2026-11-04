export function formatRecordId(type, month, day, series) {
  const prefix = type === "PC" ? "IAR: PC-" : "RIS: ";
  return `${prefix}${month}-${day}-${series}`;
}

export function normalizeSeries(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function nextSeries(records, month, day) {
  const sameDate = records
    .filter((record) => String(record.month) === String(month) && String(record.day) === String(day))
    .map((record) => normalizeSeries(record.series));
  return sameDate.length ? Math.max(...sameDate) + 1 : 1;
}

export function validateRecordFields(month, day, series) {
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  const seriesNumber = Number(series);
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) return "Month must be between 1 and 12.";
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31) return "Day must be between 1 and 31.";
  if (!Number.isInteger(seriesNumber) || seriesNumber < 1) return "Series must be a positive number.";
  return "";
}
