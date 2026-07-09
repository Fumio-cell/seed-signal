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
    { en: "key", jp: "鍵" },
    { en: "ladder", jp: "梯子" },
    { en: "compass", jp: "羅針盤" },
    { en: "map", jp: "地図" },
    { en: "photograph", jp: "写真" },
    { en: "bridge", jp: "橋" },
    { en: "suitcase", jp: "旅行鞄" },
    { en: "umbrella", jp: "傘" },
    { en: "pulse", jp: "鼓動" },
    { en: "shell", jp: "貝殻" },
    { en: "bone", jp: "骨" },
    { en: "spark", jp: "火花" },
    // nature
    { en: "comet", jp: "彗星" },
    { en: "glacier", jp: "氷河" },
    { en: "canyon", jp: "峡谷" },
    { en: "coral reef", jp: "珊瑚礁" },
    { en: "tide pool", jp: "潮だまり" },
    { en: "wildfire", jp: "山火事" },
    { en: "meadow", jp: "草原" },
    // music
    { en: "violin", jp: "ヴァイオリン" },
    { en: "metronome", jp: "メトロノーム" },
    // art
    { en: "canvas", jp: "キャンバス" },
    { en: "easel", jp: "イーゼル" },
    { en: "palette", jp: "パレット" },
    { en: "gallery", jp: "画廊" },
    { en: "paintbrush", jp: "絵筆" },
    // science
    { en: "telescope", jp: "望遠鏡" },
    { en: "microscope", jp: "顕微鏡" },
    // weather
    { en: "a thunderstorm", jp: "雷雨" },
    { en: "a rainbow", jp: "虹" },
    { en: "a raincloud", jp: "雨雲" },
    { en: "a snowdrift", jp: "雪の吹き溜まり" },
    { en: "a heat wave", jp: "熱波" },
    { en: "a cold front", jp: "寒冷前線" },
    // body / gesture
    { en: "a heartbeat", jp: "鼓動" },
    { en: "a fingertip", jp: "指先" },
    { en: "a shoulder", jp: "肩" },
    { en: "an open palm", jp: "開いた掌" },
    { en: "a closed fist", jp: "握られた拳" },
    { en: "a footstep", jp: "足音" },
    { en: "an eyelid", jp: "まぶた" },
    { en: "a wrist", jp: "手首" },
    // states of mind, spoken around rather than named
    { en: "a walking sleep", jp: "歩く眠り" },
    { en: "a missing hour", jp: "失われた一時間" },
    // butoh / gagaku / zen / abstract art
    { en: "a fermata", jp: "延音記号" },
    { en: "a raked garden", jp: "砂紋の庭" },
    { en: "an empty bowl", jp: "空の器" },
    { en: "a palimpsest", jp: "上書きされた羊皮紙" },
    { en: "a whitened body", jp: "白塗りの体" },
    { en: "a slow gesture", jp: "ゆるやかな身振り" },
    { en: "a paper screen", jp: "紙の衝立" },
    { en: "a court flute", jp: "篳篥" },
    // food / fermentation
    { en: "a loaf of bread", jp: "一斤のパン" },
    { en: "a jar of preserves", jp: "保存瓶の中の果実" },
    { en: "a mortar and pestle", jp: "すり鉢とすりこぎ" },
  ],
  abstract: [
    { en: "forgetting", jp: "忘却" },
    { en: "longing", jp: "憧れ" },
    { en: "vertigo", jp: "眩暈" },
    { en: "memory", jp: "記憶" },
    { en: "sleep", jp: "眠り" },
    { en: "hunger", jp: "飢え" },
    { en: "grief", jp: "悲嘆" },
    { en: "wonder", jp: "驚異" },
    { en: "restlessness", jp: "落ち着かなさ" },
    { en: "gravity", jp: "重力" },
    { en: "time", jp: "時間" },
    { en: "curiosity", jp: "好奇心" },
    // nature / science
    { en: "orbit", jp: "軌道" },
    { en: "entropy", jp: "エントロピー" },
    { en: "migration", jp: "渡り" },
    { en: "evolution", jp: "進化" },
    { en: "resonance", jp: "共鳴" },
    { en: "refraction", jp: "屈折" },
    { en: "the spectrum", jp: "スペクトル" },
    // music
    { en: "harmony", jp: "調和" },
    { en: "dissonance", jp: "不協和音" },
    { en: "rhythm", jp: "リズム" },
    { en: "cadence", jp: "韻律" },
    // weather
    { en: "humidity", jp: "湿気" },
    { en: "drought", jp: "干ばつ" },
    { en: "the forecast", jp: "予報" },
    // body
    { en: "breath", jp: "息" },
    { en: "warmth", jp: "温もり" },
    { en: "fatigue", jp: "疲労" },
    { en: "balance", jp: "均衡" },
    // modern coinages with staying power
    { en: "sonder", jp: "他者の人生への気づき" },
    { en: "solastalgia", jp: "失われゆく風景への郷愁" },
    { en: "touch starvation", jp: "触れ合いへの飢え" },
    // states of mind, spoken around rather than named
    { en: "a leaving of the self", jp: "自己からの離脱" },
    { en: "the flatness", jp: "平板さ" },
    { en: "sleepless watching", jp: "眠らぬ見張り" },
    { en: "an unbidden flight", jp: "呼ばれざる逃走" },
    // butoh / gagaku / zen / abstract art
    { en: "the interval", jp: "間" },
    { en: "impermanence", jp: "無常" },
    { en: "wabi-sabi", jp: "侘寂" },
    { en: "negative space", jp: "余白" },
    { en: "automatism", jp: "自動筆記" },
    { en: "an afterimage", jp: "残像" },
    // food / fermentation
    { en: "fermentation", jp: "発酵" },
    { en: "umami", jp: "旨味" },
    { en: "nourishment", jp: "滋養" },
  ],
  material: [
    { en: "milk", jp: "乳" },
    { en: "honey", jp: "蜜" },
    { en: "salt", jp: "塩" },
    { en: "rust", jp: "錆" },
    { en: "snow", jp: "雪" },
    { en: "glass", jp: "硝子" },
    { en: "wax", jp: "蝋" },
    { en: "sand", jp: "砂" },
    { en: "ink", jp: "インク" },
    { en: "steam", jp: "湯気" },
    { en: "gold", jp: "金" },
    { en: "iron", jp: "鉄" },
    { en: "oil", jp: "油" },
    // nature / science
    { en: "stardust", jp: "星屑" },
    { en: "limestone", jp: "石灰岩" },
    { en: "coral", jp: "珊瑚" },
    { en: "amber", jp: "琥珀" },
    { en: "ozone", jp: "オゾン" },
    { en: "moss", jp: "苔" },
    // art
    { en: "pigment", jp: "顔料" },
    { en: "graphite", jp: "黒鉛" },
    // weather
    { en: "hail", jp: "雹" },
    { en: "sleet", jp: "みぞれ" },
    { en: "lightning", jp: "稲妻" },
    { en: "haze", jp: "霞" },
    // body
    { en: "sweat", jp: "汗" },
    { en: "tears", jp: "涙" },
    // food / fermentation
    { en: "yeast", jp: "酵母" },
    { en: "brine", jp: "塩水" },
    { en: "vinegar", jp: "酢" },
    { en: "dough", jp: "生地" },
    { en: "broth", jp: "出汁" },
    { en: "whey", jp: "乳清" },
  ],
  verbIntr: [
    { en: "dissolves", jp: "溶ける" },
    { en: "drifts", jp: "漂う" },
    { en: "unravels", jp: "ほどける" },
    { en: "breathes", jp: "呼吸する" },
    { en: "hums", jp: "唸る" },
    { en: "waits", jp: "待つ" },
    { en: "wanders", jp: "彷徨う" },
    { en: "lingers", jp: "居残る" },
    { en: "unfolds", jp: "ひらいていく" },
    { en: "settles", jp: "落ち着く" },
    { en: "aches", jp: "疼く" },
    { en: "wakes", jp: "目覚める" },
    // nature / science
    { en: "orbits", jp: "軌道を巡る" },
    { en: "resonates", jp: "共鳴する" },
    { en: "migrates", jp: "渡る" },
    { en: "crystallizes", jp: "結晶化する" },
    { en: "oscillates", jp: "振動する" },
    { en: "erodes", jp: "浸食する" },
    { en: "corrodes", jp: "腐食する" },
    { en: "evaporates", jp: "蒸発する" },
    // music
    { en: "harmonizes", jp: "調和する" },
    // weather
    { en: "thunders", jp: "雷鳴が轟く" },
    { en: "clears up", jp: "晴れる" },
    { en: "clouds over", jp: "曇る" },
    // body
    { en: "trembles", jp: "ふるえる" },
    { en: "stretches", jp: "伸びをする" },
    { en: "shivers", jp: "身震いする" },
    { en: "stumbles", jp: "よろめく" },
    // states of mind, spoken around rather than named
    { en: "steps outside itself", jp: "自分の外へ踏み出す" },
    { en: "runs toward the open", jp: "開けた場所へ走り出す" },
    { en: "goes still inside", jp: "内側で静まり返る" },
    // butoh / gagaku / zen / abstract art
    { en: "bows", jp: "礼をする" },
    { en: "holds still", jp: "静止したままでいる" },
    // food / fermentation
    { en: "ferments", jp: "発酵する" },
    { en: "rises", jp: "膨らむ" },
    { en: "sours", jp: "酸っぱくなる" },
    { en: "steeps", jp: "浸る" },
  ],
  verbTrans: [
    { en: "remembers", jp: "憶えている" },
    { en: "translates", jp: "翻訳する" },
    { en: "devours", jp: "貪る" },
    { en: "counts", jp: "数える" },
    { en: "swallows", jp: "呑み込む" },
    { en: "carries", jp: "運ぶ" },
    { en: "measures", jp: "測る" },
    { en: "collects", jp: "集める" },
    { en: "haunts", jp: "つきまとう" },
    { en: "misplaces", jp: "置き忘れる" },
    { en: "shelters", jp: "守る" },
    // art / science
    { en: "catalogs", jp: "目録にする" },
    { en: "captures", jp: "捉える" },
    { en: "composes", jp: "作曲する" },
    { en: "sketches", jp: "描く" },
    { en: "calibrates", jp: "較正する" },
    { en: "illuminates", jp: "照らす" },
    { en: "orchestrates", jp: "編成する" },
    // weather
    { en: "soaks", jp: "びしょ濡れにする" },
    { en: "chills", jp: "冷やす" },
    // body
    { en: "embraces", jp: "抱きしめる" },
    { en: "cradles", jp: "抱える" },
    { en: "releases", jp: "解き放つ" },
    // modern
    { en: "ghosts", jp: "音信を絶つ" },
    { en: "gaslights", jp: "偽りの現実を信じ込ませる" },
    { en: "triggers", jp: "引き起こす" },
    // butoh / gagaku / zen / abstract art
    { en: "suspends", jp: "宙吊りにする" },
    { en: "erases", jp: "消し去る" },
    { en: "frames", jp: "縁取る" },
    // food / fermentation
    { en: "preserves", jp: "保存する" },
    { en: "kneads", jp: "こねる" },
    { en: "seasons", jp: "味付けする" },
  ],
  adj: [
    { en: "luminous", jp: "発光する" },
    { en: "hollow", jp: "うつろな" },
    { en: "distant", jp: "遠い" },
    { en: "pale", jp: "淡い" },
    { en: "sleepless", jp: "眠らない" },
    { en: "wordless", jp: "言葉のない" },
    { en: "weightless", jp: "重さのない" },
    { en: "unfinished", jp: "未完成の" },
    { en: "borrowed", jp: "借り物の" },
    { en: "restless", jp: "落ち着かない" },
    { en: "quiet", jp: "静かな" },
    { en: "unfamiliar", jp: "見慣れない" },
    // color
    { en: "crimson", jp: "紅色の" },
    { en: "cobalt", jp: "コバルト色の" },
    { en: "amber", jp: "琥珀色の" },
    { en: "ochre", jp: "黄土色の" },
    { en: "violet", jp: "菫色の" },
    { en: "indigo", jp: "藍色の" },
    { en: "azure", jp: "空色の" },
    { en: "verdant", jp: "緑豊かな" },
    // science
    { en: "atomic", jp: "原子の" },
    { en: "prismatic", jp: "虹色の" },
    { en: "luminescent", jp: "発光する" },
    { en: "magnetic", jp: "磁力を帯びた" },
    { en: "microscopic", jp: "微小な" },
    { en: "crystalline", jp: "結晶の" },
    // music
    { en: "dissonant", jp: "不協和な" },
    { en: "harmonic", jp: "調和的な" },
    // weather
    { en: "overcast", jp: "曇った" },
    { en: "windswept", jp: "風にさらされた" },
    { en: "humid", jp: "湿った" },
    { en: "frostbitten", jp: "凍傷を負った" },
    // body
    { en: "trembling", jp: "ふるえる" },
    { en: "weary", jp: "疲れきった" },
    { en: "barefoot", jp: "裸足の" },
    { en: "breathless", jp: "息を切らした" },
    // sight
    { en: "vivid", jp: "鮮やかな" },
    { en: "hazy", jp: "霞んだ" },
    { en: "glaring", jp: "まぶしい" },
    { en: "dim", jp: "薄暗い" },
    { en: "shimmering", jp: "きらめく" },
    { en: "gleaming", jp: "光り輝く" },
    { en: "murky", jp: "濁った" },
    { en: "radiant", jp: "光り輝く" },
    // hearing
    { en: "shrill", jp: "甲高い" },
    { en: "muffled", jp: "くぐもった" },
    { en: "resonant", jp: "響き渡る" },
    { en: "deafening", jp: "耳をつんざく" },
    { en: "tinny", jp: "金属的に響く" },
    { en: "booming", jp: "轟く" },
    { en: "ringing", jp: "鳴り響く" },
    // touch
    { en: "rough", jp: "ざらついた" },
    { en: "smooth", jp: "滑らかな" },
    { en: "velvety", jp: "ビロードのような" },
    { en: "brittle", jp: "脆い" },
    { en: "sticky", jp: "べたつく" },
    { en: "silky", jp: "絹のような" },
    { en: "damp", jp: "湿った" },
    { en: "prickly", jp: "ちくちくする" },
    // taste
    { en: "bitter", jp: "苦い" },
    { en: "sweet", jp: "甘い" },
    { en: "sour", jp: "酸っぱい" },
    { en: "tangy", jp: "つんとした酸味の" },
    { en: "bland", jp: "味気ない" },
    { en: "metallic", jp: "金属的な" },
    // smell
    { en: "fragrant", jp: "香り高い" },
    { en: "musty", jp: "かび臭い" },
    { en: "acrid", jp: "刺激臭のある" },
    { en: "smoky", jp: "煙たい" },
    { en: "earthy", jp: "土の匂いのする" },
    { en: "pungent", jp: "鼻を突く" },
    // modern
    { en: "liminal", jp: "境界的な" },
    { en: "unhinged", jp: "箍が外れた" },
    { en: "feral", jp: "野生に還った" },
    { en: "unbothered", jp: "動じない" },
    { en: "parasocial", jp: "一方的に親密な" },
    // states of mind, spoken around rather than named
    { en: "disembodied", jp: "身体感覚を失った" },
    { en: "untethered", jp: "繋がりを失った" },
    { en: "unmoored", jp: "係留を失った" },
    { en: "wide-eyed", jp: "見開いた目の" },
    { en: "stone-still", jp: "石のように動かない" },
    { en: "sleepwalking", jp: "夢遊病の" },
    // butoh / gagaku / zen / abstract art
    { en: "suspended", jp: "宙吊りの" },
    { en: "unhurried", jp: "急がない" },
    { en: "monochrome", jp: "単色の" },
    { en: "gestural", jp: "身振りの" },
    { en: "impermanent", jp: "無常の" },
    // food / fermentation
    { en: "fermented", jp: "発酵した" },
    { en: "pickled", jp: "漬け込まれた" },
    { en: "yeasty", jp: "酵母の香りの" },
    { en: "brined", jp: "塩水に浸かった" },
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
  { en: "everyone", jp: "誰もかれも" },
  { en: "nowhere", jp: "どこでもない場所" },
  { en: "the future", jp: "未来" },
  { en: "the past", jp: "過去" },
  { en: "right now", jp: "いま" },
  { en: "the cosmos", jp: "宇宙" },
  { en: "the horizon", jp: "地平線" },
  { en: "the cloud", jp: "クラウド" },
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
      { en: "a vending machine", jp: "自動販売機" },
      { en: "a traffic light", jp: "信号機" },
      { en: "a security camera", jp: "監視カメラ" },
      { en: "a parking garage", jp: "駐車場" },
      { en: "a payphone", jp: "公衆電話" },
      { en: "a turnstile", jp: "改札" },
      { en: "a data center", jp: "データセンター" },
      { en: "a drone", jp: "ドローン" },
      { en: "a smartphone", jp: "スマートフォン" },
      { en: "a notification", jp: "通知" },
      { en: "a server room", jp: "サーバー室" },
      { en: "a rideshare", jp: "配車サービス" },
      { en: "a delivery app", jp: "配達アプリ" },
      { en: "a charging cable", jp: "充電ケーブル" },
      { en: "a webcam", jp: "ウェブカメラ" },
      { en: "a food court", jp: "フードコート" },
      // art (urban) / science
      { en: "a mural", jp: "壁画" },
      { en: "graffiti", jp: "落書き" },
      { en: "a jumbotron", jp: "大型ビジョン" },
      { en: "a rooftop garden", jp: "屋上庭園" },
      // weather (urban)
      { en: "a rain-slicked street", jp: "雨に濡れた通り" },
      { en: "a heat shimmer", jp: "陽炎" },
      // body
      { en: "a scrolling thumb", jp: "スクロールする親指" },
      { en: "a hunched back", jp: "丸まった背中" },
      // modern
      { en: "a burner phone", jp: "使い捨て携帯" },
      { en: "an incognito tab", jp: "シークレットタブ" },
    ],
    abstract: [
      { en: "the noise", jp: "騒音" },
      { en: "insomnia", jp: "不眠" },
      { en: "static", jp: "静電気" },
      { en: "panic", jp: "パニック" },
      { en: "boredom", jp: "倦怠" },
      { en: "dread", jp: "怖れ" },
      { en: "burnout", jp: "燃え尽き" },
      { en: "envy", jp: "羨望" },
      { en: "urgency", jp: "切迫" },
      { en: "loneliness", jp: "孤独" },
      { en: "the algorithm", jp: "アルゴリズム" },
      { en: "distraction", jp: "気散じ" },
      { en: "overstimulation", jp: "刺激過多" },
      { en: "comparison", jp: "比較" },
      { en: "the scroll", jp: "スクロール" },
      { en: "productivity", jp: "生産性" },
      // science
      { en: "bandwidth", jp: "帯域" },
      { en: "latency", jp: "遅延" },
      // body
      { en: "eye strain", jp: "眼精疲労" },
      // modern
      { en: "the cloud", jp: "クラウド" },
      { en: "autopilot", jp: "自動操縦" },
      // states of mind, spoken around rather than named
      { en: "sleepless watching", jp: "眠らぬ見張り" },
    ],
    material: [
      { en: "neon", jp: "ネオン" },
      { en: "concrete", jp: "コンクリート" },
      { en: "plastic", jp: "プラスチック" },
      { en: "chrome", jp: "クロム" },
      { en: "exhaust", jp: "排気" },
      { en: "smoke", jp: "煙" },
      { en: "asphalt", jp: "アスファルト" },
      { en: "static cling", jp: "静電気" },
      { en: "vapor", jp: "蒸気" },
      { en: "grease", jp: "油" },
      { en: "circuitry", jp: "回路" },
      { en: "polyester", jp: "ポリエステル" },
      { en: "caffeine", jp: "カフェイン" },
      { en: "silicone", jp: "シリコン" },
      { en: "smog", jp: "スモッグ" },
    ],
    verbIntr: [
      { en: "flickers", jp: "明滅する" },
      { en: "buzzes", jp: "唸る" },
      { en: "refreshes", jp: "更新する" },
      { en: "overheats", jp: "過熱する" },
      { en: "scrolls", jp: "流れていく" },
      { en: "glitches", jp: "乱れる" },
      { en: "loops", jp: "繰り返す" },
      { en: "short-circuits", jp: "ショートする" },
      { en: "spirals", jp: "渦を巻く" },
      { en: "burns out", jp: "燃え尽きる" },
      { en: "recharges", jp: "充電する" },
      { en: "buffers", jp: "読み込む" },
      { en: "reboots", jp: "再起動する" },
      { en: "multitasks", jp: "並行処理する" },
      { en: "trends", jp: "話題になる" },
      { en: "lags", jp: "遅延する" },
      { en: "swelters", jp: "うだるように暑くなる" },
      { en: "doomscrolls", jp: "延々とスクロールし続ける" },
    ],
    verbTrans: [
      { en: "devours", jp: "貪る" },
      { en: "sells", jp: "売る" },
      { en: "floods", jp: "溢れさせる" },
      { en: "forgets", jp: "忘れる" },
      { en: "broadcasts", jp: "放送する" },
      { en: "monetizes", jp: "収益化する" },
      { en: "overwrites", jp: "上書きする" },
      { en: "tracks", jp: "追跡する" },
      { en: "notifies", jp: "通知する" },
      { en: "recycles", jp: "再利用する" },
      { en: "compresses", jp: "圧縮する" },
      { en: "streams", jp: "配信する" },
      { en: "curates", jp: "選び集める" },
      { en: "amplifies", jp: "増幅する" },
      { en: "ghosts", jp: "音信を絶つ" },
      { en: "gaslights", jp: "偽りの現実を信じ込ませる" },
    ],
    adj: [
      { en: "sleepless", jp: "眠らない" },
      { en: "electric", jp: "電気の" },
      { en: "fluorescent", jp: "蛍光の" },
      { en: "frantic", jp: "半狂乱の" },
      { en: "numb", jp: "麻痺した" },
      { en: "blinking", jp: "明滅する" },
      { en: "overexposed", jp: "露出過多の" },
      { en: "unread", jp: "既読でない" },
      { en: "buffering", jp: "読み込み中の" },
      { en: "outdated", jp: "旧式の" },
      { en: "overclocked", jp: "限界稼働の" },
      { en: "wired", jp: "興奮した" },
      { en: "distracted", jp: "気が散った" },
      { en: "always-on", jp: "常時稼働の" },
      // color
      { en: "magenta", jp: "赤紫色の" },
      { en: "cyan", jp: "シアン色の" },
      { en: "pixelated", jp: "ピクセル化した" },
      // weather
      { en: "muggy", jp: "蒸し暑い" },
      { en: "sweltering", jp: "うだるように暑い" },
      // body
      { en: "hunched", jp: "前かがみの" },
      { en: "glued", jp: "釘付けの" },
      // senses (sight / hearing)
      { en: "glaring", jp: "まぶしい" },
      { en: "screeching", jp: "きしむ音を立てる" },
      // modern
      { en: "checked-out", jp: "心ここにあらずの" },
      { en: "running on fumes", jp: "ガス欠寸前の" },
      { en: "unhinged", jp: "箍が外れた" },
      // states of mind, spoken around rather than named
      { en: "wide-eyed", jp: "見開いた目の" },
      { en: "vacant", jp: "うつろな" },
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
      { en: "a shadow", jp: "影" },
      { en: "a latch", jp: "掛け金" },
      { en: "a stairwell", jp: "階段室" },
      { en: "a vestibule", jp: "玄関の間" },
      { en: "a locked room", jp: "閉ざされた部屋" },
      { en: "a silhouette", jp: "影絵" },
      { en: "a hinge", jp: "蝶番" },
      { en: "an echo of a room", jp: "部屋のこだま" },
      { en: "a peephole", jp: "覗き穴" },
      { en: "a fitting room", jp: "試着室" },
      { en: "an elevator mirror", jp: "エレベーターの鏡" },
      { en: "a puddle", jp: "水たまり" },
      { en: "a photo booth", jp: "写真ブース" },
      { en: "a locked door", jp: "施錠された扉" },
      { en: "a split screen", jp: "分割された画面" },
      // art / nature
      { en: "a self-portrait", jp: "自画像" },
      { en: "a study", jp: "習作" },
      { en: "a crescent moon", jp: "三日月" },
      // weather
      { en: "a fogged window", jp: "曇った窓" },
      { en: "frostwork", jp: "霜の模様" },
      // body
      { en: "an outstretched hand", jp: "差し伸べた手" },
      { en: "a raised palm", jp: "上げた掌" },
      // psychological states
      { en: "a blank stare", jp: "虚ろな眼差し" },
    ],
    abstract: [
      { en: "reflection", jp: "反映" },
      { en: "absence", jp: "不在" },
      { en: "silence", jp: "静寂" },
      { en: "symmetry", jp: "対称" },
      { en: "doubt", jp: "疑い" },
      { en: "the reverse", jp: "裏" },
      { en: "recognition", jp: "見覚え" },
      { en: "estrangement", jp: "疎遠" },
      { en: "duality", jp: "二重性" },
      { en: "trespass", jp: "越境" },
      { en: "the unseen", jp: "見えないもの" },
      { en: "identity", jp: "自己同一性" },
      { en: "hesitation", jp: "ためらい" },
      { en: "the in-between", jp: "あいだ" },
      // science
      { en: "déjà vu", jp: "既視感" },
      { en: "parallax", jp: "視差" },
      // weather
      { en: "twilight", jp: "薄明かり" },
      // body
      { en: "muscle memory", jp: "体の記憶" },
      // modern
      { en: "sonder", jp: "他者の人生への気づき" },
      // states of mind, spoken around rather than named
      { en: "a leaving of the self", jp: "自己からの離脱" },
      { en: "a stranger in the mirror", jp: "鏡の中の見知らぬ人" },
      { en: "an unreal hour", jp: "現実感のない時間" },
      // zen / abstract art
      { en: "negative space", jp: "余白" },
      { en: "an afterimage", jp: "残像" },
    ],
    material: [
      { en: "glass", jp: "硝子" },
      { en: "silver", jp: "銀" },
      { en: "mercury", jp: "水銀" },
      { en: "water", jp: "水" },
      { en: "frost", jp: "霜" },
      { en: "mist", jp: "靄" },
      { en: "polish", jp: "艶出し剤" },
      { en: "dust", jp: "埃" },
      { en: "candlewax", jp: "蝋燭の蝋" },
      { en: "condensation", jp: "結露" },
      { en: "lacquer", jp: "漆" },
      { en: "chalk", jp: "チョーク" },
      { en: "static", jp: "静電気" },
      // color / material
      { en: "pewter", jp: "白目" },
      { en: "opal", jp: "オパール" },
      { en: "pearl", jp: "真珠" },
    ],
    verbIntr: [
      { en: "doubles", jp: "二重になる" },
      { en: "reflects", jp: "映る" },
      { en: "trembles", jp: "ふるえる" },
      { en: "opens", jp: "ひらく" },
      { en: "reverses", jp: "反転する" },
      { en: "dims", jp: "翳る" },
      { en: "closes", jp: "閉じる" },
      { en: "waits behind glass", jp: "硝子の奥で待つ" },
      { en: "leans inward", jp: "内へ傾く" },
      { en: "recedes", jp: "退いていく" },
      { en: "misremembers", jp: "誤って憶えている" },
      { en: "hesitates", jp: "ためらう" },
      { en: "blurs", jp: "ぼやける" },
      { en: "overlaps", jp: "重なる" },
    ],
    verbTrans: [
      { en: "mirrors", jp: "映す" },
      { en: "forgets", jp: "忘れる" },
      { en: "swallows", jp: "呑み込む" },
      { en: "undoes", jp: "解く" },
      { en: "doubles", jp: "二重にする" },
      { en: "unlocks", jp: "鍵をあける" },
      { en: "traces", jp: "なぞる" },
      { en: "hides", jp: "隠す" },
      { en: "outlives", jp: "生き延びる" },
      { en: "questions", jp: "問いただす" },
      { en: "returns", jp: "返す" },
      { en: "sketches", jp: "描く" },
      { en: "reaches for", jp: "手を伸ばす" },
    ],
    adj: [
      { en: "silvered", jp: "銀めっきの" },
      { en: "half-open", jp: "半開きの" },
      { en: "unlit", jp: "灯らない" },
      { en: "reversed", jp: "反転した" },
      { en: "thin", jp: "薄い" },
      { en: "wordless", jp: "言葉のない" },
      { en: "unlocked", jp: "鍵のあいた" },
      { en: "twinned", jp: "対になった" },
      { en: "familiar", jp: "見覚えのある" },
      { en: "frosted", jp: "曇った" },
      { en: "borrowed", jp: "借りてきた" },
      { en: "unfamiliar", jp: "見慣れない" },
      { en: "double-exposed", jp: "二重露光の" },
      // color
      { en: "pearlescent", jp: "真珠光沢の" },
      { en: "translucent", jp: "半透明の" },
      { en: "iridescent", jp: "玉虫色の" },
      // senses (sight)
      { en: "hazy", jp: "霞んだ" },
      { en: "murky", jp: "濁った" },
      // modern
      { en: "liminal", jp: "境界的な" },
      { en: "parasocial", jp: "一方的に親密な" },
      // states of mind, spoken around rather than named
      { en: "disembodied", jp: "身体感覚を失った" },
      { en: "stone-still", jp: "石のように動かない" },
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
      { en: "a lighthouse", jp: "灯台" },
      { en: "a switchboard", jp: "交換台" },
      { en: "a satellite dish", jp: "パラボラアンテナ" },
      { en: "a buoy", jp: "浮標" },
      { en: "a telegraph", jp: "電信" },
      { en: "a signal tower", jp: "信号塔" },
      { en: "an empty channel", jp: "誰もいない周波数" },
      { en: "a radio tower", jp: "無線塔" },
      { en: "a walkie-talkie", jp: "トランシーバー" },
      { en: "a headset", jp: "ヘッドセット" },
      { en: "a dead line", jp: "切れた回線" },
      { en: "a broadcast booth", jp: "放送ブース" },
      { en: "a missed call", jp: "着信履歴" },
      // science / nature (signals across species)
      { en: "a pulsar", jp: "パルサー" },
      { en: "an oscillator", jp: "発振器" },
      { en: "a migratory bird", jp: "渡り鳥" },
      { en: "whale song", jp: "鯨の歌" },
      { en: "a foghorn", jp: "霧笛" },
      // weather
      { en: "a lightning strike", jp: "落雷" },
      { en: "a distant storm", jp: "遠い嵐" },
      // body
      { en: "a cupped ear", jp: "耳を澄ます手" },
      // gagaku / ma
      { en: "a fermata", jp: "延音記号" },
    ],
    abstract: [
      { en: "silence", jp: "静寂" },
      { en: "static", jp: "静電気" },
      { en: "distance", jp: "隔たり" },
      { en: "the signal", jp: "信号" },
      { en: "absence", jp: "不在" },
      { en: "the void", jp: "虚空" },
      { en: "stillness", jp: "静止" },
      { en: "the wait", jp: "待つこと" },
      { en: "solitude", jp: "孤独" },
      { en: "an unheard word", jp: "聞かれない言葉" },
      { en: "interference", jp: "干渉" },
      { en: "the pause", jp: "間" },
      // science
      { en: "bandwidth", jp: "帯域" },
      { en: "frequency drift", jp: "周波数のずれ" },
      // body
      { en: "breathlessness", jp: "息を切らすこと" },
    ],
    material: [
      { en: "static", jp: "静電気" },
      { en: "copper", jp: "銅" },
      { en: "rain", jp: "雨" },
      { en: "snow", jp: "雪" },
      { en: "wire", jp: "電線" },
      { en: "noise", jp: "雑音" },
      { en: "fog", jp: "霧" },
      { en: "solder", jp: "はんだ" },
      { en: "frequency hiss", jp: "周波数のノイズ" },
      { en: "sea spray", jp: "潮しぶき" },
      { en: "feedback", jp: "ハウリング" },
      { en: "sea fog", jp: "海霧" },
    ],
    verbIntr: [
      { en: "transmits", jp: "送信する" },
      { en: "listens", jp: "耳を澄ます" },
      { en: "fades", jp: "薄れる" },
      { en: "hums", jp: "唸る" },
      { en: "crackles", jp: "ざわめく" },
      { en: "drifts", jp: "漂う" },
      { en: "waits for reply", jp: "返信を待つ" },
      { en: "goes dark", jp: "沈黙する" },
      { en: "pulses", jp: "点滅する" },
      { en: "repeats", jp: "繰り返す" },
      { en: "disconnects", jp: "切断する" },
      { en: "reconnects", jp: "再接続する" },
      // nature
      { en: "chirps", jp: "さえずる" },
      { en: "calls back", jp: "呼び返す" },
      // body
      { en: "strains to hear", jp: "聞き取ろうと耳を澄ます" },
    ],
    verbTrans: [
      { en: "carries", jp: "運ぶ" },
      { en: "transmits", jp: "送信する" },
      { en: "answers", jp: "応える" },
      { en: "forgets", jp: "忘れる" },
      { en: "receives", jp: "受け取る" },
      { en: "echoes", jp: "反響させる" },
      { en: "encodes", jp: "暗号化する" },
      { en: "loses", jp: "見失う" },
      { en: "repeats", jp: "繰り返す" },
      { en: "interrupts", jp: "遮る" },
      { en: "ghosts", jp: "音信を絶つ" },
    ],
    adj: [
      { en: "faint", jp: "かすかな" },
      { en: "wordless", jp: "言葉のない" },
      { en: "distant", jp: "遠い" },
      { en: "still", jp: "静かな" },
      { en: "encoded", jp: "暗号化された" },
      { en: "unanswered", jp: "応えられない" },
      { en: "unheard", jp: "聞かれない" },
      { en: "one-way", jp: "片道の" },
      { en: "muted", jp: "無音の" },
      { en: "waiting", jp: "待っている" },
      { en: "disconnected", jp: "切断された" },
      { en: "hushed", jp: "静められた" },
      // science
      { en: "cosmic", jp: "宇宙的な" },
      { en: "migratory", jp: "渡りの" },
      // weather
      { en: "stormy", jp: "嵐の" },
      { en: "windblown", jp: "風に吹かれた" },
      // senses (hearing)
      { en: "muffled", jp: "くぐもった" },
      { en: "crackling", jp: "ぱちぱちと鳴る" },
      // modern
      { en: "parasocial", jp: "一方的に親密な" },
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
      { en: "a kiln", jp: "窯" },
      { en: "a bonfire", jp: "焚き火" },
      { en: "a pit", jp: "穴" },
      { en: "a bud", jp: "蕾" },
      { en: "a windfall", jp: "落ち実" },
      { en: "a hearth", jp: "炉" },
      { en: "a scarecrow", jp: "案山子" },
      { en: "a greenhouse", jp: "温室" },
      { en: "a garden bed", jp: "花壇" },
      { en: "a wheelbarrow", jp: "手押し車" },
      { en: "a fire pit", jp: "焚き火台" },
      { en: "a beehive", jp: "蜂の巣" },
      { en: "a compost heap", jp: "堆肥の山" },
      // art / nature
      { en: "a still life", jp: "静物画" },
      { en: "a woodcut", jp: "木版画" },
      { en: "a chrysalis", jp: "蛹" },
      // weather
      { en: "an autumn wind", jp: "秋風" },
      { en: "the first frost", jp: "初霜" },
      // body
      { en: "a calloused palm", jp: "たこのできた掌" },
      // food / fermentation
      { en: "a wine barrel", jp: "ワイン樽" },
      { en: "a basket of fruit", jp: "果実の籠" },
      { en: "a fermenting jar", jp: "発酵瓶" },
    ],
    abstract: [
      { en: "dusk", jp: "夕暮れ" },
      { en: "dormancy", jp: "休眠" },
      { en: "hunger", jp: "飢え" },
      { en: "patience", jp: "忍耐" },
      { en: "decay", jp: "腐朽" },
      { en: "silence", jp: "静寂" },
      { en: "renewal", jp: "再生" },
      { en: "ruin", jp: "廃墟" },
      { en: "the season", jp: "季節" },
      { en: "grief", jp: "悲嘆" },
      { en: "beginning", jp: "はじまり" },
      { en: "warmth", jp: "温もり" },
      { en: "abundance", jp: "豊かさ" },
      // science (botany)
      { en: "germination", jp: "発芽" },
      { en: "pollination", jp: "受粉" },
      // weather
      { en: "the thaw", jp: "雪解け" },
      // body
      { en: "weariness", jp: "疲れ" },
      // modern
      { en: "solastalgia", jp: "失われゆく風景への郷愁" },
      // zen
      { en: "impermanence", jp: "無常" },
      { en: "wabi-sabi", jp: "侘寂" },
      // food / fermentation
      { en: "nourishment", jp: "滋養" },
    ],
    material: [
      { en: "ash", jp: "灰" },
      { en: "soil", jp: "土" },
      { en: "smoke", jp: "煙" },
      { en: "sap", jp: "樹液" },
      { en: "char", jp: "焦げ" },
      { en: "rain", jp: "雨" },
      { en: "resin", jp: "樹脂" },
      { en: "compost", jp: "堆肥" },
      { en: "pollen", jp: "花粉" },
      { en: "clay", jp: "粘土" },
      { en: "mulch", jp: "マルチ材" },
      { en: "dew", jp: "露" },
      // food / fermentation
      { en: "brine", jp: "塩水" },
      { en: "must", jp: "ぶどう果汁" },
    ],
    verbIntr: [
      { en: "kindles", jp: "燃えつく" },
      { en: "scatters", jp: "散らばる" },
      { en: "sprouts", jp: "芽吹く" },
      { en: "smolders", jp: "くすぶる" },
      { en: "sleeps", jp: "眠る" },
      { en: "waits", jp: "待つ" },
      { en: "roots", jp: "根づく" },
      { en: "ripens", jp: "熟す" },
      { en: "withers", jp: "しおれる" },
      { en: "returns", jp: "戻ってくる" },
      { en: "blooms", jp: "咲く" },
      { en: "decomposes", jp: "分解する" },
      { en: "germinates", jp: "発芽する" },
      { en: "grows tired", jp: "疲れる" },
      { en: "ferments", jp: "発酵する" },
    ],
    verbTrans: [
      { en: "scatters", jp: "散らす" },
      { en: "buries", jp: "埋める" },
      { en: "kindles", jp: "燃やす" },
      { en: "feeds", jp: "養う" },
      { en: "unseals", jp: "ひらく" },
      { en: "shelters", jp: "守る" },
      { en: "outlasts", jp: "生き延びる" },
      { en: "nurtures", jp: "育てる" },
      { en: "harvests", jp: "収穫する" },
      { en: "renews", jp: "新たにする" },
      { en: "pollinates", jp: "受粉させる" },
      { en: "preserves", jp: "保存する" },
    ],
    adj: [
      { en: "burnt", jp: "焼けた" },
      { en: "unborn", jp: "生まれる前の" },
      { en: "pale", jp: "淡い" },
      { en: "dormant", jp: "眠っている" },
      { en: "charred", jp: "炭化した" },
      { en: "buried", jp: "埋もれた" },
      { en: "fertile", jp: "肥沃な" },
      { en: "windfallen", jp: "落ちた" },
      { en: "smoldering", jp: "くすぶる" },
      { en: "rootbound", jp: "根詰まりした" },
      { en: "ripe", jp: "熟した" },
      { en: "overgrown", jp: "生い茂った" },
      // color
      { en: "russet", jp: "赤茶色の" },
      { en: "emerald", jp: "エメラルド色の" },
      // weather
      { en: "sun-baked", jp: "陽に焼けた" },
      { en: "wind-bitten", jp: "風に晒された" },
      // body
      { en: "calloused", jp: "たこのできた" },
      { en: "weathered", jp: "風雪に耐えた" },
      // senses (touch / smell)
      { en: "earthy", jp: "土の匂いのする" },
      { en: "brittle", jp: "脆い" },
      // food / fermentation
      { en: "fermented", jp: "発酵した" },
      { en: "overripe", jp: "熟しすぎた" },
    ],
  },
};

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]): T => arr[rand(arr.length)];
const chance = (p: number) => Math.random() < p;

