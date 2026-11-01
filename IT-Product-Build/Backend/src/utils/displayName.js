import crypto from "node:crypto";

const ADJECTIVES = [
  "Quiet",
  "Steady",
  "Bright",
  "Calm",
  "Bold",
  "Gentle",
  "Swift",
  "Clear",
  "Kind",
  "Keen",
  "Warm",
  "Sharp",
  "Even",
  "Sound",
  "Wise",
];

const NOUNS = [
  "Falcon",
  "Comet",
  "River",
  "Cedar",
  "Harbor",
  "Meadow",
  "Summit",
  "Lantern",
  "Compass",
  "Orbit",
  "Willow",
  "Ridge",
  "Beacon",
  "Current",
  "Maple",
];

function pick(list) {
  return list[crypto.randomInt(list.length)];
}

export function generateDisplayName() {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}
