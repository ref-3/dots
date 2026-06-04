import React from "react";
import { Dot, Settings, computeNumberPosition } from "../types";
import DraggablePreview from "./DraggablePreview";

interface CanvasAreaProps {
  imageSrc: string | null;
  dots: Dot[];
  settings: Settings;
  closed: boolean;
  movingDotId: number | null;
  selectedDotId: number | null;
  moveCursor: { x: number; y: number } | null;
  imgDisplayW: number;
  imgDisplayH: number;
  zoom: number;
  linePath: string;
  imgRef: React.RefObject<HTMLImageElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onUploadClick: () => void;
  onImageLoad: () => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onSvgClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  onSvgMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
}

export default function CanvasArea({
  imageSrc,
  dots,
  settings,
  closed,
  movingDotId,
  selectedDotId,
  moveCursor,
  imgDisplayW,
  imgDisplayH,
  zoom,
  linePath,
  imgRef,
  containerRef,
  svgRef,
  onUploadClick,
  onImageLoad,
  onWheel,
  onSvgClick,
  onSvgMouseMove,
}: CanvasAreaProps) {
  return (
    <main className="canvas-workspace" onWheel={onWheel}>
      <button className="canvas-menu-button" type="button" aria-label="Меню редактора">
        <span />
        <span />
        <span />
      </button>
      {!imageSrc ? (
        <EmptyCanvas onUploadClick={onUploadClick} />
      ) : (
        <div
          className="canvas-scroll-spacer"
          style={{
            "--canvas-width": `${imgDisplayW * zoom + 48}px`,
            "--canvas-height": `${imgDisplayH * zoom + 48}px`,
          } as React.CSSProperties}
        >
          <div
            className="canvas-zoom-layer"
            style={{ "--canvas-zoom": zoom } as React.CSSProperties}
          >
            <div className="canvas-stage" ref={containerRef}>
              <img
                ref={imgRef}
                src={imageSrc}
                alt="uploaded"
                className="canvas-image"
                style={{ "--image-opacity": settings.imageOpacity } as React.CSSProperties}
                onLoad={onImageLoad}
                draggable={false}
              />

              <svg
                ref={svgRef}
                width={imgDisplayW}
                height={imgDisplayH}
                className={`canvas-overlay ${movingDotId !== null ? "is-moving" : closed ? "is-closed" : ""}`}
                onClick={onSvgClick}
                onMouseMove={onSvgMouseMove}
              >
                {dots.length > 1 && settings.lineWidth > 0 && (
                  <path
                    d={linePath}
                    stroke={settings.lineColor}
                    strokeWidth={settings.lineWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {movingDotId !== null && moveCursor && (
                  <circle cx={moveCursor.x} cy={moveCursor.y} r={settings.dotRadius} fill={settings.dotColor} opacity={0.5} />
                )}

                {dots.map((dot) => (
                  <DotMarker
                    key={dot.id}
                    dot={dot}
                    dots={dots}
                    settings={settings}
                    closed={closed}
                    isMoving={movingDotId === dot.id}
                    isSelected={selectedDotId === dot.id}
                  />
                ))}
              </svg>

              <DraggablePreview
                dots={dots}
                settings={settings}
                closed={closed}
                imgW={imgDisplayW}
                imgH={imgDisplayH}
                containerRef={containerRef}
                zoom={zoom}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function EmptyCanvas({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="empty-canvas" onClick={onUploadClick}>
      <div className="empty-canvas__icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <div className="empty-canvas__copy">
        <p className="empty-canvas__title">Соедини точки</p>
        <p className="empty-canvas__subtitle">Загрузите фото и расставьте точки на рабочем поле</p>
      </div>
    </div>
  );
}

function DotMarker({
  dot,
  dots,
  settings,
  closed,
  isMoving,
  isSelected,
}: {
  dot: Dot;
  dots: Dot[];
  settings: Settings;
  closed: boolean;
  isMoving: boolean;
  isSelected: boolean;
}) {
  const isFirst = dot.number === 1;
  const numPos = computeNumberPosition(dot, dots, settings);

  return (
    <g className={isMoving ? "dot-marker is-moving" : "dot-marker"}>
      {isFirst && dots.length >= 2 && !closed && (
        <circle
          cx={dot.x}
          cy={dot.y}
          r={settings.dotRadius + 5}
          fill="none"
          stroke={settings.lineColor}
          strokeWidth={1.5}
          strokeDasharray="3 3"
          opacity={0.6}
        />
      )}
      {isFirst && closed && (
        <circle cx={dot.x} cy={dot.y} r={settings.dotRadius + 4} fill="none" stroke="#FF4800" strokeWidth={2} opacity={0.8} />
      )}
      <circle
        cx={dot.x}
        cy={dot.y}
        r={settings.dotRadius}
        fill={settings.dotColor}
        stroke={isSelected ? "#FF4800" : "none"}
        strokeWidth={isSelected ? 2 : 0}
      />
      <text
        x={numPos.x}
        y={numPos.y}
        textAnchor={numPos.anchor}
        dominantBaseline={numPos.baseline === "auto" ? "auto" : numPos.baseline === "hanging" ? "hanging" : "middle"}
        fontSize={settings.fontSize}
        fontFamily={settings.fontFamily}
        fontWeight="bold"
        fill={settings.numberColor}
        className="dot-marker__number"
      >
        {dot.number}
      </text>
    </g>
  );
}
