export function isHttpsUrl(value, maxLength = 500) {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    return false;
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isOneOf(value, list) {
  return list.includes(value);
}

export function isLengthBetween(str, min, max) {
  return typeof str === "string" && str.length >= min && str.length <= max;
}

export function isPositiveInt(n, max = Infinity) {
  return Number.isInteger(n) && n > 0 && n <= max;
}

export function isValidDisplayName(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return (
    trimmed.length >= 2 &&
    trimmed.length <= 40 &&
    !trimmed.includes("@") &&
    /^[A-Za-z0-9 '-]+$/.test(trimmed)
  );
}
