import type { PartOfSpeech, SeedTemplate, Theme } from "../types";

// Generative surrealist vocabulary — the "exquisite corpse" engine.
//
// Instead of drawing from a fixed hand-written pool, each broken fruit
// COMPOSES fresh fragments at draw time by slotting curated word-atoms
// into part-of-speech-correct templates. The result is emergent: the
// player (and the author) meet phrases that have never existed before.
//
// Each theme carries its own WORLD — a wide associative field of words
// radiating out from the planted seed (a city of screens for "modern
// madness"; glass, doubling and thresholds for "mirror and threshold").
// That world is the backbone, so 20 fragments from one pomegranate feel
// like one coherent universe. A shared UNIVERSAL pool of cross-domain
// atoms then crashes in as foreign matter — the further the dial is
// turned, the more often a word from outside the theme's world appears,
// which is where the surreal "distant juxtaposition" spark comes from.
//
// A single `surreality` dial (0..1) drives, together:
//   1. foreign intrusion — how often UNIVERSAL words breach the world
//   2. template depth     — flat "a {adj} {noun}" → nested dream-grammar
//   3. impossible ratio   — concrete/known words → abstractions
//   4. anchoring          — at low values, raw theme seeds surface as anchors
//
// English is primary. Japanese is a loose reference gloss — glued from
// per-atom glosses without strict particle grammar, which at high
// surreality frays pleasantly rather than reading as a clean translation.
//
// Every composed fragment still carries a correct POS tag, so the
// grammar-physics attraction/repulsion system keeps working unchanged.

interface Word {
  en: string;
  jp: string;
}

interface Bank {
  concrete: Word[];
  abstract: Word[]; // mass-safe: reads well after "the" / "as" / with no article
  material: Word[];
  verbIntr: Word[]; // stored in 3rd-person "-s" form
  verbTrans: Word[];
  adj: Word[];
}

// Shared cross-domain atoms — the "foreign matter" that breaches a
// theme's world to strike a surreal spark. Deliberately not tied to any
// single theme.
const UNIVERSAL: Bank = {
  concrete: [
    { en: "clock", jp: "時計" },
    { en: "needle", jp: "針" },
    { en: "feather", jp: "羽根" },
    { en: "bell", jp: "鐘" },
    { en: "staircase", jp: "階段" },
    { en: "hand", jp: "手" },
    { en: "stone", jp: "石" },
    { en: "lamp", jp: "灯" },
    { en: "moth", jp: "蛾" },
    { en: "coin", jp: "硬貨" },
    { en: "hinge", jp: "蝶番" },
    { en: "thread", jp: "糸" },
  ],
  abstract: [
    { en: "forgetting", jp: "忘却" },
    { en: "longing", jp: "憧れ" },
    { en: "vertigo", jp: "眩暈" },
    { en: "memory", jp: "記憶" },
    { en: "sleep", jp: "眠り" },
    { en: "hunger", jp: "飢え" },
  ],
  material: [
    { en: "milk", jp: "乳" },
    { en: "honey", jp: "蜜" },
    { en: "salt", jp: "塩" },
    { en: "rust", jp: "錆" },
    { en: "snow", jp: "雪" },
    { en: "glass", jp: "硝子" },
    { en: "wax", jp: "蝋" },
  ],
  verbIntr: [
    { en: "dissolves", jp: "溶ける" },
    { en: "drifts", jp: "漂う" },
    { en: "unravels", jp: "ほどける" },
    { en: "breathes", jp: "呼吸する" },
    { en: "hums", jp: "唸る" },
    { en: "waits", jp: "待つ" },
  ],
  verbTrans: [
    { en: "remembers", jp: "憶えている" },
    { en: "translates", jp: "翻訳する" },
    { en: "devours", jp: "貪る" },
    { en: "counts", jp: "数える" },
    { en: "swallows", jp: "呑み込む" },
    { en: "carries", jp: "運ぶ" },
  ],
  adj: [
    { en: "luminous", jp: "発光する" },
    { en: "hollow", jp: "うつろな" },
    { en: "distant", jp: "遠い" },
    { en: "pale", jp: "淡い" },
    { en: "sleepless", jp: "眠らない" },
    { en: "wordless", jp: "言葉のない" },
  ],
};