// "a" / "an" by the leading sound of the following word.
const art = (en: string) => (/^[aeiou]/i.test(en) ? "an" : "a");

// Verbs whose 3rd-person "-es" isn't a plain "+s" (buzz → buzzes, not
// buzze) — stripping just the trailing "s" would mangle these, and the
// suffix alone can't disambiguate them from silent-e verbs like "ache"
// (ache + s = aches), so they're listed explicitly.
const IRREGULAR_ES: Record<string, string> = {
  buzzes: "buzz",
  glitches: "glitch",
  refreshes: "refresh",
  stretches: "stretch",
};

// Bare-infinitive form of an intransitive verb (the bank stores the
// 3rd-person "-s" form) for templates like "forgets to ___".
const baseOf = (en: string) => IRREGULAR_ES[en] ?? en.replace(/s$/, "");

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
    default: {
      const options = [
        { en: `${vt.en} its own ${bc}`, jp: `自らの${c.jp}を${vt.jp}` },
        { en: `${vi.en} into the color of ${ab.en}`, jp: `${ab.jp}の色へ${vi.jp}` },
      ];
      // "forgets to ___" needs a bare infinitive; baseOf() only handles a
      // single word cleanly, so phrasal intransitives ("waits for reply")
      // skip this option rather than risk "forgets to waits for reply".
      if (!vi.en.includes(" ")) {
        options.push({ en: `forgets to ${baseOf(vi.en)}`, jp: `${vi.jp}のを忘れる` });
      }
      return pick(options);
    }
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
