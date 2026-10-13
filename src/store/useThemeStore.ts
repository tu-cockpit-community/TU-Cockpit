import { create } from "zustand";

export interface ThemeTokens {
  [key: string]: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  type: "dark" | "light";
  description: string;
  tokens: ThemeTokens;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "tu-wien-dark",
    name: "TU Wien Night",
    type: "dark",
    description: "Dark slate canvas with TU Wien Blue (#006699) and TU Red accents",
    tokens: {
      "--tu-bg-base": "#0c131f",
      "--tu-bg-surface": "#141e30",
      "--tu-bg-card": "#1d2b45",
      "--tu-bg-hover": "#27395c",
      "--tu-border": "#28395a",
      "--tu-border-subtle": "#1b273d",
      "--tu-border-focus": "#38bdf8",
      "--tu-text-primary": "#f1f5f9",
      "--tu-text-secondary": "#94a3b8",
      "--tu-text-muted": "#64748b",
      "--tu-text-accent": "#38bdf8",
      "--tu-accent": "#006699",
      "--tu-accent-hover": "#007ab8",
      "--tu-accent-contrast": "#ffffff",
      "--tu-danger": "#ef4444",
      "--tu-success": "#10b981",
      "--tu-warning": "#f59e0b",
      "--tu-radius": "10px",
      "--tu-radius-sm": "5px",
      "--tu-radius-lg": "14px",
    },
  },
  {
    id: "tu-wien-light",
    name: "TU Wien Daylight",
    type: "light",
    description: "High-contrast academic white and university corporate blue",
    tokens: {
      "--tu-bg-base": "#f8fafc",
      "--tu-bg-surface": "#ffffff",
      "--tu-bg-card": "#f1f5f9",
      "--tu-bg-hover": "#e2e8f0",
      "--tu-border": "#cbd5e1",
      "--tu-border-subtle": "#e2e8f0",
      "--tu-border-focus": "#0284c7",
      "--tu-text-primary": "#0f172a",
      "--tu-text-secondary": "#475569",
      "--tu-text-muted": "#64748b",
      "--tu-text-accent": "#0284c7",
      "--tu-accent": "#006699",
      "--tu-accent-hover": "#005580",
      "--tu-accent-contrast": "#ffffff",
      "--tu-danger": "#dc2626",
      "--tu-success": "#059669",
      "--tu-warning": "#d97706",
      "--tu-radius": "10px",
      "--tu-radius-sm": "5px",
      "--tu-radius-lg": "14px",
    },
  },
  {
    id: "catppuccin-mocha",
    name: "Catppuccin Mocha",
    type: "dark",
    description: "Soothing pastel developer dark palette",
    tokens: {
      "--tu-bg-base": "#1e1e2e",
      "--tu-bg-surface": "#181825",
      "--tu-bg-card": "#313244",
      "--tu-bg-hover": "#45475a",
      "--tu-border": "#45475a",
      "--tu-border-subtle": "#313244",
      "--tu-border-focus": "#cba6f7",
      "--tu-text-primary": "#cdd6f4",
      "--tu-text-secondary": "#a6adc8",
      "--tu-text-muted": "#6c7086",
      "--tu-text-accent": "#cba6f7",
      "--tu-accent": "#89b4fa",
      "--tu-accent-hover": "#b4befe",
      "--tu-accent-contrast": "#11111b",
      "--tu-danger": "#f38ba8",
      "--tu-success": "#a6e3a1",
      "--tu-warning": "#f9e2af",
      "--tu-radius": "12px",
      "--tu-radius-sm": "6px",
      "--tu-radius-lg": "16px",
    },
  },
  {
    id: "nord",
    name: "Nord Arctic",
    type: "dark",
    description: "Calm, clean arctic north-bluish tones",
    tokens: {
      "--tu-bg-base": "#2e3440",
      "--tu-bg-surface": "#3b4252",
      "--tu-bg-card": "#434c5e",
      "--tu-bg-hover": "#4c566a",
      "--tu-border": "#4c566a",
      "--tu-border-subtle": "#3b4252",
      "--tu-border-focus": "#88c0d0",
      "--tu-text-primary": "#eceff4",
      "--tu-text-secondary": "#d8dee9",
      "--tu-text-muted": "#9ba6b9",
      "--tu-text-accent": "#88c0d0",
      "--tu-accent": "#81a1c1",
      "--tu-accent-hover": "#88c0d0",
      "--tu-accent-contrast": "#2e3440",
      "--tu-danger": "#bf616a",
      "--tu-success": "#a3be8c",
      "--tu-warning": "#ebcb8b",
      "--tu-radius": "8px",
      "--tu-radius-sm": "4px",
      "--tu-radius-lg": "12px",
    },
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    type: "dark",
    description: "Vibrant neon-violet aesthetic for nighttime coding",
    tokens: {
      "--tu-bg-base": "#1a1b26",
      "--tu-bg-surface": "#24283b",
      "--tu-bg-card": "#2f354f",
      "--tu-bg-hover": "#3c4366",
      "--tu-border": "#414868",
      "--tu-border-subtle": "#2f354f",
      "--tu-border-focus": "#7aa2f7",
      "--tu-text-primary": "#c0caf5",
      "--tu-text-secondary": "#9aa5ce",
      "--tu-text-muted": "#565f89",
      "--tu-text-accent": "#bb9af7",
      "--tu-accent": "#7aa2f7",
      "--tu-accent-hover": "#89ddff",
      "--tu-accent-contrast": "#15161e",
      "--tu-danger": "#f7768e",
      "--tu-success": "#9ece6a",
      "--tu-warning": "#e0af68",
      "--tu-radius": "10px",
      "--tu-radius-sm": "5px",
      "--tu-radius-lg": "14px",
    },
  },
  {
    id: "oled-stealth",
    name: "OLED Stealth",
    type: "dark",
    description: "Pure #000000 ultra-dark theme for battery efficiency and high contrast",
    tokens: {
      "--tu-bg-base": "#000000",
      "--tu-bg-surface": "#0a0a0a",
      "--tu-bg-card": "#171717",
      "--tu-bg-hover": "#262626",
      "--tu-border": "#2e2e2e",
      "--tu-border-subtle": "#1c1c1c",
      "--tu-border-focus": "#38bdf8",
      "--tu-text-primary": "#ffffff",
      "--tu-text-secondary": "#a3a3a3",
      "--tu-text-muted": "#737373",
      "--tu-text-accent": "#38bdf8",
      "--tu-accent": "#006699",
      "--tu-accent-hover": "#0284c7",
      "--tu-accent-contrast": "#ffffff",
      "--tu-danger": "#ef4444",
      "--tu-success": "#22c55e",
      "--tu-warning": "#f59e0b",
      "--tu-radius": "6px",
      "--tu-radius-sm": "3px",
      "--tu-radius-lg": "10px",
    },
  },
  {
    id: "high-contrast",
    name: "Accessible High-Contrast",
    type: "dark",
    description: "WCAG AAA compliant with deep boundaries and enhanced clarity",
    tokens: {
      "--tu-bg-base": "#000000",
      "--tu-bg-surface": "#121212",
      "--tu-bg-card": "#1f1f1f",
      "--tu-bg-hover": "#2d2d2d",
      "--tu-border": "#ffffff",
      "--tu-border-subtle": "#888888",
      "--tu-border-focus": "#ffff00",
      "--tu-text-primary": "#ffffff",
      "--tu-text-secondary": "#e0e0e0",
      "--tu-text-muted": "#b0b0b0",
      "--tu-text-accent": "#00e5ff",
      "--tu-accent": "#00b4d8",
      "--tu-accent-hover": "#90e0ef",
      "--tu-accent-contrast": "#000000",
      "--tu-danger": "#ff3838",
      "--tu-success": "#00e676",
      "--tu-warning": "#ffea00",
      "--tu-radius": "4px",
      "--tu-radius-sm": "2px",
      "--tu-radius-lg": "6px",
    },
  },
];

