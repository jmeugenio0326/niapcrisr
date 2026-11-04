export function applyPasscodeInput(currentDigits, index, value) {
  const digits = [...currentDigits];
  const inputDigits = String(value).replace(/\D/g, "").slice(0, digits.length - index);
  inputDigits.split("").forEach((digit, offset) => {
    digits[index + offset] = digit;
  });
  return digits;
}

export function previousPasscodeIndex(index, currentValue) {
  return !currentValue && index > 0 ? index - 1 : index;
}
