import { useRef, useState } from "react";
import type { PickedSeed } from "../types";
import { lineTag, relate, relationFeedback } from "../physics/grammar";
import type { RelationFeedback } from "../physics/grammar";
import { startDrag, dropTargetAt } from "../lib/drag";
import { fruitPluck } from "../audio/sfx";
import { useSettings } from "../store/settings";
import pomegranateOpen from "../assets/tree/pomegranate-open.jpg";
import seedsStrand from "../assets/tree/seeds-strand.jpg";

// Break & Strand. Left: the broken fruit's word fragments. Right: three
// line slots. Grammatical physics gives feedback on every join — gold for
// attraction, gray for neutral, red for a forced unstable join — but
// nothing is ever blocked outright. When "allow risky joins" is off
// (Settings → Grammar Physics), a repel join pauses for a confirm tap
// instead of placing instantly — still never a hard block. Whatever
// music the user loaded simply continues here; this scene deliberately
// has no SFX of its own.

const LINE_LABELS = ["first line — 上五", "second line — 中七", "third line — 下五"];

interface Flash extends RelationFeedback {
  line: number;
  key: number;
}

interface Pending {
  seed: PickedSeed;
  line: number;
  fb: RelationFeedback;
}

interface Props {
  pool: PickedSeed[];
  lines: PickedSeed[][];
  onPlace: (seedId: string, line: number) => void;
  onClearLine: (line: number) => void;
  onBreakAnother: () => void;
  onSeal: () => void;
}

function PosTag({ t, display }: { t: PickedSeed["t"]; display: "dots" | "labels" | "hidden" }) {
  if (display === "hidden") return null;
  if (display === "labels") return <span className={`pos-label pos-${t}`}>{t}</span>;
  return <span className={`pos-dot pos-${t}`} />;
}

export function SceneStrand({
  pool,
  lines,
  onPlace,
  onClearLine,
  onBreakAnother,
  onSeal,
}: Props) {
  const { settings } = useSettings();
  const [hover, setHover] = useState<{ line: number; cls: string } | null>(null);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const flashKey = useRef(0);

  const available = pool.filter((s) => !s.picked);
  const canSeal = lines.every((l) => l.length > 0);
  const tagDisplay = settings.grammar.tagDisplay;

  const relationFor = (line: number, seed: PickedSeed) => {
    const tag = lineTag(lines[line].map((s) => s.t));
    return tag === null ? null : relate(tag, seed.t);
  };

  const commitPlace = (seed: PickedSeed, line: number, fb: RelationFeedback | null) => {
    if (fb) {
      flashKey.current += 1;
      setFlash({ line, key: flashKey.current, ...fb });
    }
    onPlace(seed.id, line);
  };

  const dragSeed = (seed: PickedSeed) => (e: React.PointerEvent<Element>) => {
    startDrag(e, {
      onMove: (x, y, el) => {
        // Dragging carries the card outside the seed pool's own
        // scrollable box — allow it to render unclipped while a drag is
        // in progress instead of getting cut off at that boundary.
        setDragActive(true);
        const target = dropTargetAt(x, y, "data-line", el);
        if (target) {
          const line = Number(target.dataset.line);
          const rel = relationFor(line, seed);
          setHover({
            line,
            cls: rel === null ? "neutral" : relationFeedback(rel).cls,
          });
        } else {
          setHover(null);
        }
      },
      onDrop: (x, y, el) => {
        setDragActive(false);
        setHover(null);
        const target = dropTargetAt(x, y, "data-line", el);
        if (!target) return;
        const line = Number(target.dataset.line);
        const rel = relationFor(line, seed);
        const fb = rel === null ? null : relationFeedback(rel);
        if (rel === -1 && !settings.grammar.allowRiskyJoins) {
          setPending({ seed, line, fb: fb! });
          return;
        }
        commitPlace(seed, line, fb);
      },
    });
  };

  return (
    <div className="strand-scene">
      <img className="strand-bg-accent" src={pomegranateOpen} alt="" aria-hidden="true" />
      <div className="strand-col seeds">
        <div className="col-label">
          SEEDS<span className="jp">言葉の種</span>
        </div>
        {tagDisplay !== "hidden" && (
          <div className="pos-legend">
            <span className="pos-legend-item">
              <PosTag t="N" display={tagDisplay} /> noun 名詞
            </span>
            <span className="pos-legend-item">
              <PosTag t="V" display={tagDisplay} /> verb 動詞
            </span>
            <span className="pos-legend-item">
              <PosTag t="ADJ" display={tagDisplay} /> adjective 形容詞
            </span>
          </div>
        )}
        <div className={`seed-pool ${dragActive ? "drag-active" : ""}`}>
          {available.map((s) => (
            <div key={s.id} className="frag-card" onPointerDown={dragSeed(s)}>
              <PosTag t={s.t} display={tagDisplay} />
              <span className="en">{s.en}</span>
              <span className="jp">{s.jp}</span>
            </div>
          ))}
        </div>
        <button
          className="ghost-btn break-more"
          onClick={() => {
            fruitPluck();
            onBreakAnother();
          }}
        >
          break another fruit — もう一つ割る
        </button>
      </div>

      <div className="strand-col lines">
        <div className="col-label">
          STRAND<span className="jp">連ねる</span>
        </div>
        <img className="strand-thread-accent" src={seedsStrand} alt="" aria-hidden="true" />
        <div className="line-slots">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`line-slot ${
                hover?.line === i ? `hover-${hover.cls}` : ""
              }`}
              data-line={i}
            >
              {flash && flash.line === i && (
                <div key={flash.key} className={`flash ${flash.cls}`}>
                  {flash.msg}
                </div>
              )}
              {pending && pending.line === i && (
                <div className="pending-confirm">
                  <span>{pending.fb.msg} — place "{pending.seed.en}" anyway?</span>
                  <button
                    className="ghost-btn"
                    onClick={() => {
                      commitPlace(pending.seed, pending.line, pending.fb);
                      setPending(null);
                    }}
                  >
                    place anyway
                  </button>
                  <button className="ghost-btn" onClick={() => setPending(null)}>
                    cancel
                  </button>
                </div>
              )}
              <div className="line-label">
                {LINE_LABELS[i]}
                {line.length > 0 && (
                  <button className="line-clear" onClick={() => onClearLine(i)}>
                    clear ✕
                  </button>
                )}
              </div>
              <div className="line-en">
                {line.length === 0 ? (
                  <span className="placeholder">drop a fragment here…</span>
                ) : (
                  line.map((s) => s.en).join(" ")
                )}
              </div>
              <div className="line-jp">{line.map((s) => s.jp).join("")}</div>
              <div className="line-beads">
                {line.map((s) => (
                  <PosTag key={s.id} t={s.t} display={tagDisplay} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="strand-actions">
          <button className="primary-btn" disabled={!canSeal} onClick={onSeal}>
            seal the haiku — 封
          </button>
        </div>
      </div>
    </div>
  );
}
