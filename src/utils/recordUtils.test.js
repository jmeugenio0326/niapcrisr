import { describe, expect, it } from "vitest";
import { formatRecordId, nextSeries, validateRecordFields } from "./recordUtils";

describe("record identifiers", () => {
  it("formats PC identifiers with the requested IAR prefix", () => {
    expect(formatRecordId("PC", 10, 4, 2)).toBe("IAR: PC-10-4-2");
  });

  it("formats RIS identifiers without the PC prefix", () => {
    expect(formatRecordId("RIS", 10, 4, 2)).toBe("RIS: 10-4-2");
  });

  it("increments only records on the same month and day", () => {
    expect(nextSeries([{ month: 10, day: 4, series: 1 }, { month: 10, day: 4, series: 3 }, { month: 9, day: 4, series: 9 }], 10, 4)).toBe(4);
  });

  it("rejects impossible date fields", () => {
    expect(validateRecordFields(13, 1, 1)).toBe("Month must be between 1 and 12.");
  });
});
