import { describe, expect, it } from "vitest";
import { getRememberedUsername, rememberUsername } from "./sessionUtils";

function storage() {
  const values = {};
  return {
    getItem: (key) => values[key] || null,
    setItem: (key, value) => { values[key] = value; }
  };
}

describe("remembered login session", () => {
  it("stores and restores only the username for passcode-only re-entry", () => {
    const memory = storage();
    rememberUsername(" admin ", memory);
    expect(getRememberedUsername(memory)).toBe("admin");
  });
});
