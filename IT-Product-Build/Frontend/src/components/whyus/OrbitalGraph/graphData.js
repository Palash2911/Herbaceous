export const CENTER_ID = "center";

const TONES = ["teal", "accent", "coral", "teal", "amber", "amber"];

export function buildNodes(stats = []) {
  const center = {
    id: CENTER_ID,
    label: "Women in STEM evidence",
    detail: "Qualification, workforce and movement indicators.",
    value: 0,
    suffix: "",
    display: "",
    source: "",
    tone: "accent",
    isCenter: true,
    radius: 34,
    orbit: 0,
    x: 0,
    y: 0,
    hover: 0,
  };

  const satellites = stats.map((stat, index) => {
    const value = Number(stat.value);
    const suffix = stat.displaySuffix ?? "";
    const ring = index % 3;
    const orbit = 0.42 + ring * 0.17;
    const angle = (index / stats.length) * Math.PI * 2 + ring * 0.5;

    return {
      id: stat.key ?? stat.id,
      label: stat.label,
      detail: stat.detail ?? "",
      value,
      suffix,
      display: `${value}${suffix}`,
      source: stat.sourceLabel ?? "PipelineStatistic API",
      tone: TONES[index % TONES.length],
      isCenter: false,
      radius: 15 + (Math.min(Math.abs(value), 100) / 100) * 13,
      orbit,
      x: Math.cos(angle) * orbit * 300,
      y: Math.sin(angle) * orbit * 300,
      hover: 0,
    };
  });

  return [center, ...satellites];
}

export function buildLinks(nodes) {
  return nodes
    .filter((node) => !node.isCenter)
    .map((node) => ({
      source: CENTER_ID,
      target: node.id,
      strength: Math.max(0.18, Math.abs(node.value) / 100),
    }));
}