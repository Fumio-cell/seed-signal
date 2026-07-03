import type { PartOfSpeech } from "../types";

// Part-of-speech relation table. A hint system, not a hard constraint —
// the user can always force an unnatural combination.
export const RELATION_RULES: Record<string, 1 | 0 | -1> = {
  ADJ_N: 1, N_ADJ: 1, ADJ_NP: 1, NP_ADJ: 1, // attraction
  N_V: 1, V_N: 1, NP_V: 1, V_NP: 1,
  NP_VP: 1, VP_NP: 1,
  ADJ_VP: 0, VP_ADJ: 0, N_NP: 0, NP_N: 0, // neutral
  VP_VP: -1, V_V: -1, ADJ_ADJ: -1, N_N: -1, NP_NP: -1, // repulsion
};

export function relate(a: PartOfSpeech, b: PartOfSpeech): 1 | 0 | -1 {
  return RELATION_RULES[`${a}_${b}`] ?? 0;
}

// Infer the tag of a combined phrase so that chains of three or more
// fragments continue to interact sensibly.
export function combinedTag(a: PartOfSpeech, b: PartOfSpeech): PartOfSpeech {
  const noun = (t: PartOfSpeech) => t === "N" || t === "NP";
  const verb = (t: PartOfSpeech) => t === "V" || t === "VP";
  if (a === "ADJ" && noun(b)) return "NP";
  if (noun(a) && b === "ADJ") return "NP";
  if (noun(a) && verb(b)) return "VP";
  if (verb(a) && noun(b)) return "VP";
  if (noun(a) && noun(b)) return "NP";
  if (verb(a) || verb(b)) return "VP";
  return b;
}

export function lineTag(tags: PartOfSpeech[]): PartOfSpeech | null {
  if (tags.length === 0) return null;
  return tags.reduce((acc, t) => combinedTag(acc, t));
}

export interface RelationFeedback {
  cls: "attract" | "neutral" | "repel";
  msg: string;
}

export function relationFeedback(rel: 1 | 0 | -1): RelationFeedback {
  if (rel === 1) return { cls: "attract", msg: "✦ 詩的に自然" };
  if (rel === -1) return { cls: "repel", msg: "△ 文法的に不安定" };
  return { cls: "neutral", msg: "○ 成立する" };
}
