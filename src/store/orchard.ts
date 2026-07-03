import type { SealedHaiku } from "../types";

// Orchard persistence in IndexedDB (replacing the prototype's
// localStorage), with JSON export/import for portability.

const DB_NAME = "seed-signal"; // was "poetic-signal" — change triggers a fresh IDB store
const STORE = "orchard";
const LEGACY_KEY = "poeticSignalOrchard";
const LEGACY_DB = "poetic-signal"; // old DB name, kept for future migration if needed
const MIGRATED_KEY = "poeticSignalMigratedToIdb";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

async function migrateLegacy(db: IDBDatabase): Promise<void> {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const list = JSON.parse(raw) as SealedHaiku[];
      if (Array.isArray(list)) {
        await Promise.all(
          list.map(
            (h) =>
              new Promise<void>((res, rej) => {
                const r = tx(db, "readwrite").put(h);
                r.onsuccess = () => res();
                r.onerror = () => rej(r.error);
              })
          )
        );
      }
    }
    localStorage.setItem(MIGRATED_KEY, "1");
  } catch {
    // legacy data unreadable — leave it untouched
  }
}

// Fields added by the Orchard/Detail/Overview addendum. Records sealed
// before this addendum won't have them — backfill on read so every
// caller can assume the full shape. Read as unknown since legacy IndexedDB
// rows genuinely lack these keys at runtime, despite the SealedHaiku type.
function withDefaults(h: Partial<SealedHaiku>): SealedHaiku {
  return {
    ...(h as SealedHaiku),
    tags: h.tags ?? [],
    collections: h.collections ?? [],
    withered: h.withered ?? false,
    genesis: h.genesis ?? [],
    editHistory: h.editHistory ?? [],
  };
}

export async function loadOrchard(): Promise<SealedHaiku[]> {
  const db = await openDb();
  await migrateLegacy(db);
  return new Promise((resolve, reject) => {
    const req = tx(db, "readonly").getAll();
    req.onsuccess = () => {
      const list = (req.result as Partial<SealedHaiku>[])
        .map(withDefaults)
        .sort((a, b) => a.sealedAt.localeCompare(b.sealedAt));
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveHaiku(h: SealedHaiku): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").put(h);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export const updateHaiku = saveHaiku; // same op: put by keyPath id

export async function deleteHaiku(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function importHaiku(list: SealedHaiku[]): Promise<void> {
  const db = await openDb();
  await Promise.all(
    list.map(
      (h) =>
        new Promise<void>((res, rej) => {
          const r = tx(db, "readwrite").put(h);
          r.onsuccess = () => res();
          r.onerror = () => rej(r.error);
        })
    )
  );
}

export function exportJson(list: SealedHaiku[]): void {
  const blob = new Blob([JSON.stringify(list, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "seed-signal-orchard.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Personalization for the Seed scene: remember the most recent
// custom-planted (non-preset) theme.
const RECENT_CUSTOM_KEY = "poeticSignalRecentCustomTheme";

export function saveRecentCustomTheme(key: string): void {
  localStorage.setItem(RECENT_CUSTOM_KEY, key);
}

export function loadRecentCustomTheme(): string | null {
  return localStorage.getItem(RECENT_CUSTOM_KEY);
}