// Special abstractions that only read well in a genitive "___ of X" slot
// ("the color of no one"), never after an article.
const SPECIAL: Word[] = [
  { en: "the dark", jp: "闇" },
  { en: "no one", jp: "誰も" },
  { en: "tomorrow", jp: "明日" },
  { en: "yesterday", jp: "昨日" },
  { en: "the moon", jp: "月" },
];

// The associative worlds — one wide field per planted seed. Keyed by the
// theme's `key` (matching data/themes.ts).
const WORLDS: Record<string, Bank> = {
  // 現代の狂気 — a city of screens, overstimulation, sleeplessness.
  現代の狂気: {
    concrete: [
      { en: "neon sign", jp: "ネオン看板" },
      { en: "the feed", jp: "フィード" },
      { en: "glass tower", jp: "硝子の塔" },
      { en: "siren", jp: "サイレン" },
      { en: "elevator", jp: "エレベーター" },
      { en: "screen", jp: "画面" },
      { en: "subway", jp: "地下鉄" },
      { en: "billboard", jp: "広告塔" },
      { en: "satellite", jp: "衛星" },
      { en: "escalator", jp: "エスカレーター" },
      { en: "headline", jp: "見出し" },
      { en: "crosswalk", jp: "横断歩道" },
    ],
    abstract: [
      { en: "the noise", jp: "騒音" },
      { en: "insomnia", jp: "不眠" },
      { en: "static", jp: "静電気" },
      { en: "panic", jp: "パニック" },
      { en: "boredom", jp: "倦怠" },
      { en: "dread", jp: "怖れ" },
    ],
    material: [
      { en: "neon", jp: "ネオン" },
      { en: "concrete", jp: "コンクリート" },
      { en: "plastic", jp: "プラスチック" },
      { en: "chrome", jp: "クロム" },
      { en: "exhaust", jp: "排気" },
      { en: "smoke", jp: "煙" },
    ],
    verbIntr: [
      { en: "flickers", jp: "明滅する" },
      { en: "buzzes", jp: "唸る" },
      { en: "refreshes", jp: "更新する" },
      { en: "overheats", jp: "過熱する" },
      { en: "scrolls", jp: "流れていく" },
      { en: "glitches", jp: "乱れる" },
    ],
    verbTrans: [
      { en: "devours", jp: "貪る" },
      { en: "sells", jp: "売る" },
      { en: "floods", jp: "溢れさせる" },
      { en: "forgets", jp: "忘れる" },
      { en: "broadcasts", jp: "放送する" },
    ],
    adj: [
      { en: "sleepless", jp: "眠らない" },
      { en: "electric", jp: "電気の" },
      { en: "fluorescent", jp: "蛍光の" },
      { en: "frantic", jp: "半狂乱の" },
      { en: "numb", jp: "麻痺した" },
      { en: "blinking", jp: "明滅する" },
    ],
  },
  // 鏡と閾 — reflection, doubling, doorways, the liminal.
  鏡と閾: {
    concrete: [
      { en: "the mirror", jp: "鏡" },
      { en: "a doorway", jp: "戸口" },
      { en: "the threshold", jp: "閾" },
      { en: "a hallway", jp: "廊下" },
      { en: "a reflection", jp: "映り" },
      { en: "a twin", jp: "双子" },
      { en: "the far room", jp: "奥の部屋" },
      { en: "a keyhole", jp: "鍵穴" },
      { en: "a windowpane", jp: "窓硝子" },
      { en: "a curtain", jp: "帳" },
      { en: "the other face", jp: "もう一つの顔" },
    ],
    abstract: [
      { en: "reflection", jp: "反映" },
      { en: "absence", jp: "不在" },
      { en: "silence", jp: "静寂" },
      { en: "symmetry", jp: "対称" },
      { en: "doubt", jp: "疑い" },
      { en: "the reverse", jp: "裏" },
    ],
    material: [
      { en: "glass", jp: "硝子" },
      { en: "silver", jp: "銀" },
      { en: "mercury", jp: "水銀" },
      { en: "water", jp: "水" },
      { en: "frost", jp: "霜" },
      { en: "mist", jp: "靄" },
    ],
    verbIntr: [
      { en: "doubles", jp: "二重になる" },
      { en: "reflects", jp: "映る" },
      { en: "trembles", jp: "ふるえる" },
      { en: "opens", jp: "ひらく" },
      { en: "reverses", jp: "反転する" },
      { en: "dims", jp: "翳る" },
    ],
    verbTrans: [
      { en: "mirrors", jp: "映す" },
      { en: "forgets", jp: "忘れる" },
      { en: "swallows", jp: "呑み込む" },
      { en: "undoes", jp: "解く" },
      { en: "doubles", jp: "二重にする" },
    ],
    adj: [
      { en: "silvered", jp: "銀めっきの" },
      { en: "half-open", jp: "半開きの" },
      { en: "unlit", jp: "灯らない" },
      { en: "reversed", jp: "反転した" },
      { en: "thin", jp: "薄い" },
      { en: "wordless", jp: "言葉のない" },
    ],
  },
  // 静寂の信号 — radio, transmission, distance, listening.
  静寂の信号: {
    concrete: [
      { en: "an antenna", jp: "アンテナ" },
      { en: "the last station", jp: "最後の局" },
      { en: "a wire", jp: "電線" },
      { en: "a receiver", jp: "受信機" },
      { en: "morse", jp: "モールス" },
      { en: "a frequency", jp: "周波数" },
      { en: "the dial", jp: "ダイヤル" },
      { en: "a beacon", jp: "灯台" },
      { en: "a transmitter", jp: "送信機" },
      { en: "an echo", jp: "こだま" },
      { en: "a wavelength", jp: "波長" },
    ],
    abstract: [
      { en: "silence", jp: "静寂" },
      { en: "static", jp: "静電気" },
      { en: "distance", jp: "隔たり" },
      { en: "the signal", jp: "信号" },
      { en: "absence", jp: "不在" },
      { en: "the void", jp: "虚空" },
    ],
    material: [
      { en: "static", jp: "静電気" },
      { en: "copper", jp: "銅" },
      { en: "rain", jp: "雨" },
      { en: "snow", jp: "雪" },
      { en: "wire", jp: "電線" },
      { en: "noise", jp: "雑音" },
    ],
    verbIntr: [
      { en: "transmits", jp: "送信する" },
      { en: "listens", jp: "耳を澄ます" },
      { en: "fades", jp: "薄れる" },
      { en: "hums", jp: "唸る" },
      { en: "crackles", jp: "ざわめく" },
      { en: "drifts", jp: "漂う" },
    ],
    verbTrans: [
      { en: "carries", jp: "運ぶ" },
      { en: "transmits", jp: "送信する" },
      { en: "answers", jp: "応える" },
      { en: "forgets", jp: "忘れる" },
      { en: "receives", jp: "受け取る" },
      { en: "echoes", jp: "反響させる" },
    ],
    adj: [
      { en: "faint", jp: "かすかな" },
      { en: "wordless", jp: "言葉のない" },
      { en: "distant", jp: "遠い" },
      { en: "still", jp: "静かな" },
      { en: "encoded", jp: "暗号化された" },
      { en: "unanswered", jp: "応えられない" },
    ],
  },
  // 灰と種 — fire, soil, dormancy, the orchard's slow cycle.
  灰と種: {
    concrete: [
      { en: "ash", jp: "灰" },
      { en: "a seed", jp: "種" },
      { en: "the orchard", jp: "果樹園" },
      { en: "an ember", jp: "燠火" },
      { en: "the soil", jp: "土" },
      { en: "a green wick", jp: "緑の灯芯" },
      { en: "a root", jp: "根" },
      { en: "a furrow", jp: "畝" },
      { en: "the harvest", jp: "収穫" },
      { en: "a husk", jp: "殻" },
      { en: "a sapling", jp: "若木" },
    ],
    abstract: [
      { en: "dusk", jp: "夕暮れ" },
      { en: "dormancy", jp: "休眠" },
      { en: "hunger", jp: "飢え" },
      { en: "patience", jp: "忍耐" },
      { en: "decay", jp: "腐朽" },
      { en: "silence", jp: "静寂" },
    ],
    material: [
      { en: "ash", jp: "灰" },
      { en: "soil", jp: "土" },
      { en: "smoke", jp: "煙" },
      { en: "sap", jp: "樹液" },
      { en: "char", jp: "焦げ" },
      { en: "rain", jp: "雨" },
    ],
    verbIntr: [
      { en: "kindles", jp: "燃えつく" },
      { en: "scatters", jp: "散らばる" },
      { en: "sprouts", jp: "芽吹く" },
      { en: "smolders", jp: "くすぶる" },
      { en: "sleeps", jp: "眠る" },
      { en: "waits", jp: "待つ" },
    ],
    verbTrans: [
      { en: "scatters", jp: "散らす" },
      { en: "buries", jp: "埋める" },
      { en: "kindles", jp: "燃やす" },
      { en: "feeds", jp: "養う" },
      { en: "unseals", jp: "ひらく" },
    ],
    adj: [
      { en: "burnt", jp: "焼けた" },
      { en: "unborn", jp: "生まれる前の" },
      { en: "pale", jp: "淡い" },
      { en: "dormant", jp: "眠っている" },
      { en: "charred", jp: "炭化した" },
      { en: "buried", jp: "埋もれた" },
    ],
  },
};

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]): T => arr[rand(arr.length)];
const chance = (p: number) => Math.random() < p;

