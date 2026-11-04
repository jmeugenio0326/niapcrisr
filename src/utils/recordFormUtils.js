export function nextDatabaseSeries(records) {
  const highestSeries = records.reduce((highest, record) => {
    const series = Number(record.series);
    return Number.isFinite(series) && series > highest ? series : highest;
  }, 0);
  return highestSeries + 1;
}

export function resetRecordForm(nextSeries) {
  return { month: "", day: "", series: String(nextSeries) };
}
