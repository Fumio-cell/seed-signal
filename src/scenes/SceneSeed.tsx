import { useMemo, useState } from "react";
import type { SealedHaiku, Theme } from "../types";
import { PRESET_THEMES, makeCustomTheme } from "../data/themes";
import { loadRecentCustomTheme } from "../store/orchard";
import { startDrag, dropTargetAt } from "../lib/drag";
import { soilThud } from "../audio/sfx";
import { groveYields } from "../lib/lexicon";

// Plant a Seed. Suggested themes are ranked by how many haiku the user
// has actually completed with them (a real-data heuristic, not AI), with
// the most recent custom-planted theme offered as a fourth suggestion.

interface Suggestion {
  theme: Theme;
  caption: string | null;
  custom: boolean;
}

interface Props {
  orchard: SealedHaiku[];
  onPlant: (theme: Theme, custom: boolean) => void;
}

export function SceneSeed({ orchard, onPlant }: Props) {
  const [text, setText] = useState("");

  const suggestions = useMemo<Suggestion[]>(() => {
    const yields = groveYields(orchard);
    const countOf = (key: string) => yields.find((y) => y.theme === key)?.count ?? 0;

    const ranked = [...PRESET_THEMES]
      .sort((a, b) => countOf(b.key) - countOf(a.key))
      .slice(0, 3)
      .map((theme) => {
        const n = countOf(theme.key);
        return {
          theme,
          caption: n > 0 ? `grown ${n}×` : null,
          custom: false,
        };
      });

    const recent = loadRecentCustomTheme();
    if (recent && !PRESET_THEMES.some((t) => t.key === recent)) {
      ranked.push({
        theme: makeCustomTheme(recent),
        caption: "recently planted",
        custom: true,
      });
    }
    return ranked;
  }, [orchard]);

  const customTheme = text.trim() ? makeCustomTheme(text.trim()) : null;

  const dragCard =
    (theme: Theme, custom: boolean) => (e: React.PointerEvent<Element>) => {
      startDrag(e, {
        onDrop: (x, y, el) => {
          const target = dropTargetAt(x, y, "data-drop", el);
          if (target?.dataset.drop === "soil") {
            soilThud();
            onPlant(theme, custom);
          }
        },
      });
    };

  return (
    <div className="seed-scene">
      <h1 className="scene-title">plant a seed</h1>
      <div className="scene-sub">種を植える</div>

      <input
        className="theme-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="any theme, word, or title…"
        spellCheck={false}
      />

      <div className="seed-cards">
        {customTheme && (
          <div
            className="seed-card"
            onPointerDown={dragCard(customTheme, true)}
          >
            <div className="en">{customTheme.en}</div>
            <div className="caption">your seed</div>
          </div>
        )}
        {suggestions.map((s) => (
          <div
            key={s.theme.key}
            className="seed-card"
            onPointerDown={dragCard(s.theme, s.custom)}
          >
            <div className="en">{s.theme.en}</div>
            {s.theme.key !== s.theme.en && <div className="jp">{s.theme.key}</div>}
            {s.caption && <div className="caption">{s.caption}</div>}
          </div>
        ))}
      </div>

      <div className="soil">
        <div>
          <div className="soil-hint">drag a seed into the soil — 土へ</div>
          <svg
            width="360"
            height="110"
            viewBox="0 0 360 110"
            data-drop="soil"
          >
            <ellipse cx="180" cy="86" rx="168" ry="22" fill="#221a30" />
            <path
              d="M40 88 Q 110 34 180 40 Q 250 34 320 88 Q 250 74 180 76 Q 110 74 40 88 Z"
              fill="#302640"
              stroke="#504266"
              strokeWidth="1.5"
            />
            <path
              d="M120 66 q 20 -6 40 -4 M200 60 q 22 -2 44 6 M150 78 q 30 -4 60 0"
              fill="none"
              stroke="#5e4f74"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
