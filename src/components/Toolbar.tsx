import React from "react";
import { MIN_ZOOM, MAX_ZOOM } from "../constants";

interface ToolbarProps {
  hasImage: boolean;
  opacityPct: number;
  zoom: number;
  dotCount: number;
  countLabel: string;
  closed: boolean;
  movingDotId: number | null;
  onUploadClick: () => void;
  onClearDots: () => void;
  onOpacityChange: (value: number) => void;
  onZoomChange: (value: number) => void;
  onResetZoom: () => void;
}

export default function Toolbar({
  hasImage,
  opacityPct,
  zoom,
  dotCount,
  countLabel,
  closed,
  movingDotId,
  onUploadClick,
  onClearDots,
  onOpacityChange,
  onZoomChange,
  onResetZoom,
}: ToolbarProps) {
  const zoomPct = Math.round(zoom * 100);
  const zoomFill = ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;

  return (
    <>
      <nav className="sidebar-nav" aria-label="Разделы редактора">
        <NavItem active title="Главная" subtitle="показать источник и точки" />
        <NavItem title="Инструмент" subtitle="область печати" />
        <NavItem title="Инструмент" subtitle="изменение инструментов" />
        <NavItem title="Соедини точки" subtitle="создать точки на фото" />
        <NavItem title="CMYK" subtitle="экспорт CMYK" />
        <NavItem title="Блок сетка" subtitle="настройка сетки" />
        <NavItem title="Цвета" subtitle="обновить материалы" />
      </nav>

      <section className="sidebar-actions">
        <button className="btn btn-accent toolbar-button" onClick={onUploadClick}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {hasImage ? "Заменить фото" : "Загрузить фото"}
        </button>
        {dotCount > 0 && (
          <button className="btn btn-ghost toolbar-button" onClick={onClearDots}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
            Сбросить точки
          </button>
        )}
      </section>

      {hasImage && (
        <section className="toolbar-section toolbar-section--compact">
          <div className="toolbar-row">
            <span className="toolbar-label">Прозрачность фото</span>
            <span className="toolbar-value">{opacityPct}%</span>
          </div>
          <input
            className="range-control"
            type="range"
            min={0}
            max={100}
            step={1}
            value={opacityPct}
            onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
            style={{ "--range-fill": `${opacityPct}%` } as React.CSSProperties}
          />

          <div className="toolbar-row toolbar-row--zoom">
            <span className="toolbar-label">Масштаб</span>
            <span className="toolbar-value">{zoomPct}%</span>
          </div>
          <div className="zoom-control">
            <button className="btn btn-ghost zoom-control__button" onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom / 1.25))}>
              −
            </button>
            <input
              className="range-control zoom-control__range"
              type="range"
              min={Math.round(MIN_ZOOM * 100)}
              max={Math.round(MAX_ZOOM * 100)}
              step={5}
              value={zoomPct}
              onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
              style={{ "--range-fill": `${zoomFill}%` } as React.CSSProperties}
            />
            <button className="btn btn-ghost zoom-control__button" onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom * 1.25))}>
              +
            </button>
          </div>
          {zoom !== 1 && (
            <button className="btn btn-ghost zoom-control__reset" onClick={onResetZoom}>
              Сбросить масштаб
            </button>
          )}
        </section>
      )}

      <section className="toolbar-status">
        {hasImage && <div className="toolbar-status__count">{countLabel}</div>}

        {closed && <div className="toolbar-status__badge">⬡ Контур замкнут</div>}

        {!closed && dotCount >= 2 && (
          <div className="toolbar-status__hint">Кликните точку №1, чтобы замкнуть</div>
        )}

        {movingDotId !== null && (
          <div className="toolbar-status__moving">✦ Кликните для установки точки</div>
        )}
      </section>
    </>
  );
}

function NavItem({ title, subtitle, active = false }: { title: string; subtitle: string; active?: boolean }) {
  return (
    <button className={`sidebar-nav__item ${active ? "is-active" : ""}`} type="button">
      <span className="sidebar-nav__icon" />
      <span className="sidebar-nav__copy">
        <span className="sidebar-nav__title">{title}</span>
        <span className="sidebar-nav__subtitle">{subtitle}</span>
      </span>
    </button>
  );
}
