import { describe, expect, it } from "vitest";
import { applyPasscodeInput, previousPasscodeIndex } from "./passcodeUtils";

describe("passcode input behavior", () => {
  it("fills consecutive boxes when a complete code is pasted", () => {
    expect(applyPasscodeInput(["", "", "", ""], 0, "1234")).toEqual(["1", "2", "3", "4"]);
  });

  it("ignores non-numeric characters while preserving the remaining boxes", () => {
    expect(applyPasscodeInput(["1", "", "", ""], 1, "a2b")).toEqual(["1", "2", "", ""]);
  });

  it("moves back only when the current passcode box is empty", () => {
    expect(previousPasscodeIndex(2, "")).toBe(1);
    expect(previousPasscodeIndex(2, "3")).toBe(2);
  });
});