export interface ThemeState {
  activeThemeId: string;
  tokens: ThemeTokens;
  fontSans: string;
  fontMono: string;
  uiScale: number;
  customCss: string;
  setTheme: (themeId: string, tokens?: ThemeTokens) => void;
  setFontSans: (fontFamily: string) => void;
  setFontMono: (fontMono: string) => void;
  setUiScale: (scale: number) => void;
  setCustomToken: (token: string, value: string) => void;
  setCustomCss: (css: string) => void;
  applyToRoot: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = THEME_PRESETS[0];

  const applyTokensToDom = (tokens: ThemeTokens, fontSans: string, fontMono: string, uiScale: number) => {
    const root = document.documentElement;
    Object.entries(tokens).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });
    root.style.setProperty("--tu-font-sans", fontSans);
    root.style.setProperty("--tu-font-mono", fontMono);
    root.style.setProperty("--tu-ui-scale", uiScale.toString());
  };

  return {
    activeThemeId: initialTheme.id,
    tokens: { ...initialTheme.tokens },
    fontSans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    uiScale: 1.0,
    customCss: "",

    setTheme: (themeId, customTokens) => {
      const preset = THEME_PRESETS.find((p) => p.id === themeId);
      const newTokens = customTokens || (preset ? { ...preset.tokens } : get().tokens);
      set({ activeThemeId: themeId, tokens: newTokens });
      applyTokensToDom(newTokens, get().fontSans, get().fontMono, get().uiScale);
    },

    setFontSans: (fontSans) => {
      set({ fontSans });
      applyTokensToDom(get().tokens, fontSans, get().fontMono, get().uiScale);
    },

    setFontMono: (fontMono) => {
      set({ fontMono });
      applyTokensToDom(get().tokens, get().fontSans, fontMono, get().uiScale);
    },

    setUiScale: (uiScale) => {
      set({ uiScale });
      applyTokensToDom(get().tokens, get().fontSans, get().fontMono, uiScale);
    },

    setCustomToken: (token, value) => {
      const newTokens = { ...get().tokens, [token]: value };
      set({ tokens: newTokens });
      applyTokensToDom(newTokens, get().fontSans, get().fontMono, get().uiScale);
    },

    setCustomCss: (customCss) => {
      set({ customCss });
    },

    applyToRoot: () => {
      const { tokens, fontSans, fontMono, uiScale } = get();
      applyTokensToDom(tokens, fontSans, fontMono, uiScale);
    },
  };
});
