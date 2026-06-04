import React, { useEffect, useRef } from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onDelete: () => void;
  onMove: () => void;
  onClose: () => void;
  containerRect: DOMRect | null;
}

export default function ContextMenu({ x, y, onDelete, onMove, onClose, containerRect }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const offsetX = containerRect ? containerRect.left : 0;
  const offsetY = containerRect ? containerRect.top : 0;
  const left = offsetX + x + 8;
  const top = offsetY + y + 8;

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed", zIndex: 40, left, top,
        background: "var(--bg-panel2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
        overflow: "hidden",
        minWidth: 160,
      }}
    >
      <button
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", padding: "10px 14px",
          background: "none", border: "none",
          color: "#60a5fa", fontSize: 13, cursor: "pointer",
          textAlign: "left", transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        onClick={onMove}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
        </svg>
        Переместить
      </button>
      <div style={{ borderTop: "1px solid var(--border)" }} />
      <button
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", padding: "10px 14px",
          background: "none", border: "none",
          color: "var(--red)", fontSize: 13, cursor: "pointer",
          textAlign: "left", transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        onClick={onDelete}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
        Удалить точку
      </button>
    </div>
  );
}
