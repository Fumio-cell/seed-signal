import type { SealedHaiku } from "../types";
import treeCelebrate from "../assets/tree/tree-celebrate.jpg";

// Seal: the celebratory fully-lit tree beside the sealed haiku card,
// with its red seal stamp. This scene has no dragging or other
// interaction, so the finished watercolor artwork replaces the SVG
// tree outright rather than needing invisible hit-targets over it.

interface Props {
  haiku: SealedHaiku;
  onOrchard: () => void;
  onNew: () => void;
}

export function SceneSeal({ haiku, onOrchard, onNew }: Props) {
  return (
    <div className="seal-scene">
      <div className="seal-tree">
        <img src={treeCelebrate} alt="a fully lit pomegranate tree, one fruit split open" />
      </div>

      <div className="seal-card">
        <div className="seal-head">
          <div className="seal-number">NO. {haiku.number}</div>
          <div className="seal-stamp">印</div>
        </div>

        <h2 className="seal-title-en">{haiku.title}</h2>
        {haiku.titleJp && <div className="seal-title-jp">{haiku.titleJp}</div>}

        <div className="seal-lines">
          {haiku.lines.map((line, i) => (
            <div key={i}>
              <div className="line-en">{line.en}</div>
              <div className="line-jp">{line.jp}</div>
            </div>
          ))}
        </div>

        <div className="seal-meta">
          <span>
            from “{haiku.themeEn}” — {haiku.theme}
          </span>
          <span className="saved">saved to orchard ✓</span>
        </div>

        <div className="seal-actions">
          <button className="ghost-btn" onClick={onOrchard}>
            to orchard — 果樹園へ
          </button>
          <button className="primary-btn" onClick={onNew}>
            plant a new seed
          </button>
        </div>
      </div>
    </div>
  );
}
