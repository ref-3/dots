import React, { useEffect, useRef, useState, useCallback } from "react";
import { Dot, Settings } from "../types";
import { drawDotsAndLines } from "./PreviewCanvas";

type Corner = "tl" | "tr" | "bl" | "br";

interface Props {
  dots: Dot[];
  settings: Settings;
  closed: boolean;
  imgW: number;
  imgH: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
}

const MARGIN = 8;
const MIN_SIZE = 80;
const MAX_SIZE = 500;
const DEFAULT_SIZE = 180;

function getSnappedPos(corner: Corner, size: number, previewH: number, contW: number, contH: number) {
  switch (corner) {
    case "tl": return { x: MARGIN, y: MARGIN };
    case "tr": return { x: contW - size - MARGIN, y: MARGIN };
    case "bl": return { x: MARGIN, y: contH - previewH - MARGIN };
    case "br": return { x: contW - size - MARGIN, y: contH - previewH - MARGIN };
  }
}

function nearestCorner(cx: number, cy: number, contW: number, contH: number): Corner {
  const left = cx < contW / 2;
  const top = cy < contH / 2;
  if (left && top) return "tl";
  if (!left && top) return "tr";
  if (left && !top) return "bl";
  return "br";
}

export default function DraggablePreview({ dots, settings, closed, imgW, imgH, containerRef, zoom }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState(DEFAULT_SIZE);
  const [corner, setCorner] = useState<Corner>("br");
  const [livePos, setLivePos] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragRef = useRef({ offsetX: 0, offsetY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, startSize: DEFAULT_SIZE, whichCorner: "br" as Corner });

  const aspectRatio = imgH > 0 ? imgH / imgW : 9 / 16;
  const previewH = Math.round(size * aspectRatio);

  // Draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || imgW === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = previewH;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, previewH);

    if (dots.length === 0) return;

    const scaleX = size / imgW;
    const scaleY = previewH / imgH;
    drawDotsAndLines(ctx, dots, settings, closed, scaleX, scaleY);
  }, [dots, settings, closed, imgW, imgH, size, previewH]);

  // Hover detection via document mousemove (since canvas is pointer-events:none)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      setIsHovered(over);
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  // Drag mouse handler
  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      const cont = containerRef.current;
      if (!cont) return;
      const cr = cont.getBoundingClientRect();
      const x = (e.clientX - cr.left) / zoom - dragRef.current.offsetX;
      const y = (e.clientY - cr.top) / zoom - dragRef.current.offsetY;
      setLivePos({ x, y });
    };

    const onUp = (e: MouseEvent) => {
      const cont = containerRef.current;
      if (!cont) return;
      const cr = cont.getBoundingClientRect();
      const x = (e.clientX - cr.left) / zoom - dragRef.current.offsetX;
      const y = (e.clientY - cr.top) / zoom - dragRef.current.offsetY;
      const cx = x + size / 2;
      const cy = y + previewH / 2;
      const newCorner = nearestCorner(cx, cy, cont.offsetWidth, cont.offsetHeight);
      setCorner(newCorner);
      setLivePos(null);
      setIsDragging(false);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, size, previewH, containerRef, zoom]);

  // Resize mouse handler
  useEffect(() => {
    if (!isResizing) return;

    const onMove = (e: MouseEvent) => {
      const { startX, startY, startSize, whichCorner } = resizeRef.current;
      let dx = (e.clientX - startX) / zoom;
      let dy = (e.clientY - startY) / zoom;

      // Adjust direction based on which corner
      if (whichCorner === "tl" || whichCorner === "bl") dx = -dx;
      if (whichCorner === "tl" || whichCorner === "tr") dy = -dy;

      const delta = (dx + dy) / 2;
      setSize(Math.max(MIN_SIZE, Math.min(MAX_SIZE, startSize + delta)));
    };

    const onUp = () => setIsResizing(false);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isResizing, zoom]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = wrapRef.current;
    const cont = containerRef.current;
    if (!el || !cont) return;
    const cr = cont.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    dragRef.current = {
      offsetX: (e.clientX - er.left) / zoom,
      offsetY: (e.clientY - er.top) / zoom,
    };
    const initX = (er.left - cr.left) / zoom;
    const initY = (er.top - cr.top) / zoom;
    setLivePos({ x: initX, y: initY });
    setIsDragging(true);
  }, [containerRef, zoom]);

  const handleResizeStart = useCallback((e: React.MouseEvent, which: Corner) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startSize: size, whichCorner: which };
    setIsResizing(true);
  }, [size]);

  if (dots.length === 0 || imgW === 0) return null;

  const cont = containerRef.current;
  const contW = cont?.offsetWidth ?? imgW;
  const contH = cont?.offsetHeight ?? imgH;

  const pos = livePos ?? getSnappedPos(corner, size, previewH, contW, contH);

  const isActive = isDragging || isResizing;
  const opacity = isActive ? 0.35 : isHovered ? 0.15 : 1;
  const transition = isActive ? "opacity 0.1s" : "opacity 0.2s, left 0.25s ease, top 0.25s ease";

  const handleStyle: React.CSSProperties = {
    position: "absolute",
    width: 14, height: 14,
    borderRadius: 3,
    background: "rgba(255,72,0,0.7)",
    border: "1px solid rgba(255,255,255,0.4)",
    pointerEvents: "auto",
    zIndex: 2,
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: size,
        height: previewH,
        opacity,
        transition,
        borderRadius: 6,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 20,
        boxShadow: "0 4px 20px rgba(0,0,0,0.7)",
      }}
    >
      {/* Canvas - always pointer-events none so clicks pass through */}
      <canvas
        ref={canvasRef}
        width={size}
        height={previewH}
        style={{
          display: "block",
          width: size,
          height: previewH,
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.12)",
          pointerEvents: "none",
        }}
      />

      {/* Drag handle bar at top */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: 18,
          pointerEvents: "auto",
          cursor: isDragging ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px 6px 0 0",
          background: "rgba(255,255,255,0.06)",
        }}
        onMouseDown={handleDragStart}
      >
        <svg width="20" height="6" viewBox="0 0 20 6" fill="rgba(255,255,255,0.4)">
          <rect y="0" width="20" height="1.5" rx="1" />
          <rect y="4" width="20" height="1.5" rx="1" />
        </svg>
      </div>

      {/* Corner resize handles */}
      <div style={{ ...handleStyle, top: -5, left: -5, cursor: "nwse-resize" }} onMouseDown={(e) => handleResizeStart(e, "tl")} />
      <div style={{ ...handleStyle, top: -5, right: -5, cursor: "nesw-resize" }} onMouseDown={(e) => handleResizeStart(e, "tr")} />
      <div style={{ ...handleStyle, bottom: -5, left: -5, cursor: "nesw-resize" }} onMouseDown={(e) => handleResizeStart(e, "bl")} />
      <div style={{ ...handleStyle, bottom: -5, right: -5, cursor: "nwse-resize" }} onMouseDown={(e) => handleResizeStart(e, "br")} />
    </div>
  );
}
