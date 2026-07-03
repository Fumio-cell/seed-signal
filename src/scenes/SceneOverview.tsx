import { useMemo, useState } from "react";
import type { SealedHaiku, TreeSession } from "../types";
import {
  buildConstellation,
  groveYields,
  lexicon,
  localSignature,
  posDistribution,
} from "../lib/lexicon";
import { countSyllables } from "../lib/text";
import { Constellation } from "../components/Constellation";
import { useSettings } from "../store/settings";

// The Overview: a mirror, not a dashboard. Summary numbers, rhythm,
// grove yields, lexicon, constellation, craft & grammar, and a
// locally-generated "signature" paragraph (no AI backend is configured
// in this build, so this always runs the offline-stats fallback the
// main spec calls for).

type Range = "30d" | "year" | "all";
type PosFilter = "all" | "verbs" | "nouns" | "adjectives";

interface Props {
  orchard: SealedHaiku[];
  treeSessions: TreeSession[];
  onFilterWord: (word: string) => void;
  onOpenHaiku: (id: string) => void;
}

function dayKey(iso: string): string {
  return new Date(iso).toDateString();
}

export function SceneOverview({ orchard, treeSessions, onFilterWord, onOpenHaiku }: Props) {
  const { settings } = useSettings();
  const [range, setRange] = useState<Range>("30d");
  const [posFilter, setPosFilter] = useState<PosFilter>("all");

  const sealed = orchard.filter((h) => !h.withered);

  const daysActive = new Set(sealed.map((h) => dayKey(h.sealedAt))).size;
  const fruitsPicked = treeSessions.reduce((sum, t) => sum + t.fruitsBroken, 0);

  const rhythm = useMemo(() => {
    const now = new Date();
    if (range === "30d") {
      const buckets: { label: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toDateString();
        buckets.push({
          label: `${d.getMonth() + 1}/${d.getDate()}`,
          count: sealed.filter((h) => dayKey(h.sealedAt) === key).length,
        });
      }
      return buckets;
    }
    if (range === "year") {
      const year = now.getFullYear();
      return Array.from({ length: 12 }, (_, m) => ({
        label: new Date(year, m, 1).toLocaleString(undefined, { month: "short" }),
        count: sealed.filter((h) => {
          const d = new Date(h.sealedAt);
          return d.getFullYear() === year && d.getMonth() === m;
        }).length,
      }));
    }
    if (sealed.length === 0) return [];
    const first = new Date(Math.min(...sealed.map((h) => new Date(h.sealedAt).getTime())));
    const months: { label: string; count: number; y: number; m: number }[] = [];
    const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
    while (cursor <= now) {
      months.push({
        label: cursor.toLocaleString(undefined, { month: "short", year: "2-digit" }),
        count: 0,
        y: cursor.getFullYear(),
        m: cursor.getMonth(),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const h of sealed) {
      const d = new Date(h.sealedAt);
      const bucket = months.find((mo) => mo.y === d.getFullYear() && mo.m === d.getMonth());
      if (bucket) bucket.count += 1;
    }
    return months;
  }, [sealed, range]);

  const maxCount = Math.max(1, ...rhythm.map((b) => b.count));

  const hours = sealed.map((h) => new Date(h.sealedAt).getHours());
  const medianHour = hours.length
    ? [...hours].sort((a, b) => a - b)[Math.floor(hours.length / 2)]
    : null;
  const hourCounts = new Map<number, number>();
  for (const h of hours) hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1);
  const favoriteHour = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const longestStreak = useMemo(() => {
    const days = [...new Set(sealed.map((h) => new Date(h.sealedAt).toDateString()))]
      .map((d) => new Date(d).getTime())
      .sort((a, b) => a - b);
    let best = days.length ? 1 : 0;
    let cur = days.length ? 1 : 0;
    for (let i = 1; i < days.length; i++) {
      if (days[i] - days[i - 1] === 86400000) cur += 1;
      else cur = 1;
      best = Math.max(best, cur);
    }
    return best;
  }, [sealed]);

  const avgSessionMinutes = useMemo(() => {
    const durations: number[] = [];
    for (const h of sealed) {
      const plant = h.genesis.find((g) => g.type === "plant");
      const seal = h.genesis.find((g) => g.type === "seal");
      if (plant && seal) {
        const mins = (new Date(seal.timestamp).getTime() - new Date(plant.timestamp).getTime()) / 60000;
        if (mins >= 0 && mins < 240) durations.push(mins);
      }
    }
    return durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
  }, [sealed]);

  const groves = groveYields(orchard);
  const maxGrove = Math.max(1, ...groves.map((g) => g.count));

  const lex = lexicon(orchard);
  const posOf = (t: string) => (t === "N" || t === "NP" ? "nouns" : t === "V" || t === "VP" ? "verbs" : "adjectives");
  const lexFiltered = posFilter === "all" ? lex : lex.filter((e) => posOf(e.t) === posFilter);
  const lexTop = lexFiltered.slice(0, 40);
  const maxLex = Math.max(1, ...lexTop.map((e) => e.count));

  const constellation = useMemo(() => buildConstellation(orchard), [orchard]);

  const dist = posDistribution(orchard);
  const donutSegments = [
    { label: "noun", value: dist.noun, color: "var(--noun)" },
    { label: "verb", value: dist.verb, color: "var(--verb)" },
    { label: "adj", value: dist.adj, color: "var(--adj)" },
    { label: "other", value: dist.other, color: "var(--faint)" },
  ];
  const donutTotal = Math.max(1, dist.total);
  let cumulative = 0;
  const circumference = 2 * Math.PI * 46;

  const syllablesByLine = [0, 1, 2].map((i) => {
    const vals = sealed.map((h) => countSyllables(h.lines[i]?.en ?? ""));
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  });
  const target = [5, 7, 5];
  const craftClose = syllablesByLine.every((v, i) => Math.abs(v - target[i]) <= 1.5);
  const craftReadout = craftClose
    ? `close to 5-7-5, ${settings.language.syllableRule === "strict" ? "and holding to it" : "gently loose"}`
    : "drifting from 5-7-5 — closer to free verse";

  const grammarReadout =
    dist.noun >= dist.verb && dist.noun >= dist.adj
      ? "noun-heavy, image-driven"
      : dist.verb >= dist.adj
      ? "verb-heavy, motion-driven"
      : "adjective-heavy, texture-driven";

  const signature = localSignature(orchard);

  return (
    <div className="overview-scene">
      <h1 className="scene-title">overview</h1>
      <div className="scene-sub">一覧</div>

      {sealed.length === 0 ? (
        <div className="orchard-empty">
          <div className="msg">nothing to reflect on yet — seal a haiku first.</div>
        </div>
      ) : (
        <div className="overview-body">
          <div className="stat-row">
            <div className="stat">
              <div className="stat-num">{sealed.length}</div>
              <div className="stat-label">haiku sealed</div>
            </div>
            <div className="stat">
              <div className="stat-num">{treeSessions.length}</div>
              <div className="stat-label">trees planted</div>
            </div>
            <div className="stat">
              <div className="stat-num">{fruitsPicked}</div>
              <div className="stat-label">fruits picked</div>
            </div>
            <div className="stat">
              <div className="stat-num">{daysActive}</div>
              <div className="stat-label">days active</div>
            </div>
          </div>

          <section className="ov-section">
            <div className="ov-head">
              <h3>Rhythm</h3>
              <div className="view-toggle">
                {(["30d", "year", "all"] as Range[]).map((r) => (
                  <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>
                    {r === "30d" ? "30 days" : r === "year" ? "this year" : "all time"}
                  </button>
                ))}
              </div>
            </div>
            <div className="bar-chart">
              {rhythm.map((b, i) => (
                <div key={i} className="bar-col" title={`${b.label}: ${b.count}`}>
                  <div className="bar" style={{ height: `${(b.count / maxCount) * 100}%` }} />
                  {(i % Math.max(1, Math.floor(rhythm.length / 8)) === 0) && (
                    <div className="bar-label">{b.label}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="rhythm-facts">
              <span>median hour: {medianHour !== null ? `${medianHour}:00` : "—"}</span>
              <span>longest streak: {longestStreak}d</span>
              <span>avg session: {avgSessionMinutes !== null ? `${avgSessionMinutes}m` : "not enough data"}</span>
              <span>favorite hour: {favoriteHour !== null ? `${favoriteHour}:00` : "—"}</span>
            </div>
          </section>

          <section className="ov-section">
            <h3>Grove — yields per tree</h3>
            <div className="grove-bars">
              {groves.map((g) => (
                <div key={g.theme} className="grove-bar-row">
                  <span className="grove-bar-label">{g.themeEn}</span>
                  <div className="grove-bar-track">
                    <div className="grove-bar-fill" style={{ width: `${(g.count / maxGrove) * 100}%` }} />
                  </div>
                  <span className="grove-bar-pct">{g.count} · {g.pct}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ov-section">
            <div className="ov-head">
              <h3>Lexicon — recurring words</h3>
              <div className="view-toggle">
                {(["all", "nouns", "verbs", "adjectives"] as PosFilter[]).map((f) => (
                  <button key={f} className={posFilter === f ? "active" : ""} onClick={() => setPosFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="word-cloud">
              {lexTop.map((e) => (
                <button
                  key={`${e.text}_${e.t}`}
                  className={`word-chip pos-${e.t}`}
                  style={{ fontSize: `${12 + (e.count / maxLex) * 22}px` }}
                  onClick={() => onFilterWord(e.text)}
                >
                  {e.text}
                </button>
              ))}
              {lexTop.length === 0 && <span className="muted">nothing here yet</span>}
            </div>
          </section>

          <section className="ov-section">
            <h3>Constellation — how haiku connect</h3>
            <Constellation graph={constellation} onSelect={onOpenHaiku} />
          </section>

          <section className="ov-section craft-grammar">
            <div className="cg-col">
              <h3>Craft</h3>
              <div className="cg-syllables">
                {syllablesByLine.map((v, i) => (
                  <span key={i}>{v}</span>
                ))}
              </div>
              <div className="cg-readout">{craftReadout}</div>
            </div>
            <div className="cg-col">
              <h3>Grammar</h3>
              <svg viewBox="0 0 120 120" className="donut">
                <circle cx="60" cy="60" r="46" fill="none" stroke="var(--panel-edge)" strokeWidth="14" />
                {donutSegments.map((seg, i) => {
                  const frac = seg.value / donutTotal;
                  const len = frac * circumference;
                  const dasharray = `${len} ${circumference - len}`;
                  const dashoffset = -cumulative;
                  cumulative += len;
                  return (
                    <circle
                      key={i}
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={dasharray}
                      strokeDashoffset={dashoffset}
                      transform="rotate(-90 60 60)"
                    />
                  );
                })}
              </svg>
              <div className="cg-readout">{grammarReadout}</div>
            </div>
          </section>

          <section className="ov-section signature-section">
            <h3>Signature</h3>
            {signature ? (
              <>
                <p className="signature-en">{signature.en}</p>
                <p className="signature-jp">{signature.jp}</p>
                <div className="chip-row">
                  {signature.tags.map((t) => (
                    <span key={t} className="chip active">
                      {t}
                    </span>
                  ))}
                </div>
                {!settings.privacy.aiAssistance && (
                  <div className="muted small-note">AI assistance is off — this reads local word-frequency stats only.</div>
                )}
              </>
            ) : (
              <div className="muted">not enough sealed haiku yet</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
