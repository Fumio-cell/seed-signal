import { createContext, useContext } from "react";
import type { AppSettings } from "../types";

// Settings persistence — "the gardener's bench". Small enough for
// localStorage; deep-merged against defaults so old saved settings
// survive new fields being added.

const KEY = "poeticSignalSettings";

export const DEFAULT_SETTINGS: AppSettings = {
  sound: { masterVolume: 0.7, loopMode: "seamless" },
  growth: {
    germinationSeconds: 8,
    seedsPerFruit: 20,
  },
  language: {
    syllableRule: "loose",
  },
  grammar: {
    allowRiskyJoins: true,
    tagDisplay: "dots",
  },
  vocabulary: {
    generative: true,
    surreality: 0.5,
  },
  aesthetics: {
    theme: "indigo",
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
