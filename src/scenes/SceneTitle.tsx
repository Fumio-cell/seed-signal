import { useState } from "react";
import type { PickedSeed } from "../types";

// Title input. Both titles are user-authored — titling is one of the
// author's most important creative acts, never auto-derived. (AI-suggested
// candidates are a planned enhancement alongside, not instead of, this.)

interface Props {
  lines: PickedSeed[][];
  onBack: () => void;
  onSeal: (title: string, titleJp: string) => void;
}

export function SceneTitle({ lines, onBack, onSeal }: Props) {
  const [title, setTitle] = useState("");
  const [titleJp, setTitleJp] = useState("");

  return (
    <div className="title-scene">
      <h1 className="scene-title">name what grew</h1>
      <div className="scene-sub">題をつける</div>

      <div className="haiku-preview">
        {lines.map((line, i) => (
          <div key={i}>
            <div className="line-en">{line.map((s) => s.en).join(" ")}</div>
            <div className="line-jp">{line.map((s) => s.jp).join("")}</div>
          </div>
        ))}
      </div>

      <div className="title-fields">
        <div className="title-field">
          <label>TITLE — ENGLISH</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="an english title…"
            spellCheck={false}
            autoFocus
          />
        </div>
        <div className="title-field">
          <label>TITLE — 日本語</label>
          <input
            className="jp-input"
            value={titleJp}
            onChange={(e) => setTitleJp(e.target.value)}
            placeholder="日本語の題…"
          />
        </div>
      </div>

      <div className="title-actions">
        <button className="ghost-btn" onClick={onBack}>
          back to the strand
        </button>
        <button
          className="primary-btn"
          disabled={!title.trim()}
          onClick={() => onSeal(title.trim(), titleJp.trim())}
        >
          seal — 封印
        </button>
      </div>
    </div>
  );
}
