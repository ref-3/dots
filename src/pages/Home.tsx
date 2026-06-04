import React, { useState, useRef, useCallback, useEffect } from "react";
import { Settings, DEFAULT_SETTINGS } from "../types";
import { MIN_ZOOM, MAX_ZOOM } from "../constants";
import { useDotCanvas } from "../hooks/useDotCanvas";
import SettingsPanel from "../components/SettingsPanel";
import ContextMenu from "../components/ContextMenu";
import DownloadModal from "../components/DownloadModal";
import Sidebar from "../components/Sidebar";
import CanvasArea from "../components/CanvasArea";

export default function Home() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgNaturalW, setImgNaturalW] = useState(0);
  const [imgNaturalH, setImgNaturalH] = useState(0);
  const [imgDisplayW, setImgDisplayW] = useState(0);
  const [imgDisplayH, setImgDisplayH] = useState(0);
  const [showDownload, setShowDownload] = useState(false);
  const [moveCursor, setMoveCursor] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  const imgRef = useRef<HTMLImageElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    dots, closed, movingDotId, contextMenu,
    addDot, closePath, openPath, deleteDot,
    startMoving, moveDot, stopMoving,
    showContextMenu, hideContextMenu, clearDots, getDotAtPosition,
  } = useDotCanvas();

  const updateImageSize = useCallback(() => {
    if (imgRef.current) {
      setImgDisplayW(imgRef.current.offsetWidth);
      setImgDisplayH(imgRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateImageSize);
    return () => window.removeEventListener("resize", updateImageSize);
  }, [updateImageSize]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    clearDots();
    setZoom(1);

    const img = new Image();
    img.onload = () => {
      imgElRef.current = img;
      setImgNaturalW(img.naturalWidth);
      setImgNaturalH(img.naturalHeight);
      setTimeout(updateImageSize, 50);
    };
    img.src = url;
  };

  const getSVGCoords = (e: React.MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (contextMenu) {
      hideContextMenu();
      return;
    }

    const { x, y } = getSVGCoords(e);

    if (movingDotId !== null) {
      moveDot(movingDotId, x, y);
      stopMoving();
      setMoveCursor(null);
      return;
    }

    const existing = getDotAtPosition(x, y, settings.dotRadius);
    if (existing) {
      if (existing.number === 1 && dots.length >= 2) {
        closed ? openPath() : closePath();
        return;
      }
      showContextMenu(existing.id, x, y);
      return;
    }

    if (closed) return;
    addDot(x, y);
  };

  const handleSVGMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (movingDotId !== null) {
      const { x, y } = getSVGCoords(e);
      moveDot(movingDotId, x, y);
      setMoveCursor({ x, y });
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * (1 - e.deltaY * 0.001))));
  }, []);

  const buildLinePath = () => {
    if (dots.length < 2) return "";
    const path = dots.map((d, i) => `${i === 0 ? "M" : "L"} ${d.x} ${d.y}`).join(" ");
    return closed ? path + " Z" : path;
  };

  const dotCount = dots.length;
  const countLabel = dotCount === 0
    ? (closed ? "" : "Кликайте по фото для добавления точек")
    : `${dotCount} точ${dotCount === 1 ? "ка" : dotCount < 5 ? "ки" : "ек"}`;
  const opacityPct = Math.round(settings.imageOpacity * 100);
  const containerRect = containerRef.current?.getBoundingClientRect() ?? null;

  return (
    <div className="app-shell">
      <Sidebar
        hasImage={Boolean(imageSrc)}
        opacityPct={opacityPct}
        zoom={zoom}
        dotCount={dotCount}
        countLabel={countLabel}
        closed={closed}
        movingDotId={movingDotId}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onClearDots={clearDots}
        onOpacityChange={(imageOpacity) => setSettings((s) => ({ ...s, imageOpacity }))}
        onZoomChange={setZoom}
        onResetZoom={() => setZoom(1)}
      />

      <CanvasArea
        imageSrc={imageSrc}
        dots={dots}
        settings={settings}
        closed={closed}
        movingDotId={movingDotId}
        selectedDotId={contextMenu?.dotId ?? null}
        moveCursor={moveCursor}
        imgDisplayW={imgDisplayW}
        imgDisplayH={imgDisplayH}
        zoom={zoom}
        linePath={buildLinePath()}
        imgRef={imgRef}
        containerRef={containerRef}
        svgRef={svgRef}
        onUploadClick={() => fileInputRef.current?.click()}
        onImageLoad={updateImageSize}
        onWheel={handleWheel}
        onSvgClick={handleSVGClick}
        onSvgMouseMove={handleSVGMouseMove}
      />

      <SettingsPanel
        settings={settings}
        onChange={setSettings}
        canDownload={Boolean(imageSrc)}
        onDownload={() => setShowDownload(true)}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          containerRect={containerRect}
          onDelete={() => deleteDot(contextMenu.dotId)}
          onMove={() => startMoving(contextMenu.dotId)}
          onClose={hideContextMenu}
        />
      )}

      {showDownload && (
        <DownloadModal
          dots={dots}
          settings={settings}
          closed={closed}
          imageEl={imgElRef.current}
          imgWidth={imgNaturalW}
          imgHeight={imgNaturalH}
          onClose={() => setShowDownload(false)}
        />
      )}
    </div>
  );
}
