export const rememberedUsernameKey = "pcrsir-remembered-username";

export function getRememberedUsername(storage = window.localStorage) {
  return storage.getItem(rememberedUsernameKey) || "";
}

export function rememberUsername(username, storage = window.localStorage) {
  const normalized = String(username || "").trim();
  if (normalized) storage.setItem(rememberedUsernameKey, normalized);
  return normalized;
}
