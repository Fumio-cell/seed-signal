import type { PartOfSpeech, SealedHaiku } from "../types";
import { significantWords, stem } from "./text";

// Analysis shared by the Plant-a-Seed ranking (Section 5.1), the Orchard's
// Related-haiku panel, and the Overview's Grove/Lexicon/Constellation
// sections — implemented once, reused everywhere the addendum asks for it.

export interface GroveYield {
  theme: string;
  themeEn: string;
  count: number;
  pct: number;
}

export function groveYields(orchard: SealedHaiku[]): GroveYield[] {
  const sealed = orchard.filter((h) => !h.withered);
  const counts = new Map<string, { themeEn: string; n: number }>();
  for (const h of sealed) {
    const e = counts.get(h.theme);
    if (e) e.n += 1;
    else counts.set(h.theme, { themeEn: h.themeEn, n: 1 });
  }
  const total = sealed.length || 1;
  return [...counts.entries()]
    .map(([theme, { themeEn, n }]) => ({
      theme,
      themeEn,
      count: n,
      pct: Math.round((n / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function haikuStems(h: SealedHaiku): Set<string> {
  const words = h.lines.flatMap((l) => significantWords(l.en));
  return new Set(words.map(stem));
}

export function sharedMotifs(a: SealedHaiku, b: SealedHaiku): string[] {
  const sa = haikuStems(a);
  const sb = haikuStems(b);
  return [...sa].filter((w) => sb.has(w));
}

export interface RelatedHaiku {
  haiku: SealedHaiku;
  reason: string;
}

export function relatedTo(target: SealedHaiku, orchard: SealedHaiku[], limit = 5): RelatedHaiku[] {
  const out: RelatedHaiku[] = [];
  for (const h of orchard) {
    if (h.id === target.id || h.withered) continue;
    const shared = sharedMotifs(target, h);
    if (shared.length > 0) {
      out.push({ haiku: h, reason: `shares "${shared[0]}"` });
    } else if (h.theme === target.theme) {
      out.push({ haiku: h, reason: `same grove — ${h.themeEn}` });
    }
  }
  return out.slice(0, limit);
}

export interface LexiconEntry {
  text: string;
  t: PartOfSpeech;
  count: number;
}

export function lexicon(orchard: SealedHaiku[]): LexiconEntry[] {
  const counts = new Map<string, LexiconEntry>();
  for (const h of orchard.filter((x) => !x.withered)) {
    for (const line of h.lines) {
      const words = line.words ?? line.beads.map((t) => ({ text: line.en, t }));
      for (const w of words) {
        for (const tok of w.text.toLowerCase().match(/[a-z]+/g) ?? []) {
          if (tok.length < 3) continue;
          const key = `${tok}_${w.t}`;
          const e = counts.get(key);
          if (e) e.count += 1;
          else counts.set(key, { text: tok, t: w.t, count: 1 });
        }
      }
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

export interface ConstellationEdge {
  a: string; // haiku id
  b: string; // haiku id
  word: string;
}

export interface ConstellationGraph {
  nodes: SealedHaiku[];
  edges: ConstellationEdge[];
}

export function buildConstellation(orchard: SealedHaiku[]): ConstellationGraph {
  const nodes = orchard.filter((h) => !h.withered);
  const edges: ConstellationEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = sharedMotifs(nodes[i], nodes[j]);
      if (shared.length > 0) {
        edges.push({ a: nodes[i].id, b: nodes[j].id, word: shared[0] });
      }
    }
  }
  return { nodes, edges };
}

export interface PosDistribution {
  noun: number;
  verb: number;
  adj: number;
  other: number;
  total: number;
}

export function posDistribution(orchard: SealedHaiku[]): PosDistribution {
  const dist: PosDistribution = { noun: 0, verb: 0, adj: 0, other: 0, total: 0 };
  for (const h of orchard.filter((x) => !x.withered)) {
    for (const line of h.lines) {
      for (const t of line.beads) {
        dist.total += 1;
        if (t === "N" || t === "NP") dist.noun += 1;
        else if (t === "V" || t === "VP") dist.verb += 1;
        else if (t === "ADJ") dist.adj += 1;
        else dist.other += 1;
      }
    }
  }
  return dist;
}

export interface Signature {
  en: string;
  jp: string;
  tags: string[];
}

// Local-stats fallback for the Overview's Signature section. No AI backend
// is wired up in this build (Section 10 of the main spec notes direct
// client-side Anthropic calls hit CORS and require a server-side proxy);
// this pure-stats version is deliberately what runs when aiAssistance is
// off, offline mode is on, or no proxy is configured — never a network call.
export function localSignature(orchard: SealedHaiku[]): Signature | null {
  const sealed = orchard.filter((h) => !h.withered);
  if (sealed.length === 0) return null;

  const lex = lexicon(orchard).slice(0, 5);
  const dist = posDistribution(orchard);
  const dominant =
    dist.noun >= dist.verb && dist.noun >= dist.adj
      ? "image-driven, noun-heavy"
      : dist.verb >= dist.adj
      ? "motion-driven, verb-heavy"
      : "texture-driven, adjective-heavy";

  const topWords = lex.map((e) => e.text).slice(0, 3).join(", ");
  const en = `Across ${sealed.length} sealed haiku, the recurring language leans ${dominant}. The words that return most often are ${topWords || "still emerging"} — a signal of where attention keeps settling.`;
  const jp = `${sealed.length}句の中で、${topWords || "まだ定まらない言葉"}という言葉が繰り返し現れています。`;

  const tags: string[] = [];
  if (dist.noun >= dist.verb && dist.noun >= dist.adj) tags.push("image-driven");
  if (dist.verb > dist.noun * 0.6) tags.push("restless motion");
  if (lex.some((e) => /dissolv|fade|ash|silence/.test(e.text))) tags.push("quiet erosion");
  if (lex.some((e) => /mirror|reflect|glass/.test(e.text))) tags.push("reflective surfaces");
  if (tags.length < 3) tags.push("gently loose");
  return { en, jp, tags: tags.slice(0, 4) };
}
