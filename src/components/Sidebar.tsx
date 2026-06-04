import React from "react";
import Header from "./Header";
import Toolbar from "./Toolbar";

interface SidebarProps {
  hasImage: boolean;
  opacityPct: number;
  zoom: number;
  dotCount: number;
  countLabel: string;
  closed: boolean;
  movingDotId: number | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearDots: () => void;
  onOpacityChange: (value: number) => void;
  onZoomChange: (value: number) => void;
  onResetZoom: () => void;
}

export default function Sidebar({
  hasImage,
  opacityPct,
  zoom,
  dotCount,
  countLabel,
  closed,
  movingDotId,
  fileInputRef,
  onFileChange,
  onClearDots,
  onOpacityChange,
  onZoomChange,
  onResetZoom,
}: SidebarProps) {
  const handleUploadClick = () => fileInputRef.current?.click();

  return (
    <aside className="app-sidebar panel">
      <Header />
      <Toolbar
        hasImage={hasImage}
        opacityPct={opacityPct}
        zoom={zoom}
        dotCount={dotCount}
        countLabel={countLabel}
        closed={closed}
        movingDotId={movingDotId}
        onUploadClick={handleUploadClick}
        onClearDots={onClearDots}
        onOpacityChange={onOpacityChange}
        onZoomChange={onZoomChange}
        onResetZoom={onResetZoom}
      />
      <div className="sidebar-user">
        <div className="sidebar-user__avatar">M</div>
        <div>
          <div className="sidebar-user__name">2026.psd</div>
          <button className="sidebar-user__link" type="button">подписаться</button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="visually-hidden-input" onChange={onFileChange} />
    </aside>
  );
}
