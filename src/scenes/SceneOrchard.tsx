import { useMemo, useRef, useState } from "react";
import type { SealedHaiku, TreeSession } from "../types";
import { exportJson } from "../store/orchard";
import { highlightMatches, relativeTime } from "../lib/text";
import { groveYields } from "../lib/lexicon";
import { useSettings } from "../store/settings";

// The Orchard, in full: search, Grove/Tags/Collections filters (AND
// logic), bulk actions, sort/view controls, the sealed-haiku grid, and
// the "trees currently growing" section for plantings that haven't been
// (fully) harvested yet.

type SortMode = "newest" | "oldest" | "alphabetical" | "grove";
type ViewMode = "grid" | "list";

interface Props {
  orchard: SealedHaiku[];
  treeSessions: TreeSession[];
  initialSearch?: string;
  onOpen: (id: string) => void;
  onNew: () => void;
  onImport: (list: SealedHaiku[]) => void;
  onPatch: (id: string, patcher: (h: SealedHaiku) => SealedHaiku) => void;
  onPatchMany: (ids: string[], patcher: (h: SealedHaiku) => SealedHaiku) => void;
}

function matchesQuery(h: SealedHaiku, q: string): boolean {
  if (!q.trim()) return true;
  const query = q.toLowerCase();
  const haystacks = [
    h.title,
    h.titleJp,
    h.theme,
    h.themeEn,
    ...h.lines.map((l) => l.en),
    ...h.lines.map((l) => l.jp),
  ];
  return haystacks.some((s) => s.toLowerCase().includes(query));
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = highlightMatches(text, query);
  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <mark key={i}>{p.text}</mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

export function SceneOrchard({
  orchard,
  treeSessions,
  initialSearch,
  onOpen,
  onNew,
  onImport,
  onPatch,
  onPatchMany,
}: Props) {
  const { settings } = useSettings();
  const [search, setSearch] = useState(initialSearch ?? "");
  const [grove, setGrove] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<Set<string>>(new Set());
  const [collFilter, setCollFilter] = useState<Set<string>>(new Set());
  const [showWithered, setShowWithered] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortMode>(settings.archive.defaultSort);
  const [view, setView] = useState<ViewMode>("grid");
  const fileRef = useRef<HTMLInputElement>(null);

  const scope = orchard.filter((h) => showWithered || !h.withered);

  const groveChips = useMemo(() => groveYields(scope), [scope]);
  const tagChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of scope) for (const t of h.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [scope]);
  const collChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const h of scope) for (const c of h.collections) counts.set(c, (counts.get(c) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [scope]);

  const filtered = scope.filter((h) => {
    if (!matchesQuery(h, search)) return false;
    if (grove !== "all" && h.theme !== grove) return false;
    for (const t of tagFilter) if (!h.tags.includes(t)) return false;
    for (const c of collFilter) if (!h.collections.includes(c)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") return b.sealedAt.localeCompare(a.sealedAt);
    if (sort === "oldest") return a.sealedAt.localeCompare(b.sealedAt);
    if (sort === "alphabetical") return a.title.localeCompare(b.title);
    return a.theme.localeCompare(b.theme);
  });

  const toggleSet = <T,>(set: Set<T>, v: T): Set<T> => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  const toggleSelect = (id: string) => setSelected((s) => toggleSet(s, id));
  const clearSelection = () => setSelected(new Set());

  const bulkWither = (withered: boolean) => {
    onPatchMany([...selected], (h) => ({
      ...h,
      withered,
      witheredAt: withered ? new Date().toISOString() : undefined,
    }));
    clearSelection();
  };

  const bulkAddCollection = () => {
    const name = window.prompt("Add selected to which collection?");
    if (!name?.trim()) return;
    onPatchMany([...selected], (h) => ({
      ...h,
      collections: h.collections.includes(name) ? h.collections : [...h.collections, name],
    }));
    clearSelection();
  };

  const bulkMoveGrove = () => {
    const key = window.prompt("Move selected to which grove key?");
    if (!key?.trim()) return;
    const existing = groveChips.find((g) => g.theme === key);
    onPatchMany([...selected], (h) => ({
      ...h,
      theme: key,
      themeEn: existing?.themeEn ?? h.themeEn,
    }));
    clearSelection();
  };

  const bulkExport = () => {
    exportJson(orchard.filter((h) => selected.has(h.id)));
    clearSelection();
  };

  const addNewTagFilter = () => {
    const name = window.prompt("Filter by (or start tagging with) which new tag?");
    if (name?.trim()) setTagFilter((s) => toggleSet(s, name.trim()));
  };

  const addNewCollectionFilter = () => {
    const name = window.prompt("Filter by (or start building) which new collection?");
    if (name?.trim()) setCollFilter((s) => toggleSet(s, name.trim()));
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const list = JSON.parse(await file.text()) as SealedHaiku[];
      if (Array.isArray(list)) onImport(list);
    } catch {
      // unreadable file — ignore
    }
    e.target.value = "";
  };

  const growingTrees = treeSessions.filter((t) => t.fruitsBroken > 0 || t.haikuSealed === 0);

  return (
    <div className="orchard-scene">
      <div className="orchard-header-bar">
        <button className="ghost-btn" onClick={onNew}>
          ◂ plant a seed
        </button>
        <h1 className="scene-title small">the orchard</h1>
        <span className="orchard-counts">
          {scope.filter((h) => !h.withered).length} haiku · {groveChips.length} trees
        </span>
        <button className="icon-btn" title="export all" onClick={() => exportJson(orchard)}>
          ⇩
        </button>
        <button className="icon-btn" title="import" onClick={() => fileRef.current?.click()}>
          ⇧
        </button>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleImportFile} hidden />
      </div>

      {orchard.length === 0 ? (
        <div className="orchard-empty">
          <div className="msg">nothing has been sealed yet.</div>
          <button className="primary-btn" onClick={onNew}>
            plant a seed — 種を植える
          </button>
        </div>
      ) : (
        <>
          <div className="orchard-search">
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search titles, verses, groves…"
            />
            <span className="search-count">{filtered.length} match{filtered.length === 1 ? "" : "es"}</span>
          </div>

          <div className="filter-row">
            <span className="filter-label">GROVE</span>
            <button className={`chip ${grove === "all" ? "active" : ""}`} onClick={() => setGrove("all")}>
              all
            </button>
            {groveChips.map((g) => (
              <button
                key={g.theme}
                className={`chip ${grove === g.theme ? "active" : ""}`}
                onClick={() => setGrove(grove === g.theme ? "all" : g.theme)}
              >
                {g.theme} · {g.count}
              </button>
            ))}
          </div>

          <div className="filter-row">
            <span className="filter-label">TAGS</span>
            {tagChips.map(([t, n]) => (
              <button
                key={t}
                className={`chip ${tagFilter.has(t) ? "active" : ""}`}
                onClick={() => setTagFilter((s) => toggleSet(s, t))}
              >
                {t} · {n}
              </button>
            ))}
            <button className="chip chip-new" onClick={addNewTagFilter}>
              + new
            </button>
          </div>

          <div className="filter-row">
            <span className="filter-label">COLLECTIONS</span>
            {collChips.map(([c, n]) => (
              <button
                key={c}
                className={`chip ${collFilter.has(c) ? "active" : ""}`}
                onClick={() => setCollFilter((s) => toggleSet(s, c))}
              >
                {c} · {n}
              </button>
            ))}
            <button className="chip chip-new" onClick={addNewCollectionFilter}>
              + new
            </button>
            <label className="wither-toggle">
              <input
                type="checkbox"
                checked={showWithered}
                onChange={(e) => setShowWithered(e.target.checked)}
              />
              show withered
            </label>
          </div>

          {selected.size > 0 && (
            <div className="bulk-bar">
              <span>{selected.size} selected</span>
              <button className="ghost-btn" onClick={bulkAddCollection}>
                add to collection
              </button>
              <button className="ghost-btn" onClick={bulkMoveGrove}>
                move to grove
              </button>
              <button className="ghost-btn" onClick={bulkExport}>
                export
              </button>
              <button className="ghost-btn" onClick={() => bulkWither(true)}>
                wither
              </button>
              <button className="ghost-btn" onClick={() => bulkWither(false)}>
                restore
              </button>
              <button className="ghost-btn" onClick={clearSelection}>
                clear
              </button>
            </div>
          )}

          <div className="view-controls">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
              <option value="newest">newest first</option>
              <option value="oldest">oldest first</option>
              <option value="alphabetical">alphabetical</option>
              <option value="grove">by grove</option>
            </select>
            <div className="view-toggle">
              <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}>
                grid
              </button>
              <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
                list
              </button>
            </div>
          </div>

          <div className={`orchard-grid ${view}`}>
            {sorted.map((h) => (
              <div
                key={h.id}
                className={`orchard-card ${h.withered ? "withered" : ""}`}
                onClick={() => onOpen(h.id)}
              >
                <input
                  type="checkbox"
                  className="card-check"
                  checked={selected.has(h.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleSelect(h.id)}
                />
                <div className="seal-head">
                  <div className="seal-number">NO. {h.number}</div>
                  <div className="seal-stamp small">印</div>
                </div>
                <h2 className="seal-title-en">
                  <Highlighted text={h.title} query={search} />
                </h2>
                {h.titleJp && <div className="seal-title-jp">{h.titleJp}</div>}
                {h.lines.map((line, i) => (
                  <div key={i} className="line-en condensed">
                    <Highlighted text={line.en} query={search} />
                  </div>
                ))}
                <div className="card-footer">
                  <span className="theme-tag">{h.themeEn}</span>
                  {h.tags.slice(0, 3).map((t) => (
                    <span key={t} className="mini-chip">
                      {t}
                    </span>
                  ))}
                  <span className="card-time">{relativeTime(h.sealedAt)}</span>
                </div>
                {h.withered && <div className="withered-badge">withered</div>}
              </div>
            ))}
          </div>

          {growingTrees.length > 0 && (
            <>
              <div className="filter-label section-label">TREES · CURRENTLY GROWING</div>
              <div className="orchard-grid trees">
                {growingTrees.map((t) => {
                  const days = Math.floor(
                    (Date.now() - new Date(t.plantedAt).getTime()) / 86400000
                  );
                  return (
                    <div key={t.id} className="tree-session-card">
                      <div className="seal-title-en">{t.themeEn}</div>
                      <div className="seal-title-jp">{t.theme}</div>
                      <div className="tree-stats">
                        <span>{days === 0 ? "planted today" : `${days}d since planting`}</span>
                        <span>{Math.max(0, t.totalFruits - t.fruitsBroken)} fruit remaining</span>
                        <span>{t.haikuSealed} sealed from this tree</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
