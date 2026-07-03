import { useEffect, useRef, useState } from "react";
import type {
  AppSettings,
  EditSnapshot,
  GenesisEvent,
  HaikuLine,
  PickedSeed,
  Scene,
  SealedHaiku,
  SeedTemplate,
  Theme,
  TreeSession,
} from "./types";
import {
  deleteHaiku,
  importHaiku,
  loadOrchard,
  saveHaiku,
  saveRecentCustomTheme,
  updateHaiku,
} from "./store/orchard";
import { loadSettings, saveSettings, SettingsContext, useSettings } from "./store/settings";
import {
  bumpFruitsBroken,
  bumpHaikuSealed,
  loadTreeSessions,
  startTreeSession,
} from "./store/treeSessions";
import { MusicContext, useMusicPlayerEngine } from "./audio/useMusicPlayer";
import { MusicDock } from "./audio/MusicDock";
import { TOTAL_RIPE_FRUITS } from "./components/Tree";
import { SceneSeed } from "./scenes/SceneSeed";
import { SceneGrow } from "./scenes/SceneGrow";
import { SceneStrand } from "./scenes/SceneStrand";
import { SceneTitle } from "./scenes/SceneTitle";
import { SceneSeal } from "./scenes/SceneSeal";
import { SceneOrchard } from "./scenes/SceneOrchard";
import { SceneDetail } from "./scenes/SceneDetail";
import { SceneOverview } from "./scenes/SceneOverview";
import { SceneSettings } from "./scenes/SceneSettings";

const FIRST_BREAK = 12;
const NEXT_BREAK = 6;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  useEffect(() => saveSettings(settings), [settings]);
  const music = useMusicPlayerEngine(settings);

  return (
    <SettingsContext.Provider
      value={{ settings, update: (patch) => setSettings((s) => patch(s)) }}
    >
      <MusicContext.Provider value={music}>
        <AppInner musicTrackName={music.activeIndex !== null ? music.tracks[music.activeIndex]?.name ?? null : null} />
      </MusicContext.Provider>
    </SettingsContext.Provider>
  );
}

