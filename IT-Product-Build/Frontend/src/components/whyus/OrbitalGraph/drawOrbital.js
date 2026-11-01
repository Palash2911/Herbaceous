import { CENTER_ID } from "./graphData";

function toneColor(tone, colors) {
  return tone === "coral"
    ? colors.coral
    : tone === "teal"
      ? colors.teal
      : tone === "amber"
        ? colors.amber
        : colors.accent;
}

function withAlpha(ctx, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.restore();
  return color;
}

function drawGlow(ctx, x, y, radius, color, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const wide = ctx.createRadialGradient(x, y, 0, x, y, radius * 4.2);
  wide.addColorStop(0, color);
  wide.addColorStop(0.25, color);
  wide.addColorStop(1, "transparent");
  ctx.globalAlpha = 0.16 * intensity;
  ctx.fillStyle = wide;
  ctx.beginPath();
  ctx.arc(x, y, radius * 4.2, 0, Math.PI * 2);
  ctx.fill();

  const tight = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.9);
  tight.addColorStop(0, color);
  tight.addColorStop(0.55, color);
  tight.addColorStop(1, "transparent");
  ctx.globalAlpha = 0.42 * intensity;
  ctx.fillStyle = tight;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawOrbital(ctx, size, nodes, links, colors, state) {
  const { width, height } = size;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const center = byId.get(CENTER_ID);
  const progress = Math.max(0, Math.min(1, state.progress));

  ctx.save();
  ctx.strokeStyle = colors.muted;
  ctx.globalAlpha = 0.12 * progress;
  ctx.lineWidth = 1;
  const half = Math.min(width, height) / 2;
  [0.42, 0.59, 0.76].forEach((orbit) => {
    ctx.beginPath();
    ctx.arc(0, 0, orbit * half, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();

  links.forEach((link) => {
    const target = byId.get(link.target);
    if (!target) return;
    const color = toneColor(target.tone, colors);
    const endX = center.x + (target.x - center.x) * progress;
    const endY = center.y + (target.y - center.y) * progress;

    const gradient = ctx.createLinearGradient(
      center.x,
      center.y,
      target.x,
      target.y,
    );
    gradient.addColorStop(0, colors.accent);
    gradient.addColorStop(1, color);

    ctx.save();
    ctx.globalAlpha = (0.18 + link.strength * 0.4) * (0.5 + target.hover * 0.5);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1 + target.hover * 1.4;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  });

  nodes.forEach((node) => {
    if (node.isCenter) return;
    const color = toneColor(node.tone, colors);
    const radius =
      node.radius * (1 + node.hover * 0.22) * (0.3 + progress * 0.7);
    drawGlow(ctx, node.x, node.y, radius, color, 0.75 + node.hover * 1.1);

    ctx.save();
    ctx.globalAlpha = progress;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.7 * progress;
    ctx.strokeStyle = colors.bg;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    if (radius > 15) {
      ctx.save();
      ctx.globalAlpha = progress;
      ctx.fillStyle = colors.bg;
      ctx.font = `600 ${Math.round(radius * 0.62)}px "Roboto Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.display, node.x, node.y);
      ctx.restore();
    }
  });

  const pulse = 1 + Math.sin(state.time / 900) * 0.05;
  const centerRadius = center.radius * pulse * (0.4 + progress * 0.6);
  drawGlow(
    ctx,
    center.x,
    center.y,
    centerRadius,
    colors.accent,
    1.5 + center.hover * 0.8,
  );

  ctx.save();
  const core = ctx.createRadialGradient(
    center.x,
    center.y,
    0,
    center.x,
    center.y,
    centerRadius,
  );
  core.addColorStop(0, colors.accent);
  core.addColorStop(1, colors.accent);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(center.x, center.y, centerRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.bg;
  ctx.font = `600 10px "Roboto Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("LEAKY", center.x, center.y - 6);
  ctx.fillText("PIPELINE", center.x, center.y + 6);
  ctx.restore();

  withAlpha(ctx, colors.text, 1);
  ctx.restore();
}
