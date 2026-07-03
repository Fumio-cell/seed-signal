import { useState } from "react";
import type { HaikuLine, SealedHaiku } from "../types";
import { exportJson } from "../store/orchard";
import { countSyllables, relativeTime } from "../lib/text";
import { relatedTo } from "../lib/lexicon";
import { useMusicPlayer } from "../audio/useMusicPlayer";

// One haiku, in full: the sealed card, its metadata, tags/collections,
// notes, related haiku, and the two history logs — genesis (how it was
// made) and edits (what changed after sealing, never silently).

interface Props {
  haiku: SealedHaiku;
  orchard: SealedHaiku[];
  onBack: () => void;
  onNavigate: (id: string) => void;
  onPatch: (id: string, patcher: (h: SealedHaiku) => SealedHaiku) => void;
  onEdit: (
    id: string,
    next: { title: string; titleJp: string; lines: [HaikuLine, HaikuLine, HaikuLine] }
  ) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SceneDetail({
  haiku,
  orchard,
  onBack,
  onNavigate,
  onPatch,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{ title: string; titleJp: string; en: string[]; jp: string[] } | null>(null);
  const [overflow, setOverflow] = useState(false);
  const [expandedEdit, setExpandedEdit] = useState<number | null>(null);
  const music = useMusicPlayer();

  const idx = orchard.findIndex((h) => h.id === haiku.id);
  const prev = idx > 0 ? orchard[idx - 1] : null;
  const next = idx >= 0 && idx < orchard.length - 1 ? orchard[idx + 1] : null;

  const related = relatedTo(haiku, orchard);

  const startEdit = () => {
    setDraft({
      title: haiku.title,
      titleJp: haiku.titleJp,
      en: haiku.lines.map((l) => l.en),
      jp: haiku.lines.map((l) => l.jp),
    });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!draft) return;
    const lines = haiku.lines.map((l, i) => ({
      ...l,
      en: draft.en[i],
      jp: draft.jp[i],
    })) as [HaikuLine, HaikuLine, HaikuLine];
    onEdit(haiku.id, { title: draft.title, titleJp: draft.titleJp, lines });
    setEditing(false);
    setDraft(null);
  };

  const addTag = () => {
    const t = window.prompt("Add tag:");
    if (t?.trim()) onPatch(haiku.id, (h) => (h.tags.includes(t) ? h : { ...h, tags: [...h.tags, t.trim()] }));
  };
  const removeTag = (t: string) => onPatch(haiku.id, (h) => ({ ...h, tags: h.tags.filter((x) => x !== t) }));

  const addCollection = () => {
    const c = window.prompt("Add to collection:");
    if (c?.trim())
      onPatch(haiku.id, (h) => (h.collections.includes(c) ? h : { ...h, collections: [...h.collections, c.trim()] }));
  };
  const removeCollection = (c: string) =>
    onPatch(haiku.id, (h) => ({ ...h, collections: h.collections.filter((x) => x !== c) }));

  const moveGrove = () => {
    const key = window.prompt("Move to grove key:", haiku.theme);
    if (key?.trim()) onPatch(haiku.id, (h) => ({ ...h, theme: key.trim() }));
  };

  const toggleWither = () =>
    onPatch(haiku.id, (h) => ({
      ...h,
      withered: !h.withered,
      witheredAt: !h.withered ? new Date().toISOString() : undefined,
    }));

  const saveNote = (note: string) => onPatch(haiku.id, (h) => ({ ...h, notes: note }));

  const musicIsLoaded =
    haiku.musicFile != null &&
    music.activeIndex !== null &&
    music.tracks[music.activeIndex]?.name === haiku.musicFile;

  return (
    <div className="detail-scene">
      <div className="detail-header">
        <button className="ghost-btn" onClick={onBack}>
          ◂ orchard
        </button>
        <span className="detail-grove">{haiku.themeEn}</span>
        <span className="detail-number">NO. {haiku.number}</span>
        <div className="detail-nav">
          <button className="icon-btn" disabled={!prev} onClick={() => prev && onNavigate(prev.id)}>
            ‹
          </button>
          <button className="icon-btn" disabled={!next} onClick={() => next && onNavigate(next.id)}>
            ›
          </button>
        </div>
        <div className="overflow">
          <button className="icon-btn" onClick={() => setOverflow((o) => !o)}>
            ⋯
          </button>
          {overflow && (
            <div className="overflow-menu">
              <button
                onClick={() => {
                  if (window.confirm("Permanently delete this haiku? This cannot be undone.")) onDelete(haiku.id);
                }}
              >
                delete permanently
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="detail-card seal-card">
        <div className="seal-head">
          <div className="seal-number">SEALED HAIKU · {haiku.number}</div>
          <div className="seal-stamp">印</div>
        </div>

        {editing && draft ? (
          <>
            <input
              className="edit-title-en"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <input
              className="edit-title-jp"
              value={draft.titleJp}
              onChange={(e) => setDraft({ ...draft, titleJp: e.target.value })}
            />
            {draft.en.map((en, i) => (
              <div key={i} className="edit-line">
                <input value={en} onChange={(e) => setDraft({ ...draft, en: draft.en.map((v, j) => (j === i ? e.target.value : v)) })} />
                <input
                  className="jp-input"
                  value={draft.jp[i]}
                  onChange={(e) => setDraft({ ...draft, jp: draft.jp.map((v, j) => (j === i ? e.target.value : v)) })}
                />
              </div>
            ))}
            <div className="edit-actions">
              <button className="ghost-btn" onClick={() => setEditing(false)}>
                cancel
              </button>
              <button className="primary-btn" onClick={saveEdit}>
                save edit
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="seal-title-en">{haiku.title}</h2>
            {haiku.titleJp && <div className="seal-title-jp">{haiku.titleJp}</div>}
            <div className="seal-lines">
              {haiku.lines.map((line, i) => (
                <div key={i} className="detail-line">
                  <div className="line-beads">
                    {line.beads.map((t, j) => (
                      <span key={j} className={`pos-dot pos-${t}`} />
                    ))}
                  </div>
                  <div className="line-en">{line.en}</div>
                  <div className="line-jp">{line.jp}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {!editing && (
        <div className="detail-actions">
          <button className="ghost-btn" onClick={startEdit}>
            edit
          </button>
          <button className="ghost-btn" onClick={() => onDuplicate(haiku.id)}>
            duplicate
          </button>
          <button className="ghost-btn" onClick={moveGrove}>
            move grove
          </button>
          <button className="ghost-btn" onClick={() => exportJson([haiku])}>
            export
          </button>
          <button className="ghost-btn" onClick={toggleWither}>
            {haiku.withered ? "restore" : "wither"}
          </button>
        </div>
      )}

      <div className="detail-columns">
        <div className="detail-col">
          <div className="col-label">METADATA</div>
          <div className="meta-grid">
            <span>grove</span>
            <span>{haiku.themeEn} — {haiku.theme}</span>
            <span>sealed</span>
            <span>{new Date(haiku.sealedAt).toLocaleString()}</span>
            <span>fruit break</span>
            <span>#{haiku.fruitBreakNo ?? "—"}</span>
            <span>music</span>
            <span>
              {haiku.musicFile ? (
                <>
                  {musicIsLoaded && (
                    <button className="icon-btn" onClick={music.playing ? music.pause : music.play}>
                      {music.playing ? "❚❚" : "▶"}
                    </button>
                  )}{" "}
                  {haiku.musicFile}
                  {!musicIsLoaded && <span className="muted"> (not currently loaded)</span>}
                </>
              ) : (
                <span className="muted">silence</span>
              )}
            </span>
            <span>syllables</span>
            <span>{haiku.lines.map((l) => countSyllables(l.en)).join(" / ")}</span>
            <span>seeds</span>
            <span>{haiku.seedsPicked ?? "—"} of {haiku.seedsRevealed ?? "—"} revealed</span>
          </div>

          <div className="col-label">TAGS</div>
          <div className="chip-row">
            {haiku.tags.map((t) => (
              <button key={t} className="chip active" onClick={() => removeTag(t)}>
                {t} ✕
              </button>
            ))}
            <button className="chip chip-new" onClick={addTag}>
              + add
            </button>
          </div>

          <div className="col-label">COLLECTIONS</div>
          <div className="chip-row">
            {haiku.collections.map((c) => (
              <button key={c} className="chip active" onClick={() => removeCollection(c)}>
                {c} ✕
              </button>
            ))}
            <button className="chip chip-new" onClick={addCollection}>
              + add
            </button>
          </div>
        </div>

        <div className="detail-col">
          <div className="col-label">NOTE</div>
          <textarea
            className="note-area"
            defaultValue={haiku.notes ?? ""}
            placeholder="creative context, exhibition statement…"
            onBlur={(e) => saveNote(e.target.value)}
          />

          <div className="col-label">RELATED</div>
          <div className="related-list">
            {related.length === 0 && <div className="muted">no connections yet</div>}
            {related.map((r) => (
              <button key={r.haiku.id} className="related-item" onClick={() => onNavigate(r.haiku.id)}>
                <span className="related-title">{r.haiku.title}</span>
                <span className="related-reason">{r.reason}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-label">GENESIS · 生成の記録</div>
      <div className="genesis-log">
        {haiku.genesis.length === 0 && <div className="muted">no genesis record for this haiku</div>}
        {haiku.genesis.map((g, i) => (
          <div key={i} className="genesis-row">
            <span className={`genesis-type type-${g.type}`}>{g.type}</span>
            <span className="genesis-detail">{g.detail}</span>
            <span className="genesis-time">{relativeTime(g.timestamp)}</span>
          </div>
        ))}
      </div>

      {haiku.editHistory.length > 0 && (
        <>
          <div className="col-label">EDIT HISTORY</div>
          <div className="edit-log">
            {haiku.editHistory.map((rec, i) => (
              <div key={i} className="edit-row">
                <div className="edit-row-head">
                  <span>{rec.summary}</span>
                  <span className="genesis-time">{relativeTime(rec.timestamp)}</span>
                  <button className="ghost-btn" onClick={() => setExpandedEdit(expandedEdit === i ? null : i)}>
                    {expandedEdit === i ? "hide" : "see previous version"}
                  </button>
                </div>
                {expandedEdit === i && (
                  <div className="edit-prev">
                    <div className="seal-title-en">{rec.previous.title}</div>
                    <div className="seal-title-jp">{rec.previous.titleJp}</div>
                    {rec.previous.lines.map((l, j) => (
                      <div key={j} className="line-en condensed">
                        {l.en}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
