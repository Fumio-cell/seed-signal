import type { SeedTemplate, Theme } from "../types";

// Hand-written bilingual vocabulary pools, 16 entries each.
// Recurring motifs drawn from the author's existing haiku:
// mirror, dissolve, silence, signal, threshold, ash, seed.

export const PRESET_THEMES: Theme[] = [
  {
    key: "現代の狂気",
    en: "modern madness",
    seeds: [
      { en: "neon prayer", jp: "ネオンの祈り", t: "NP" },
      { en: "the feed", jp: "フィード", t: "NP" },
      { en: "glass towers", jp: "硝子の塔", t: "NP" },
      { en: "static", jp: "静電気", t: "N" },
      { en: "a thousand faces", jp: "千の顔", t: "NP" },
      { en: "sirens", jp: "サイレン", t: "N" },
      { en: "midnight traffic", jp: "真夜中の車列", t: "NP" },
      { en: "devours", jp: "貪る", t: "V" },
      { en: "dissolves", jp: "溶けていく", t: "V" },
      { en: "hums", jp: "低く唸る", t: "V" },
      { en: "forgets to breathe", jp: "息を忘れる", t: "VP" },
      { en: "scrolls past heaven", jp: "天国を読み飛ばす", t: "VP" },
      { en: "sleepless", jp: "眠らない", t: "ADJ" },
      { en: "electric", jp: "電気仕掛けの", t: "ADJ" },
      { en: "hollow", jp: "うつろな", t: "ADJ" },
      { en: "blinking", jp: "明滅する", t: "ADJ" },
    ],
  },
  {
    key: "鏡と閾",
    en: "mirror and threshold",
    seeds: [
      { en: "the mirror", jp: "鏡", t: "NP" },
      { en: "a threshold", jp: "閾", t: "NP" },
      { en: "my other face", jp: "もう一つの顔", t: "NP" },
      { en: "a doorway", jp: "戸口", t: "N" },
      { en: "glass", jp: "硝子", t: "N" },
      { en: "between rooms", jp: "部屋のあいだ", t: "NP" },
      { en: "doubles", jp: "二重になる", t: "V" },
      { en: "waits", jp: "待っている", t: "V" },
      { en: "trembles", jp: "ふるえる", t: "V" },
      { en: "opens inward", jp: "内へひらく", t: "VP" },
      { en: "reflects nothing", jp: "何も映さない", t: "VP" },
      { en: "crosses over", jp: "越えてゆく", t: "VP" },
      { en: "silvered", jp: "銀めっきの", t: "ADJ" },
      { en: "unlit", jp: "灯らない", t: "ADJ" },
      { en: "thin", jp: "薄い", t: "ADJ" },
      { en: "half-open", jp: "半開きの", t: "ADJ" },
    ],
  },
  {
    key: "静寂の信号",
    en: "signal in silence",
    seeds: [
      { en: "a signal", jp: "信号", t: "N" },
      { en: "silence", jp: "静寂", t: "N" },
      { en: "an antenna", jp: "アンテナ", t: "N" },
      { en: "the last station", jp: "最後の局", t: "NP" },
      { en: "white noise", jp: "ホワイトノイズ", t: "NP" },
      { en: "morse of rain", jp: "雨のモールス", t: "NP" },
      { en: "transmits", jp: "送信する", t: "V" },
      { en: "listens", jp: "耳を澄ます", t: "V" },
      { en: "fades", jp: "薄れる", t: "V" },
      { en: "carries the dark", jp: "闇を運ぶ", t: "VP" },
      { en: "hums in the wires", jp: "電線に唸る", t: "VP" },
      { en: "answers no one", jp: "誰にも応えない", t: "VP" },
      { en: "faint", jp: "かすかな", t: "ADJ" },
      { en: "wordless", jp: "言葉のない", t: "ADJ" },
      { en: "distant", jp: "遠い", t: "ADJ" },
      { en: "still", jp: "静かな", t: "ADJ" },
    ],
  },
  {
    key: "灰と種",
    en: "ash and seed",
    seeds: [
      { en: "ash", jp: "灰", t: "N" },
      { en: "a seed", jp: "種", t: "N" },
      { en: "dusk", jp: "夕暮れ", t: "N" },
      { en: "embers", jp: "燠火", t: "N" },
      { en: "silent seeds", jp: "沈黙の種子", t: "NP" },
      { en: "the orchard", jp: "果樹園", t: "NP" },
      { en: "a green wick", jp: "緑の灯芯", t: "NP" },
      { en: "unseals", jp: "ひらかれる", t: "V" },
      { en: "scatters", jp: "散らす", t: "V" },
      { en: "kindles", jp: "燃えつく", t: "V" },
      { en: "spills tiny worlds", jp: "小さな世界をこぼす", t: "VP" },
      { en: "sleeps underground", jp: "地中に眠る", t: "VP" },
      { en: "waits for rain", jp: "雨を待つ", t: "VP" },
      { en: "burnt", jp: "焼けた", t: "ADJ" },
      { en: "pale", jp: "淡い", t: "ADJ" },
      { en: "unborn", jp: "生まれる前の", t: "ADJ" },
    ],
  },
];

// Fallback pool for user-planted custom themes, until AI-assisted
// vocabulary generation is available (requires a server-side proxy).
export const WANDERER_POOL: SeedTemplate[] = [
  { en: "the moment", jp: "その瞬間", t: "NP" },
  { en: "a small light", jp: "小さな灯", t: "NP" },
  { en: "the horizon", jp: "地平線", t: "NP" },
  { en: "the shore", jp: "岸", t: "NP" },
  { en: "water", jp: "水", t: "N" },
  { en: "a hand", jp: "手", t: "N" },
  { en: "breathes", jp: "呼吸する", t: "V" },
  { en: "drifts", jp: "漂う", t: "V" },
  { en: "remembers", jp: "憶えている", t: "V" },
  { en: "opens", jp: "ひらく", t: "V" },
  { en: "folds into night", jp: "夜へ折りたたむ", t: "VP" },
  { en: "returns as wind", jp: "風になって帰る", t: "VP" },
  { en: "unnamed", jp: "名のない", t: "ADJ" },
  { en: "quiet", jp: "しずかな", t: "ADJ" },
  { en: "first", jp: "はじめての", t: "ADJ" },
  { en: "far", jp: "遠くの", t: "ADJ" },
];

export function makeCustomTheme(text: string): Theme {
  return { key: text, en: text, seeds: WANDERER_POOL };
}
