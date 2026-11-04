export function modeLabel(mode) {
  return mode === "PC"
    ? { short: "PC", title: "PETTY CASH" }
    : { short: "RIS", title: "REQUISITION AND ISSUE SLIP" };
}
