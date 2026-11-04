import { describe, expect, it } from "vitest";
import { buildRecordExportHtml, exportIdentifier } from "./exportUtils";

describe("record export format", () => {
  it("exports a PC identifier without the display prefix", () => {
    expect(exportIdentifier("PC", { month: 10, day: 4, series: 1 })).toBe("PC-10-4-1");
  });

  it("exports a vertical person table with a type row", () => {
    const html = buildRecordExportHtml("Maria Santos", "PC", [
      { month: 10, day: 4, series: 1 },
      { month: 10, day: 4, series: 2 }
    ]);
    expect(html).toContain("<td>Maria Santos</td>");
    expect(html).toContain("<td>IAR</td>");
    expect(html).toContain("<td>PC-10-4-1</td>");
    expect(html).toContain("<td>PC-10-4-2</td>");
    expect(html.indexOf("PC-10-4-1")).toBeLessThan(html.indexOf("PC-10-4-2"));
  });
});
