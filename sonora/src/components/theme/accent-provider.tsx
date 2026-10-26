"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

export interface AccentPreset {
  id: string;
  name: string;
  hex: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "sage-green", name: "Sage Green", hex: "#89996B" },
  { id: "dusty-lavender", name: "Dusty Lavender", hex: "#A18AE0" },
  { id: "slate-blue", name: "Slate Blue", hex: "#7893B2" },
  { id: "dusty-rose", name: "Dusty Rose", hex: "#C58E96" },
  { id: "terracotta", name: "Terracotta", hex: "#C78369" },
  { id: "soft-teal", name: "Soft Teal", hex: "#70A39A" },
  { id: "warm-sand", name: "Warm Sand", hex: "#B69B73" },
  { id: "charcoal", name: "Charcoal", hex: "#55565A" },
];

export const DEFAULT_ACCENT: AccentPreset = ACCENT_PRESETS[0]; // Sage Green #89996B
export const ACCENT_STORAGE_KEY = "sonora-accent-color";

interface AccentContextValue {
  currentAccent: AccentPreset;
  setAccent: (preset: AccentPreset) => void;
  presets: AccentPreset[];
}

const AccentContext = createContext<AccentContextValue>({
  currentAccent: DEFAULT_ACCENT,
  setAccent: () => {},
  presets: ACCENT_PRESETS,
});

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
  const factor = 1 + percent / 100;
  const nr = clamp(r * factor).toString(16).padStart(2, "0");
  const ng = clamp(g * factor).toString(16).padStart(2, "0");
  const nb = clamp(b * factor).toString(16).padStart(2, "0");
  return `#${nr}${ng}${nb}`;
}

export function applyAccentToCss(hex: string) {
  if (typeof document === "undefined") return;
  const { r, g, b } = hexToRgb(hex);
  const root = document.documentElement;
  root.style.setProperty("--sn-accent", hex);
  root.style.setProperty("--sn-accent-hover", adjustBrightness(hex, -12));
  root.style.setProperty("--sn-accent-muted", `rgba(${r}, ${g}, ${b}, 0.16)`);
  root.style.setProperty("--sn-accent-border", `rgba(${r}, ${g}, ${b}, 0.35)`);
  root.style.setProperty("--sn-accent-ring", `rgba(${r}, ${g}, ${b}, 0.45)`);
}

function getInitialAccent(): AccentPreset {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  try {
    const savedHex = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (savedHex) {
      const found = ACCENT_PRESETS.find(
        (p) => p.hex.toLowerCase() === savedHex.toLowerCase()
      );
      if (found) return found;
    }
  } catch {
    // LocalStorage access could fail in restricted environments
  }
  return DEFAULT_ACCENT;
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [currentAccent, setCurrentAccent] = useState<AccentPreset>(getInitialAccent);

  useEffect(() => {
    applyAccentToCss(currentAccent.hex);
  }, [currentAccent]);

  const setAccent = useCallback((preset: AccentPreset) => {
    setCurrentAccent(preset);
    applyAccentToCss(preset.hex);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, preset.hex);
    } catch {
      // LocalStorage error handling
    }
  }, []);

  const value = useMemo(
    () => ({
      currentAccent,
      setAccent,
      presets: ACCENT_PRESETS,
    }),
    [currentAccent, setAccent]
  );

  return (
    <AccentContext.Provider value={value}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent() {
  return useContext(AccentContext);
}