// "a" / "an" by the leading sound of the following word.
const art = (en: string) => (/^[aeiou]/i.test(en) ? "an" : "a");

// Bare-infinitive form of an intransitive verb (the bank stores the
// 3rd-person "-s" form) for templates like "forgets to ___".
const baseOf = (en: string) => en.replace(/s$/, "");

// Strip a leading article so a template can supply its own determiner
// without doubling up ("a beacon" → "beacon" → "an old beacon").
const bare = (en: string) => en.replace(/^(a|an|the)\s+/i, "");

type Kind = keyof Bank;

// Draw a word of the given kind. Stays inside the theme's WORLD unless
// surreality lets a foreign UNIVERSAL atom breach it (lever #1). At the
// dial's top, foreign matter reaches ~50% — the world always keeps at
// least half its own gravity, so 20 fragments still cohere.
function word(kind: Kind, world: Bank | null, s: number): Word {
  const foreign = !world || chance(s * 0.5);
  const pool = foreign ? UNIVERSAL[kind] : world[kind];
  return pick(pool.length ? pool : UNIVERSAL[kind]);
}

// A noun slot: the higher the surreality, the more often the concrete
// gives way to the abstract — lever #3. Standalone nouns stay mass-safe.
const nounWord = (world: Bank | null, s: number): Word =>
  chance(0.15 + s * 0.55) ? word("abstract", world, s) : word("concrete", world, s);

