export interface Dot {
  id: number;
  x: number;
  y: number;
  number: number;
}

export interface Settings {
  dotRadius: number;
  fontSize: number;
  fontFamily: string;
  lineWidth: number;
  dotColor: string;
  lineColor: string;
  numberColor: string;
  imageOpacity: number;
  numberPlacement: "center" | "outside";
  numberDistance: number;
}

export const DEFAULT_SETTINGS: Settings = {
  dotRadius: 12,
  fontSize: 11,
  fontFamily: "Arial",
  lineWidth: 2,
  dotColor: "#ffffff",
  lineColor: "#FF4800",
  numberColor: "#000000",
  imageOpacity: 0.5,
  numberPlacement: "center",
  numberDistance: 8,
};

export const FONT_OPTIONS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
];

export type NumberAnchor = "middle" | "start" | "end";
export type NumberBaseline = "middle" | "auto" | "hanging";

export function computeNumberPosition(
  dot: Dot,
  allDots: Dot[],
  settings: Settings
): { x: number; y: number; anchor: NumberAnchor; baseline: NumberBaseline } {
  if (settings.numberPlacement === "center") {
    return { x: dot.x, y: dot.y, anchor: "middle", baseline: "middle" };
  }

  if (allDots.length < 2) {
    return { x: dot.x, y: dot.y, anchor: "middle", baseline: "middle" };
  }

  // Compute centroid of all dots
  const cx = allDots.reduce((s, d) => s + d.x, 0) / allDots.length;
  const cy = allDots.reduce((s, d) => s + d.y, 0) / allDots.length;

  // Direction from centroid toward dot (outward)
  let dx = dot.x - cx;
  let dy = dot.y - cy;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len < 0.5) {
    // Dot is at centroid — use path tangent perpendicular instead
    const idx = allDots.indexOf(dot);
    const prev = allDots[(idx - 1 + allDots.length) % allDots.length];
    const next = allDots[(idx + 1) % allDots.length];
    dx = -(next.y - prev.y);
    dy = next.x - prev.x;
    const tl = Math.sqrt(dx * dx + dy * dy);
    if (tl > 0.5) { dx /= tl; dy /= tl; } else { dx = 0; dy = -1; }
  } else {
    dx /= len;
    dy /= len;
  }

  const dist = settings.dotRadius + settings.numberDistance;
  const nx = dot.x + dx * dist;
  const ny = dot.y + dy * dist;

  // text-anchor based on direction
  const anchor = dx < -0.3 ? "end" : dx > 0.3 ? "start" : "middle";
  const baseline = dy < -0.3 ? "auto" : dy > 0.3 ? "hanging" : "middle";

  return { x: nx, y: ny, anchor, baseline };
}
