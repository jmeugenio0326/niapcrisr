import { describe, expect, it } from "vitest";
import { oppositeMode } from "./modeUtils";

describe("record mode switch", () => {
  it("switches PC to RIS and RIS to PC", () => {
    expect(oppositeMode("PC")).toBe("RIS");
    expect(oppositeMode("RIS")).toBe("PC");
  });
});