// A genitive object ("___ of X") — occasionally reaches for the SPECIAL
// abstractions that only work in this slot.
const genitive = (world: Bank | null, s: number): Word =>
  chance(0.3) ? pick(SPECIAL) : word("abstract", world, s);

// Pick a template tier (0 flat, 1 folded, 2 dream-grammar) weighted by s.
function tier(s: number): 0 | 1 | 2 {
  const w0 = Math.max(0.02, 1 - s * 1.7);
  const w1 = 1 - Math.abs(s - 0.5) * 1.3;
  const w2 = Math.max(0, s * 1.7 - 0.5);
  const r = Math.random() * (w0 + w1 + w2);
  if (r < w0) return 0;
  if (r < w0 + w1) return 1;
  return 2;
}

interface Frag {
  en: string;
  jp: string;
}

function makeNP(world: Bank | null, s: number): Frag {
  const c = word("concrete", world, s);
  const bc = bare(c.en);
  const a = word("adj", world, s);
  const m = word("material", world, s);
  const ab = genitive(world, s);
  const vi = word("verbIntr", world, s);
  switch (tier(s)) {
    case 0:
      return chance(0.5)
        ? { en: `${art(a.en)} ${a.en} ${bc}`, jp: `${a.jp}${c.jp}` }
        : { en: `the ${bc}`, jp: `${c.jp}` };
    case 1:
      return pick([
        { en: `${art(bc)} ${bc} of ${m.en}`, jp: `${m.jp}の${c.jp}` },
        { en: `the ${bc} of ${ab.en}`, jp: `${ab.jp}の${c.jp}` },
        { en: `${bc} made of ${m.en}`, jp: `${m.jp}でできた${c.jp}` },
      ]);
    default:
      return pick([
        { en: `the ${bc} of ${ab.en} that never ${vi.en}`, jp: `決して${vi.jp}ない${ab.jp}の${c.jp}` },
        { en: `${art(bc)} ${bc} remembering ${m.en}`, jp: `${m.jp}を憶えている${c.jp}` },
        { en: `the color of ${ab.en}`, jp: `${ab.jp}の色` },
      ]);
  }
}

