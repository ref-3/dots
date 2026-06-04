import React from "react";
import { Settings, FONT_OPTIONS } from "../types";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  canDownload?: boolean;
  onDownload?: () => void;
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="settings-color">
      <span className="settings-label">{label}</span>
      <div className="settings-color__control">
        <label className="settings-swatch" style={{ "--swatch-color": value } as React.CSSProperties}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        </label>
        <span className="settings-value settings-value--color">{value}</span>
      </div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="settings-field">
      <div className="settings-row">
        <span className="settings-label">{label}</span>
        <span className="settings-value">{value}{unit}</span>
      </div>
      <input
        className="range-control"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--range-fill": `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}

export default function SettingsPanel({ settings, onChange, canDownload = false, onDownload }: SettingsPanelProps) {
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => onChange({ ...settings, [key]: value });
  const opacityPct = Math.round(settings.imageOpacity * 100);

  return (
    <aside className="settings-panel panel-right">
      <header className="settings-panel__header">Настройки</header>

      <div className="settings-scroll settings-panel__body">
        <section className="settings-group">
          <h2 className="settings-group__title">Изображение</h2>
          <SliderInput label="Прозрачность" value={opacityPct} min={0} max={100} unit="%" onChange={(v) => set("imageOpacity", v / 100)} />
        </section>

        <section className="settings-group">
          <h2 className="settings-group__title">Дизайн</h2>
          <SliderInput label="Размер точек" value={settings.dotRadius} min={4} max={30} unit="px" onChange={(v) => set("dotRadius", v)} />
          <ColorInput label="Цвет точек" value={settings.dotColor} onChange={(v) => set("dotColor", v)} />
          <SliderInput label="Размер цифр" value={settings.fontSize} min={6} max={32} unit="px" onChange={(v) => set("fontSize", v)} />
          <ColorInput label="Цвет цифр" value={settings.numberColor} onChange={(v) => set("numberColor", v)} />

          <div className="settings-field">
            <span className="settings-label">Шрифт</span>
            <select className="settings-select" value={settings.fontFamily} onChange={(e) => set("fontFamily", e.target.value)}>
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <span className="settings-label">Положение цифр</span>
            <div className="settings-segment">
              {(["center", "outside"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`settings-segment__button ${settings.numberPlacement === mode ? "is-active" : ""}`}
                  type="button"
                  onClick={() => set("numberPlacement", mode)}
                >
                  {mode === "center" ? "Внутри" : "Снаружи"}
                </button>
              ))}
            </div>
          </div>

          {settings.numberPlacement === "outside" && (
            <SliderInput label="Отступ цифр" value={settings.numberDistance} min={2} max={40} unit="px" onChange={(v) => set("numberDistance", v)} />
          )}

          <SliderInput label="Толщина линии" value={settings.lineWidth} min={0} max={10} step={0.5} unit="px" onChange={(v) => set("lineWidth", v)} />
          <ColorInput label="Цвет линии" value={settings.lineColor} onChange={(v) => set("lineColor", v)} />
        </section>
      </div>

      <div className="settings-panel__footer">
        <button className="btn btn-accent settings-download" disabled={!canDownload} onClick={onDownload}>
          Скачать
        </button>
      </div>
    </aside>
  );
}
