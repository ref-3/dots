import { useState, useRef, useCallback } from "react";
import { Dot } from "../types";

export function useDotCanvas() {
  const [dots, setDots] = useState<Dot[]>([]);
  const [closed, setClosed] = useState(false);
  const [selectedDotId, setSelectedDotId] = useState<number | null>(null);
  const [movingDotId, setMovingDotId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ dotId: number; x: number; y: number } | null>(null);
  const nextIdRef = useRef(1);

  const addDot = useCallback((x: number, y: number) => {
    const id = nextIdRef.current++;
    setDots((prev) => [...prev, { id, x, y, number: prev.length + 1 }]);
    return id;
  }, []);

  const closePath = useCallback(() => {
    setClosed(true);
  }, []);

  const openPath = useCallback(() => {
    setClosed(false);
  }, []);

  const deleteDot = useCallback((id: number) => {
    setDots((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      return filtered.map((d, i) => ({ ...d, number: i + 1 }));
    });
    setContextMenu(null);
    setSelectedDotId(null);
    // If we delete the first dot, unclose
    setClosed((prevClosed) => {
      return prevClosed;
    });
  }, []);

  const startMoving = useCallback((id: number) => {
    setMovingDotId(id);
    setContextMenu(null);
    setSelectedDotId(null);
  }, []);

  const moveDot = useCallback((id: number, x: number, y: number) => {
    setDots((prev) => prev.map((d) => (d.id === id ? { ...d, x, y } : d)));
  }, []);

  const stopMoving = useCallback(() => {
    setMovingDotId(null);
  }, []);

  const showContextMenu = useCallback((dotId: number, x: number, y: number) => {
    setContextMenu({ dotId, x, y });
    setSelectedDotId(dotId);
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
    setSelectedDotId(null);
  }, []);

  const clearDots = useCallback(() => {
    setDots([]);
    setClosed(false);
    nextIdRef.current = 1;
    setContextMenu(null);
    setSelectedDotId(null);
    setMovingDotId(null);
  }, []);

  const getDotAtPosition = useCallback((x: number, y: number, radius: number): Dot | null => {
    const hitRadius = radius + 8;
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      const dist = Math.sqrt((d.x - x) ** 2 + (d.y - y) ** 2);
      if (dist <= hitRadius) return d;
    }
    return null;
  }, [dots]);

  return {
    dots,
    closed,
    selectedDotId,
    movingDotId,
    contextMenu,
    addDot,
    closePath,
    openPath,
    deleteDot,
    startMoving,
    moveDot,
    stopMoving,
    showContextMenu,
    hideContextMenu,
    clearDots,
    getDotAtPosition,
  };
}
