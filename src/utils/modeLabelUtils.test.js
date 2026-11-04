import { describe, expect, it } from "vitest";
import { modeLabel } from "./modeLabelUtils";

describe("mode labels", () => {
  it("provides clear labels for the two record systems", () => {
    expect(modeLabel("PC")).toEqual({ short: "PC", title: "PETTY CASH" });
    expect(modeLabel("RIS")).toEqual({ short: "RIS", title: "REQUISITION AND ISSUE SLIP" });
  });
});
