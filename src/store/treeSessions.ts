import type { TreeSession } from "../types";

// "Trees currently growing" — one entry per planting. Small enough to
// live in localStorage alongside settings and the recent-theme pointer.

const KEY = "poeticSignalTreeSessions";

export function loadTreeSessions(): TreeSession[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TreeSession[]) : [];
  } catch {
    return [];
  }
}

function save(list: TreeSession[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function startTreeSession(
  theme: string,
  themeEn: string,
  totalFruits: number
): TreeSession {
  const session: TreeSession = {
    id: crypto.randomUUID(),
    theme,
    themeEn,
    plantedAt: new Date().toISOString(),
    fruitsBroken: 0,
    totalFruits,
    haikuSealed: 0,
  };
  save([...loadTreeSessions(), session]);
  return session;
}

export function bumpFruitsBroken(id: string): void {
  save(loadTreeSessions().map((s) => (s.id === id ? { ...s, fruitsBroken: s.fruitsBroken + 1 } : s)));
}

export function bumpHaikuSealed(id: string): void {
  save(loadTreeSessions().map((s) => (s.id === id ? { ...s, haikuSealed: s.haikuSealed + 1 } : s)));
}
