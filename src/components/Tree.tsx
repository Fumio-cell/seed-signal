import { Fragment, useEffect, useRef, useState } from "react";
import { startDrag, dropTargetAt } from "../lib/drag";
import trunkBranchesLeaves from "../assets/tree/trunk-branches-leaves.png";
import pomegranate01 from "../assets/tree/pomegranate01-crop.png";
import pomegranate02 from "../assets/tree/pomegranate02-crop.png";
import pomegranate03 from "../assets/tree/pomegranate03-crop.png";
import pomegranate04 from "../assets/tree/pomegranate04-crop.png";
import pomegranate05 from "../assets/tree/pomegranate05-crop.png";
import pomegranate06 from "../assets/tree/pomegranate06-crop.png";
import pomegranate07 from "../assets/tree/pomegranate07-crop.png";
import pomegranate08 from "../assets/tree/pomegranate08-crop.png";

// The tree, built from three real painted layers (bg-texture is the
// app's own body background, already showing through): the trunk/
// branches/leaves as one transparent painting, and eight individual
// pomegranates hand-painted across a ripeness gradient — deep red
// through to green. Growth is a bottom-up reveal of the branch painting
// (trunk sits in its lower quarter, canopy spreads above, so a clip-path
// wipe naturally shows trunk-then-branches without needing separate
// assets); fruit fades in once grown. Ripe fruit are real draggable
// elements with a contact shadow and warm glow for grounding.

const IMG_W = 1024;
const IMG_H = 572;

interface FruitSpec {
  src: string;
  ripe: boolean;
  xPct: number; // center, % of tree width
  yPct: number; // center, % of tree height
  widthPct: number; // % of tree width
  rotate: number; // degrees, for natural variety
}

const FRUITS: FruitSpec[] = [
  { src: pomegranate01, ripe: true, xPct: 12.7, yPct: 47.2, widthPct: 13.7, rotate: -4 },
  { src: pomegranate02, ripe: true, xPct: 24.4, yPct: 19.2, widthPct: 12.7, rotate: 3 },
  { src: pomegranate03, ripe: true, xPct: 39.1, yPct: 9.6, widthPct: 12.2, rotate: -2 },
  { src: pomegranate04, ripe: true, xPct: 54.7, yPct: 9.6, widthPct: 14.2, rotate: 4 },
  { src: pomegranate05, ripe: true, xPct: 70.3, yPct: 19.2, widthPct: 12.7, rotate: -3 },
  { src: pomegranate06, ripe: true, xPct: 84.0, yPct: 38.5, widthPct: 14.6, rotate: 5 },
  { src: pomegranate07, ripe: false, xPct: 74.2, yPct: 56.0, widthPct: 11.7, rotate: -3 },
  { src: pomegranate08, ripe: false, xPct: 27.3, yPct: 59.4, widthPct: 10.7, rotate: 2 },
];

export const TOTAL_RIPE_FRUITS = FRUITS.filter((f) => f.ripe).length;

interface Props {
  phase: number; // 0 seed, 1-2 growing, 3 fruit
  interactive?: boolean;
  onPluck?: () => void;
}

export function Tree({ phase, interactive, onPluck }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [plucked, setPlucked] = useState<Set<number>>(new Set());

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const compute = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw === 0 || ch === 0) return;
      const containerRatio = cw / ch;
      const imgRatio = IMG_W / IMG_H;
      let width: number, height: number, left: number, top: number;
      if (containerRatio > imgRatio) {
        height = ch;
        width = ch * imgRatio;
        left = (cw - width) / 2;
        top = 0;
      } else {
        width = cw;
        height = cw / imgRatio;
        left = 0;
        top = (ch - height) / 2;
      }
      setBox({ left, top, width, height });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const startPluck = (index: number) => (e: React.PointerEvent<HTMLImageElement>) => {
    if (!interactive || !onPluck) return;
    setRevealed((r) => new Set(r).add(index));
    startDrag(e, {
      onDrop: (x, y, el) => {
        const target = dropTargetAt(x, y, "data-drop", el);
        if (target?.dataset.drop === "break") {
          setPlucked((p) => new Set(p).add(index));
          setTimeout(() => onPluck(), 220);
        } else {
          setRevealed((r) => {
            const next = new Set(r);
            next.delete(index);
            return next;
          });
        }
      },
    });
  };

  // Bottom-up reveal: trunk sits in the painting's lower quarter, canopy
  // spreads above it, so wiping the clip inset from 100% to 0% shows
  // trunk first and branches/leaves as it continues.
  const revealTop = phase <= 0 ? 100 : phase === 1 ? 55 : 0;

  return (
    <div className="grown-tree" ref={wrapRef}>
      <img
        src={trunkBranchesLeaves}
        alt="a pomegranate tree's trunk, branches, and leaves"
        className="tree-branches-img"
        style={{ clipPath: `inset(${revealTop}% 0 0 0)` }}
      />
      {box.width > 0 &&
        phase >= 3 &&
        FRUITS.map((f, i) => {
          const width = (f.widthPct / 100) * box.width;
          const centerLeft = box.left + (f.xPct / 100) * box.width;
          const centerTop = box.top + (f.yPct / 100) * box.height;
          const isRevealed = revealed.has(i);
          const isPlucked = plucked.has(i);
          return (
            <Fragment key={i}>
              {f.ripe && (
                <div
                  className={`fruit-shadow ${isRevealed ? "shown" : ""}`}
                  style={{
                    left: centerLeft,
                    top: centerTop,
                    width: width * 0.8,
                    height: width * 0.32,
                    transform: "translate(-50%, -20%)",
                  }}
                />
              )}
              {!isPlucked && (
                // Anchor carries position + rotation + entrance animation;
                // startDrag overwrites the *img's own* transform while
                // dragging, so positioning/rotation must live one level up
                // to survive that.
                <div
                  className="fruit-anchor"
                  style={{
                    left: centerLeft,
                    top: centerTop,
                    width,
                    transform: `translate(-50%, -50%) rotate(${f.rotate}deg)`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                >
                  <img
                    src={f.src}
                    className={`fruit-sprite ${f.ripe ? "ripe" : "young"}`}
                    onPointerDown={f.ripe ? startPluck(i) : undefined}
                    alt=""
                    draggable={false}
                  />
                </div>
              )}
            </Fragment>
          );
        })}
    </div>
  );
}
