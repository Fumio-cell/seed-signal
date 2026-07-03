export type PartOfSpeech = "N" | "NP" | "V" | "VP" | "ADJ";

export interface SeedTemplate {
  en: string; // English phrase
  jp: string; // Japanese translation
  t: PartOfSpeech; // grammatical tag, used for the attraction/repulsion system
}

export interface Theme {
  key: string; // e.g. "現代の狂気" — also used as the lookup/display key
  en: string; // English translation of the theme, e.g. "modern madness"
  seeds: SeedTemplate[]; // vocabulary pool for this theme
}

export interface PickedSeed extends SeedTemplate {
  id: string; // unique instance id
  picked: boolean;
  fruitNo?: number; // which break (fruit) this fragment was revealed by
}

export interface LineWord {
  text: string;
  t: PartOfSpeech;
}

export interface HaikuLine {
  en: string; // joined English text of all seeds placed on this line
  jp: string; // joined Japanese text
  beads: PartOfSpeech[]; // tag sequence, used for the colored-dot "prayer bead" display
  words?: LineWord[]; // seed-phrase-level POS tags, for the Lexicon view
}

export interface GenesisEvent {
  timestamp: string; // ISO
  type: "plant" | "grow_complete" | "pick" | "combine" | "seal";
  detail: string; // human-readable, e.g. `picked "a button glows" from fruit #3`
}

export interface EditSnapshot {
  title: string;
  titleJp: string;
  lines: [HaikuLine, HaikuLine, HaikuLine];
}

export interface EditRecord {
  timestamp: string;
  summary: string;
  previous: EditSnapshot;
}

export interface SealedHaiku {
  id: string;
  number: string; // zero-padded sequence number, e.g. "001"
  title: string; // English title, user-entered
  titleJp: string; // Japanese title, user-entered
  theme: string; // original theme key
  themeEn: string; // theme English translation
  lines: [HaikuLine, HaikuLine, HaikuLine];
  sealedAt: string; // ISO timestamp

  // Orchard addendum fields
  tags: string[];
  collections: string[];
  withered: boolean;
  witheredAt?: string;
  notes?: string;
  genesis: GenesisEvent[];
  editHistory: EditRecord[];
  fruitBreakNo?: number; // which fruit-break (1st, 2nd, …) supplied this haiku's seeds
  seedsPicked?: number;
  seedsRevealed?: number;
  musicFile?: string | null;
}

export type Scene =
  | "seed"
  | "grow"
  | "strand"
  | "title"
  | "seal"
  | "orchard"
  | "detail"
  | "overview"
  | "settings";

export interface TreeSession {
  id: string;
  theme: string;
  themeEn: string;
  plantedAt: string;
  fruitsBroken: number;
  totalFruits: number;
  haikuSealed: number;
}

export interface AppSettings {
  sound: {
    masterVolume: number; // 0..1
    sensitivity: number; // 0..1, reserved for future audio-reactive visuals
    loopMode: "seamless" | "shuffle" | "once";
  };
  growth: {
    germinationSeconds: number;
    fruitDensity: number; // 0..1
    seedsPerFruit: number;
    ripening: "gradual" | "all-at-once" | "random";
    autoTranslate: boolean;
  };
  language: {
    primary: "en" | "jp";
    translationStyle: "literal" | "poetic" | "both";
    syllableRule: "strict" | "loose" | "free";
    punctuation: "none" | "ask";
  };
  grammar: {
    magneticStrength: number; // 0..1
    verbGuardrail: boolean;
    allowRiskyJoins: boolean;
    tagDisplay: "dots" | "labels" | "hidden";
  };
  aesthetics: {
    theme: "indigo" | "washi" | "dawn";
    motionSpeed: number; // 0..1, 1 = default meditative pace
    fruitGlowWarmth: number; // 0..1
    watercolorBleed: boolean;
  };
  archive: {
    defaultSort: "newest" | "oldest" | "grove" | "alphabetical";
    witherDays: number;
    exportFormat: "json" | "markdown" | "text" | "image";
  };
  privacy: {
    storage: "local" | "cloud";
    aiAssistance: boolean;
    offlineMode: boolean;
  };
}