function AppInner({ musicTrackName }: { musicTrackName: string | null }) {
  const { settings } = useSettings();
  useEffect(() => {
    document.documentElement.dataset.theme = settings.aesthetics.theme;
  }, [settings.aesthetics.theme]);

  const [scene, setScene] = useState<Scene>("seed");
  const [orchard, setOrchard] = useState<SealedHaiku[]>([]);
  const [treeSessions, setTreeSessions] = useState<TreeSession[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [pool, setPool] = useState<PickedSeed[]>([]);
  const [lines, setLines] = useState<PickedSeed[][]>([[], [], []]);
  const [sealed, setSealed] = useState<SealedHaiku | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [orchardSearch, setOrchardSearch] = useState("");

  const deckRef = useRef<SeedTemplate[]>([]);
  const genesisRef = useRef<GenesisEvent[]>([]);
  const sessionIdRef = useRef<string | null>(null);
  const fruitBreakRef = useRef(0);

  useEffect(() => {
    loadOrchard().then(setOrchard).catch(console.error);
    setTreeSessions(loadTreeSessions());
  }, []);

  const log = (type: GenesisEvent["type"], detail: string) => {
    genesisRef.current = [...genesisRef.current, { timestamp: new Date().toISOString(), type, detail }];
  };

  const plant = (t: Theme, custom: boolean) => {
    if (custom) saveRecentCustomTheme(t.key);
    deckRef.current = shuffle(t.seeds);
    genesisRef.current = [];
    fruitBreakRef.current = 0;
    log("plant", `planted "${t.en}" — ${t.key}`);
    const session = startTreeSession(t.key, t.en, TOTAL_RIPE_FRUITS);
    sessionIdRef.current = session.id;
    setTreeSessions((s) => [...s, session]);
    setTheme(t);
    setPool([]);
    setLines([[], [], []]);
    setScene("grow");
  };

  const draw = (t: Theme, n: number) => {
    const out: PickedSeed[] = [];
    for (let i = 0; i < n; i++) {
      if (deckRef.current.length === 0) deckRef.current = shuffle(t.seeds);
      const s = deckRef.current.pop()!;
      out.push({ ...s, id: crypto.randomUUID(), picked: false, fruitNo: fruitBreakRef.current });
    }
    setPool((p) => [...p, ...out]);
  };

  const bumpSession = (fn: (id: string) => void) => {
    const id = sessionIdRef.current;
    if (!id) return;
    fn(id);
    setTreeSessions(loadTreeSessions());
  };

  const breakFruit = () => {
    if (!theme) return;
    fruitBreakRef.current += 1;
    bumpSession(bumpFruitsBroken);
    draw(theme, FIRST_BREAK);
    setScene("strand");
  };

  const breakAnother = () => {
    if (!theme) return;
    fruitBreakRef.current += 1;
    bumpSession(bumpFruitsBroken);
    draw(theme, NEXT_BREAK);
  };

  const place = (seedId: string, line: number) => {
    const seed = pool.find((s) => s.id === seedId);
    if (!seed || seed.picked) return;
    const wasEmpty = lines[line].length === 0;
    log(
      wasEmpty ? "pick" : "combine",
      wasEmpty
        ? `picked "${seed.en}" from fruit #${seed.fruitNo ?? "?"}`
        : `combined "${seed.en}" into line ${line + 1}`
    );
    setPool((p) => p.map((s) => (s.id === seedId ? { ...s, picked: true } : s)));
    setLines((ls) => ls.map((l, i) => (i === line ? [...l, seed] : l)));
  };

  const clearLine = (line: number) => {
    const freed = new Set(lines[line].map((s) => s.id));
    setPool((p) => p.map((s) => (freed.has(s.id) ? { ...s, picked: false } : s)));
    setLines((ls) => ls.map((l, i) => (i === line ? [] : l)));
  };

  const seal = (title: string, titleJp: string) => {
    if (!theme) return;
    const mkLine = (seeds: PickedSeed[]): HaikuLine => ({
      en: seeds.map((s) => s.en).join(" "),
      jp: seeds.map((s) => s.jp).join(""),
      beads: seeds.map((s) => s.t),
      words: seeds.map((s) => ({ text: s.en, t: s.t })),
    });
    log("seal", `sealed as "${title}"`);
    const haiku: SealedHaiku = {
      id: crypto.randomUUID(),
      number: String(orchard.length + 1).padStart(3, "0"),
      title,
      titleJp,
      theme: theme.key,
      themeEn: theme.en,
      lines: [mkLine(lines[0]), mkLine(lines[1]), mkLine(lines[2])],
      sealedAt: new Date().toISOString(),
      tags: [],
      collections: [],
      withered: false,
      genesis: genesisRef.current,
      editHistory: [],
      fruitBreakNo: fruitBreakRef.current,
      seedsPicked: lines.flat().length,
      seedsRevealed: pool.length,
      musicFile: musicTrackName,
    };
    saveHaiku(haiku).catch(console.error);
    setOrchard((o) => [...o, haiku]);
    bumpSession(bumpHaikuSealed);
    setSealed(haiku);
    setScene("seal");
  };

  const reset = () => {
    setTheme(null);
    setPool([]);
    setLines([[], [], []]);
    setSealed(null);
    setScene("seed");
  };

  const handleImport = (list: SealedHaiku[]) => {
    importHaiku(list).then(loadOrchard).then(setOrchard).catch(console.error);
  };

  // Generic patch helper used by Orchard/Detail for tags, collections,
  // notes, withering, grove moves — one write path, persisted immediately.
  const patchHaiku = (id: string, patcher: (h: SealedHaiku) => SealedHaiku) => {
    setOrchard((prev) => {
      const next = prev.map((h) => (h.id === id ? patcher(h) : h));
      const updated = next.find((h) => h.id === id);
      if (updated) updateHaiku(updated).catch(console.error);
      return next;
    });
  };

  const patchMany = (ids: string[], patcher: (h: SealedHaiku) => SealedHaiku) => {
    setOrchard((prev) => {
      const idSet = new Set(ids);
      const next = prev.map((h) => (idSet.has(h.id) ? patcher(h) : h));
      for (const h of next) if (idSet.has(h.id)) updateHaiku(h).catch(console.error);
      return next;
    });
  };

  const editHaiku = (
    id: string,
    next: { title: string; titleJp: string; lines: [HaikuLine, HaikuLine, HaikuLine] }
  ) => {
    patchHaiku(id, (h) => {
      const previous: EditSnapshot = { title: h.title, titleJp: h.titleJp, lines: h.lines };
      return {
        ...h,
        ...next,
        editHistory: [
          ...h.editHistory,
          { timestamp: new Date().toISOString(), summary: "edited title/lines", previous },
        ],
      };
    });
  };

  const duplicateHaiku = (id: string) => {
    setOrchard((prev) => {
      const src = prev.find((h) => h.id === id);
      if (!src) return prev;
      const copy: SealedHaiku = {
        ...src,
        id: crypto.randomUUID(),
        number: String(prev.length + 1).padStart(3, "0"),
        title: `${src.title} (copy)`,
        sealedAt: new Date().toISOString(),
        genesis: [],
        editHistory: [],
        withered: false,
        witheredAt: undefined,
      };
      saveHaiku(copy).catch(console.error);
      return [...prev, copy];
    });
  };

  const deleteHaikuPermanently = (id: string) => {
    deleteHaiku(id).catch(console.error);
    setOrchard((prev) => prev.filter((h) => h.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setScene("orchard");
    }
  };

  const openDetail = (id: string) => {
    setSelectedId(id);
    setScene("detail");
  };

  const goOrchard = (search?: string) => {
    setOrchardSearch(search ?? "");
    setScene("orchard");
  };

  const selected = orchard.find((h) => h.id === selectedId) ?? null;

  return (
    <div className="app">
      <div className="top-bar">
        <div className="brand">
          Seed Signal<span className="jp">詩的信号</span>
        </div>
        {scene !== "grow" && (
          <div className="top-nav">
            {scene !== "orchard" && (
              <button className="nav-btn" onClick={() => goOrchard()}>
                orchard 果樹園
              </button>
            )}
            {scene !== "overview" && (
              <button className="nav-btn" onClick={() => setScene("overview")}>
                overview 一覧
              </button>
            )}
            {scene !== "settings" && (
              <button className="nav-btn" onClick={() => setScene("settings")}>
                settings 設定
              </button>
            )}
          </div>
        )}
      </div>

      <div className="scene">
        {scene === "seed" && <SceneSeed orchard={orchard} onPlant={plant} />}
        {scene === "grow" && theme && (
          <SceneGrow theme={theme} onBreak={breakFruit} onGrowComplete={() => log("grow_complete", "the tree finished growing")} />
        )}
        {scene === "strand" && (
          <SceneStrand
            pool={pool}
            lines={lines}
            onPlace={place}
            onClearLine={clearLine}
            onBreakAnother={breakAnother}
            onSeal={() => setScene("title")}
          />
        )}
        {scene === "title" && (
          <SceneTitle lines={lines} onBack={() => setScene("strand")} onSeal={seal} />
        )}
        {scene === "seal" && sealed && (
          <SceneSeal haiku={sealed} onOrchard={() => goOrchard()} onNew={reset} />
        )}
        {scene === "orchard" && (
          <SceneOrchard
            orchard={orchard}
            treeSessions={treeSessions}
            initialSearch={orchardSearch}
            onOpen={openDetail}
            onNew={reset}
            onImport={handleImport}
            onPatch={patchHaiku}
            onPatchMany={patchMany}
          />
        )}
        {scene === "detail" && selected && (
          <SceneDetail
            haiku={selected}
            orchard={orchard}
            onBack={() => goOrchard()}
            onNavigate={openDetail}
            onPatch={patchHaiku}
            onEdit={editHaiku}
            onDuplicate={duplicateHaiku}
            onDelete={deleteHaikuPermanently}
          />
        )}
        {scene === "overview" && (
          <SceneOverview
            orchard={orchard}
            treeSessions={treeSessions}
            onFilterWord={(w) => goOrchard(w)}
            onOpenHaiku={openDetail}
          />
        )}
        {scene === "settings" && (
          <SceneSettings
            orchard={orchard}
            onDeleteWithered={(id) => deleteHaikuPermanently(id)}
            onImported={setOrchard}
          />
        )}
      </div>

      <MusicDock />
    </div>
  );
}
