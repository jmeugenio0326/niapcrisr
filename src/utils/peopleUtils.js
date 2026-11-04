export function personDatabaseKey(name) {
  return String(name).trim().replace(/[.#$[\]/]/g, "_").replace(/\s+/g, "_");
}

export function createPersonRecord(name) {
  return {
    name: String(name).trim(),
    modules: { PC: true, RIS: true }
  };
}
