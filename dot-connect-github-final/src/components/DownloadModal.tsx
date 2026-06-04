import React, { useState } from "react";
import { Dot, Settings } from "../types";
import { drawDotsAndLines, buildSVG } from "./PreviewCanvas";
import { computeNumberPosition } from "../types";

interface DownloadModalProps {
  dots: Dot[];
  settings: Settings;
  closed: boolean;
  imageEl: HTMLImageElement | null;
  imgWidth: number;
  imgHeight: number;
  onClose: () => void;
}

function renderToCanvas(
  imgEl: HTMLImageElement | null,
  dots: Dot[],
  settings: Settings,
  closed: boolean,
  w: number,
  h: number,
  mode: "full" | "dotslines" | "dotsonly",
  transparent: boolean
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  if (transparent) {
    ctx.clearRect(0, 0, w, h);
  } else {
    ctx.fillStyle = mode === "full" ? "#ffffff" : "#000000";
    ctx.fillRect(0, 0, w, h);
  }

  if (mode === "full" && imgEl) {
    ctx.save();
    ctx.globalAlpha = settings.imageOpacity;
    ctx.drawImage(imgEl, 0, 0, w, h);
    ctx.restore();
  }

  if (mode === "dotsonly") {
    const r = settings.dotRadius;
    const fs = settings.fontSize;
    for (const dot of dots) {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
      ctx.fillStyle = settings.dotColor;
      ctx.fill();

      const pos = computeNumberPosition(dot, dots, settings);
      ctx.font = `bold ${fs}px ${settings.fontFamily}`;
      ctx.fillStyle = settings.numberColor;
      ctx.textAlign = pos.anchor as CanvasTextAlign;
      ctx.textBaseline = pos.baseline as CanvasTextBaseline;
      ctx.fillText(String(dot.number), pos.x, pos.y);
    }
  } else {
    drawDotsAndLines(ctx, dots, settings, closed, 1, 1);
  }

  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function downloadSVG(content: string, filename: string) {
  const blob = new Blob([content], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

type Format = "png" | "svg";

export default function DownloadModal({ dots, settings, closed, imageEl, imgWidth, imgHeight, onClose }: DownloadModalProps) {
  const [transparent, setTransparent] = useState(false);
  const [format, setFormat] = useState<Format>("png");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (dots.length === 0) return;
    setDownloading(true);
    setTimeout(() => {
      try {
        if (format === "png") {
          const c1 = renderToCanvas(imageEl, dots, settings, closed, imgWidth, imgHeight, "full", false);
          downloadCanvas(c1, "dots-with-photo.png");

          const c2 = renderToCanvas(imageEl, dots, settings, closed, imgWidth, imgHeight, "dotslines", transparent);
          downloadCanvas(c2, "dots-and-lines.png");

          const c3 = renderToCanvas(imageEl, dots, settings, closed, imgWidth, imgHeight, "dotsonly", transparent);
          downloadCanvas(c3, "dots-only.png");
        } else {
          const svgDotsLines = buildSVG(dots, settings, closed, imgWidth, imgHeight, transparent ? null : "#000000");
          downloadSVG(svgDotsLines, "dots-and-lines.svg");

          const settingsDotsOnly = { ...settings };
          const svgDotsOnly = buildSVGDotsOnly(dots, settingsDotsOnly, imgWidth, imgHeight, transparent ? null : "#000000");
          downloadSVG(svgDotsOnly, "dots-only.svg");
        }
      } finally {
        setDownloading(false);
        onClose();
      }
    }, 100);
  };

  const fileCount = format === "png" ? 3 : 2;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
        width: 320,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Скачать</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
          >×</button>
        </div>

        {/* Format selector */}
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Формат
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["png", "svg"] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: format === f ? 600 : 400,
                  border: "1px solid",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: format === f ? "var(--accent)" : "var(--bg-panel2)",
                  borderColor: format === f ? "var(--accent)" : "var(--border)",
                  color: format === f ? "#fff" : "var(--text-secondary)",
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* File list */}
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Файлы ({fileCount})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {format === "png" && (
              <FileItem n={1} name="Фото с точками и линиями" ext="png" />
            )}
            <FileItem n={format === "png" ? 2 : 1} name={`Точки и линии на ${transparent ? "прозрачном" : "чёрном"} фоне`} ext={format} />
            <FileItem n={format === "png" ? 3 : 2} name={`Только точки на ${transparent ? "прозрачном" : "чёрном"} фоне`} ext={format} />
          </div>
        </div>

        {/* Transparent toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div className={`toggle ${transparent ? "on" : ""}`} onClick={() => setTransparent((p) => !p)}>
            <div className="toggle-knob" />
          </div>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Прозрачный фон</span>
        </label>

        {dots.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--red)", margin: 0 }}>Добавьте хотя бы одну точку.</p>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Отмена</button>
          <button
            onClick={handleDownload}
            disabled={dots.length === 0 || downloading}
            className="btn btn-accent"
            style={{ flex: 1 }}
          >
            {downloading ? "Скачиваю..." : "Скачать"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FileItem({ n, name, ext }: { n: number; name: string; ext: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 10px", borderRadius: 6,
      background: "var(--bg-panel2)",
      fontSize: 12, color: "var(--text-secondary)",
    }}>
      <span style={{ color: "var(--accent)", fontWeight: 600, width: 14, flexShrink: 0 }}>{n}.</span>
      <span style={{ flex: 1 }}>{name}</span>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: "2px 5px", borderRadius: 3,
        background: "var(--bg-hover)", color: "var(--text-muted)", textTransform: "uppercase",
      }}>{ext}</span>
    </div>
  );
}

function buildSVGDotsOnly(
  dots: Dot[],
  settings: Settings,
  w: number,
  h: number,
  bgColor: string | null
): string {
  const lines: string[] = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`);
  if (bgColor) lines.push(`  <rect width="${w}" height="${h}" fill="${bgColor}"/>`);

  for (const dot of dots) {
    lines.push(`  <circle cx="${dot.x}" cy="${dot.y}" r="${settings.dotRadius}" fill="${settings.dotColor}"/>`);
    const pos = computeNumberPosition(dot, dots, settings);
    lines.push(
      `  <text x="${pos.x.toFixed(1)}" y="${pos.y.toFixed(1)}" ` +
      `text-anchor="${pos.anchor}" dominant-baseline="${pos.baseline === "auto" ? "auto" : pos.baseline === "hanging" ? "hanging" : "middle"}" ` +
      `font-size="${settings.fontSize}" font-family="${settings.fontFamily}" font-weight="bold" fill="${settings.numberColor}">${dot.number}</text>`
    );
  }

  lines.push("</svg>");
  return lines.join("\n");
}
