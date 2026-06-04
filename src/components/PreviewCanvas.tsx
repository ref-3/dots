import { Dot, Settings, computeNumberPosition } from "../types";

export function drawDotsAndLines(
  ctx: CanvasRenderingContext2D,
  dots: Dot[],
  settings: Settings,
  closed: boolean,
  scaleX: number,
  scaleY: number
) {
  const sc = Math.min(scaleX, scaleY);

  // Lines (only if lineWidth > 0)
  if (settings.lineWidth > 0 && dots.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = settings.lineColor;
    ctx.lineWidth = settings.lineWidth * sc;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(dots[0].x * scaleX, dots[0].y * scaleY);
    for (let i = 1; i < dots.length; i++) {
      ctx.lineTo(dots[i].x * scaleX, dots[i].y * scaleY);
    }
    if (closed) ctx.closePath();
    ctx.stroke();
  }

  const r = settings.dotRadius * sc;
  const fs = settings.fontSize * sc;

  for (const dot of dots) {
    const cx = dot.x * scaleX;
    const cy = dot.y * scaleY;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = settings.dotColor;
    ctx.fill();

    // FIXED: compute in original coordinate space, then scale the result
    const pos = computeNumberPosition(dot, dots, settings);
    const textX = pos.x * scaleX;
    const textY = pos.y * scaleY;

    ctx.font = `bold ${fs}px ${settings.fontFamily}`;
    ctx.fillStyle = settings.numberColor;
    ctx.textAlign = pos.anchor as CanvasTextAlign;
    // "auto" in SVG = "alphabetic" in canvas (baseline alignment)
    ctx.textBaseline = (pos.baseline === "auto" ? "alphabetic" : pos.baseline) as CanvasTextBaseline;
    ctx.fillText(String(dot.number), textX, textY);
  }
}

export function buildSVG(
  dots: Dot[],
  settings: Settings,
  closed: boolean,
  w: number,
  h: number,
  bgColor: string | null
): string {
  const lines: string[] = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`);

  if (bgColor) {
    lines.push(`  <rect width="${w}" height="${h}" fill="${bgColor}"/>`);
  }

  if (settings.lineWidth > 0 && dots.length > 1) {
    const d = dots.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + (closed ? " Z" : "");
    lines.push(
      `  <path d="${d}" stroke="${settings.lineColor}" stroke-width="${settings.lineWidth}" ` +
      `fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }

  for (const dot of dots) {
    lines.push(`  <circle cx="${dot.x}" cy="${dot.y}" r="${settings.dotRadius}" fill="${settings.dotColor}"/>`);
    const pos = computeNumberPosition(dot, dots, settings);
    const db = pos.baseline === "hanging" ? "hanging" : pos.baseline === "auto" ? "auto" : "middle";
    lines.push(
      `  <text x="${pos.x.toFixed(1)}" y="${pos.y.toFixed(1)}" ` +
      `text-anchor="${pos.anchor}" dominant-baseline="${db}" ` +
      `font-size="${settings.fontSize}" font-family="${settings.fontFamily}" font-weight="bold" fill="${settings.numberColor}">${dot.number}</text>`
    );
  }

  lines.push("</svg>");
  return lines.join("\n");
}
