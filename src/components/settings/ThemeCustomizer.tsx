import React from "react";
import { useThemeStore, THEME_PRESETS } from "@/store/useThemeStore";
import {
  Check,
  Sparkles,
  Type,
  Sliders,
  RotateCcw,
} from "lucide-react";

export const ThemeCustomizer: React.FC = () => {
  const {
    activeThemeId,
    tokens,
    fontSans,
    uiScale,
    setTheme,
    setFontSans,
    setUiScale,
    setCustomToken,
  } = useThemeStore();

  const curatedFonts = [
    { name: "Inter (TU Cockpit Standard)", value: "'Inter', system-ui, sans-serif" },
    { name: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', system-ui, sans-serif" },
    { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
    { name: "Fira Code", value: "'Fira Code', monospace" },
    { name: "System Default (-apple-system / Segoe UI)", value: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" },
  ];

  const scaleOptions = [0.85, 0.95, 1.0, 1.1, 1.25, 1.4];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 text-[var(--tu-text-primary)]">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--tu-text-primary)]">
          Theming & Visual Customization
        </h2>
        <p className="text-sm text-[var(--tu-text-secondary)] mt-1">
          Customize design tokens, typography, and display scaling. Changes propagate instantaneously to all sandboxed plugins.
        </p>
      </div>

      {/* Preset Picker */}
      <section className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 shadow-[var(--tu-shadow)]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[var(--tu-text-accent)]" />
          <h3 className="font-semibold text-base">Theme Presets</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEME_PRESETS.map((preset) => {
            const isSelected = activeThemeId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setTheme(preset.id)}
                className={`flex flex-col text-left p-4 rounded-[var(--tu-radius)] border transition-all text-sm relative group ${
                  isSelected
                    ? "border-[var(--tu-border-focus)] bg-[var(--tu-bg-card)] shadow-md"
                    : "border-[var(--tu-border)] bg-[var(--tu-bg-surface)] hover:bg-[var(--tu-bg-hover)]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-[var(--tu-text-primary)]">
                    {preset.name}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--tu-text-secondary)] mb-4 flex-1">
                  {preset.description}
                </p>

                {/* Color swatches preview */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--tu-border-subtle)]">
                  <div
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ background: preset.tokens["--tu-bg-base"] }}
                    title="Background"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ background: preset.tokens["--tu-bg-surface"] }}
                    title="Surface"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ background: preset.tokens["--tu-accent"] }}
                    title="Accent"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-black/20"
                    style={{ background: preset.tokens["--tu-danger"] }}
                    title="Danger / Deadlines"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Typography & Scaling */}
      <section className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 shadow-[var(--tu-shadow)]">
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5 text-[var(--tu-text-accent)]" />
          <h3 className="font-semibold text-base">Typography & Fluid Scale</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Font Picker */}
          <div>
            <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] uppercase tracking-wider mb-2">
              Interface Sans Font
            </label>
            <select
              value={fontSans}
              onChange={(e) => setFontSans(e.target.value)}
              className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-2 text-sm text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)] cursor-pointer"
            >
              {curatedFonts.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* UI Scale */}
          <div>
            <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] uppercase tracking-wider mb-2">
              Global Scale ({uiScale}x)
            </label>
            <div className="flex gap-2">
              {scaleOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setUiScale(s)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-[var(--tu-radius-sm)] border transition-all ${
                    uiScale === s
                      ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] border-[var(--tu-accent)]"
                      : "bg-[var(--tu-bg-card)] border-[var(--tu-border)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Token Sliders & Overrides */}
      <section className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 shadow-[var(--tu-shadow)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--tu-text-accent)]" />
            <h3 className="font-semibold text-base">Token Overrides</h3>
          </div>
          <button
            onClick={() => setTheme(activeThemeId)}
            className="flex items-center gap-1.5 text-xs text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to preset defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Accent Color */}
          <div className="flex items-center justify-between p-3 bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)]">
            <div>
              <span className="text-xs font-semibold block text-[var(--tu-text-primary)]">Accent Color</span>
              <span className="text-[11px] text-[var(--tu-text-muted)] font-mono">--tu-accent</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tokens["--tu-accent"] || "#006699"}
                onChange={(e) => setCustomToken("--tu-accent", e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-[var(--tu-text-secondary)]">
                {tokens["--tu-accent"]}
              </span>
            </div>
          </div>

          {/* Corner Radius */}
          <div className="flex items-center justify-between p-3 bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)]">
            <div>
              <span className="text-xs font-semibold block text-[var(--tu-text-primary)]">Border Radius</span>
              <span className="text-[11px] text-[var(--tu-text-muted)] font-mono">--tu-radius</span>
            </div>
            <div className="flex items-center gap-2">
              {["4px", "8px", "12px", "16px"].map((rad) => (
                <button
                  key={rad}
                  onClick={() => setCustomToken("--tu-radius", rad)}
                  className={`px-2 py-1 text-xs rounded border transition-all ${
                    tokens["--tu-radius"] === rad
                      ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] border-[var(--tu-accent)]"
                      : "bg-[var(--tu-bg-surface)] text-[var(--tu-text-secondary)] border-[var(--tu-border)]"
                  }`}
                >
                  {rad}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Preview Demonstration */}
      <section className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 shadow-[var(--tu-shadow)]">
        <h3 className="font-semibold text-base mb-3">Live Component Preview</h3>
        <p className="text-xs text-[var(--tu-text-secondary)] mb-4">
          Visual test card rendered in real-time with current tokens:
        </p>

        <div className="p-4 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--tu-radius)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] flex items-center justify-center font-bold">
              TU
            </div>
            <div>
              <div className="font-semibold text-sm text-[var(--tu-text-primary)]">
                Algorithmen und Datenstrukturen (184.215)
              </div>
              <div className="text-xs text-[var(--tu-text-secondary)]">
                Prof. Dr. Neli Zlatareva • Freihaus Hörsaal 1
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs rounded-[var(--tu-radius-sm)] bg-[var(--tu-danger)] text-white font-medium">
              Abgabe: Morgen 23:59
            </span>
            <button className="px-3 py-1.5 text-xs rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] font-semibold shadow hover:opacity-90 transition-opacity">
              Open TUWEL
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
