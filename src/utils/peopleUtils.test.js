import { describe, expect, it } from "vitest";
import { createPersonRecord, personDatabaseKey } from "./peopleUtils";

describe("directory people", () => {
  it("creates a name-only person record with the default PC and RIS sections", () => {
    expect(createPersonRecord("  Maria Santos  ")).toEqual({
      name: "Maria Santos",
      modules: { PC: true, RIS: true }
    });
  });

  it("creates a safe Realtime Database key from a name", () => {
    expect(personDatabaseKey("Maria Santos")).toBe("Maria_Santos");
  });
});
