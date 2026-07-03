import { createContext, useContext } from "react";
import type { AppSettings } from "../types";

// Settings persistence — "the gardener's bench". Small enough for
// localStorage; deep-merged against defaults so old saved settings
// survive new fields being added.

const KEY = "poeticSignalSettings";

export const DEFAULT_SETTINGS: AppSettings = {
  sound: { masterVolume: 0.7, sensitivity: 0.4, loopMode: "seamless" },
  growth: {
    germinationSeconds: 8,
    fruitDensity: 0.6,
    seedsPerFruit: 12,
    ripening: "gradual",
    autoTranslate: true,
  },
  language: {
    primary: "en",
    translationStyle: "poetic",
    syllableRule: "loose",
    punctuation: "none",
  },
  grammar: {
    magneticStrength: 0.3,
    verbGuardrail: true,
    allowRiskyJoins: true,
    tagDisplay: "dots",
  },
  aesthetics: {
    theme: "indigo",
    motionSpeed: 1,
    fruitGlowWarmth: 0.5,
    watercolorBleed: true,
  },
  archive: {
    defaultSort: "newest",
    witherDays: 30,
    exportFormat: "json",
  },
  privacy: {
    storage: "local",
    aiAssistance: true,
    offlineMode: false,
  },
};

function deepMerge<T>(base: T, patch: unknown): T {
  if (typeof patch !== "object" || patch === null) return base;
  const out: Record<string, unknown> = { ...(base as object) };
  for (const [k, v] of Object.entries(base as Record<string, unknown>)) {
    const p = (patch as Record<string, unknown>)[k];
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      out[k] = deepMerge(v, p);
    } else if (p !== undefined) {
      out[k] = p;
    }
  }
  return out as T;
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return deepMerge(DEFAULT_SETTINGS, JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export interface SettingsContextValue {
  settings: AppSettings;
  update: (patch: (s: AppSettings) => AppSettings) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
