import { describe, expect, it } from "vitest";
import { sortRecordsByDate } from "./recordSortUtils";

describe("record database sorting", () => {
  it("sorts records by month, day, then series", () => {
    const records = [
      { identifier: "late", month: 12, day: 1, series: 1 },
      { identifier: "second", month: 2, day: 10, series: 2 },
      { identifier: "first", month: 2, day: 10, series: 1 },
      { identifier: "early", month: 1, day: 31, series: 1 }
    ];

    expect(sortRecordsByDate(records).map((record) => record.identifier)).toEqual([
      "early",
      "first",
      "second",
      "late"
    ]);
  });
});
