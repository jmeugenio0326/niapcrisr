export function sortRecordsByDate(records) {
  return [...records].sort((a, b) => (
    Number(a.month) - Number(b.month)
    || Number(a.day) - Number(b.day)
    || Number(a.series) - Number(b.series)
  ));
}