function makeVP(world: Bank | null, s: number): Frag {
  const c = word("concrete", world, s);
  const bc = bare(c.en);
  const ab = genitive(world, s);
  const mass = word("abstract", world, s);
  const m = word("material", world, s);
  const vt = word("verbTrans", world, s);
  const vi = word("verbIntr", world, s);
  switch (tier(s)) {
    case 0:
      return { en: `${vt.en} the ${bc}`, jp: `${c.jp}を${vt.jp}` };
    case 1:
      return chance(0.5)
        ? { en: `${vt.en} the ${bare(mass.en)}`, jp: `${mass.jp}を${vt.jp}` }
        : { en: `${vi.en} into ${m.en}`, jp: `${m.jp}へ${vi.jp}` };
    default:
      return pick([
        { en: `${vt.en} its own ${bc}`, jp: `自らの${c.jp}を${vt.jp}` },
        { en: `${vi.en} into the color of ${ab.en}`, jp: `${ab.jp}の色へ${vi.jp}` },
        { en: `forgets to ${baseOf(vi.en)}`, jp: `${vi.jp}のを忘れる` },
      ]);
  }
}

function makeADJ(world: Bank | null, s: number): Frag {
  const a = word("adj", world, s);
  const c = word("concrete", world, s);
  const mass = word("abstract", world, s);
  const m = word("material", world, s);
  switch (tier(s)) {
    case 0:
      return { en: a.en, jp: a.jp };
    case 1: {
      const bc = bare(c.en);
      return { en: `${a.en} as ${art(bc)} ${bc}`, jp: `${c.jp}のように${a.jp}` };
    }
    default:
      return chance(0.5)
        ? { en: `${a.en} as ${mass.en}`, jp: `${mass.jp}のように${a.jp}` }
        : { en: `made of ${m.en}`, jp: `${m.jp}でできた` };
  }
}

// Weighted plan of POS slots to fill for one break. Haiku lives on
// images, so the pool leans noun-heavy (~56%), with verbs the scarcer
// pivot (~24%) and adjectives the seasoning (~20%).
const POS_WEIGHTS: [PartOfSpeech, number][] = [
  ["NP", 0.38],
  ["N", 0.18],
  ["VP", 0.16],
  ["V", 0.08],
  ["ADJ", 0.2],
];

function planPos(): PartOfSpeech {
  const total = POS_WEIGHTS.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [t, w] of POS_WEIGHTS) {
    if ((r -= w) <= 0) return t;
  }
  return "NP";
}

function composeFor(t: PartOfSpeech, world: Bank | null, s: number): Frag {
  switch (t) {
    case "NP":
      return makeNP(world, s);
    case "N":
      return nounWord(world, s);
    case "VP":
      return makeVP(world, s);
    case "V":
      return word("verbIntr", world, s);
    case "ADJ":
      return makeADJ(world, s);
  }
}

// A raw anchor from the theme's own hand-written seeds — surfaced more
// often at low surreality so the theme keeps its identity and grounded
// footing. Returns null when the theme has no seed of that POS.
function anchor(theme: Theme, t: PartOfSpeech): SeedTemplate | null {
  const matches = theme.seeds.filter((sd) => sd.t === t);
  return matches.length ? pick(matches) : null;
}

/**
 * Generate `n` fresh surreal fragments for a broken fruit.
 *
 * @param theme      the planted theme (its world + seeds shape the words)
 * @param n          how many fragments to produce
 * @param surreality 0..1 dial — 0 grounded/poetic, 1 dream-logic
 */
export function generateSeeds(theme: Theme, n: number, surreality: number): SeedTemplate[] {
  const s = Math.max(0, Math.min(1, surreality));
  const world = WORLDS[theme.key] ?? null;
  const out: SeedTemplate[] = [];
  const seen = new Set<string>();
  let guard = 0;

  while (out.length < n && guard < n * 12) {
    guard++;
    const t = planPos();

    // Anchor probability falls off as the dial rises.
    let frag: Frag | null = null;
    if (chance((1 - s) * 0.55)) {
      const a = anchor(theme, t);
      if (a) frag = { en: a.en, jp: a.jp };
    }
    if (!frag) frag = composeFor(t, world, s);

    const key = frag.en.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ en: frag.en, jp: frag.jp, t });
  }

  return out;
}
