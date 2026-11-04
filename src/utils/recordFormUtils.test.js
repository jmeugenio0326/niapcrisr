import { describe, expect, it } from "vitest";
import { nextDatabaseSeries, resetRecordForm } from "./recordFormUtils";

describe("record form defaults", () => {
  it("uses the next highest series in the database", () => {
    expect(nextDatabaseSeries([{ series: 1 }, { series: 2 }, { series: 1 }])).toBe(3);
    expect(nextDatabaseSeries([])).toBe(1);
  });

  it("uses the highest stored series even when records are not in series order", () => {
    expect(nextDatabaseSeries([{ month: 12, day: 1, series: 7 }, { month: 1, day: 1, series: 2 }, { month: 5, day: 2, series: 4 }])).toBe(8);
  });

  it("clears month and day while keeping the next sequence", () => {
    expect(resetRecordForm(4)).toEqual({ month: "", day: "", series: "4" });
  });
});
