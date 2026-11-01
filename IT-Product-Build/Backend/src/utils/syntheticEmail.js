import crypto from "node:crypto";

const DOMAIN = "herbaceous.internal";

export function generateSyntheticEmail(role) {
  const digits = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  return `${role.toLowerCase()}${digits}@${DOMAIN}`;
}
