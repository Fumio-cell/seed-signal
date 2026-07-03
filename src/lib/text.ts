// Small text helpers shared across Orchard search, Detail view, and Overview.

export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

// Rough English syllable estimate (vowel-group count with a couple of
// standard corrections). "Gently loose" by design — a nudge, not a rule.
export function countSyllables(text: string): number {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  let total = 0;
  for (const w of words) {
    let n = (w.match(/[aeiouy]+/g) ?? []).length;
    if (w.endsWith("e") && !w.endsWith("le") && n > 1) n -= 1;
    total += Math.max(1, n);
  }
  return total;
}

export interface HighlightPart {
  text: string;
  match: boolean;
}

export function highlightMatches(text: string, query: string): HighlightPart[] {
  if (!query.trim()) return [{ text, match: false }];
  const q = query.toLowerCase();
  const lower = text.toLowerCase();
  const parts: HighlightPart[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      parts.push({ text: text.slice(i), match: false });
      break;
    }
    if (idx > i) parts.push({ text: text.slice(i, idx), match: false });
    parts.push({ text: text.slice(idx, idx + q.length), match: true });
    i = idx + q.length;
  }
  return parts;
}

const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "in", "on", "at", "into", "no", "not",
]);

export function stem(word: string): string {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3);
  if (w.endsWith("es") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && w.length > 3) return w.slice(0, -1);
  return w;
}

export function significantWords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]+/g) ?? []).filter(
    (w) => w.length > 2 && !STOPWORDS.has(w)
  );
}
