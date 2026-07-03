import { useEffect, useState } from "react";
import type { Theme } from "../types";
import { Tree } from "../components/Tree";
import { fruitPluck } from "../audio/sfx";
import { useSettings } from "../store/settings";
import germination from "../assets/tree/germination.jpg";

// Tree growth: a seed settles → the branch painting reveals bottom-up
// (trunk, then canopy) → fruit ripens. Three phases over roughly 8
// seconds — a deliberately unhurried, meditative sequence. Once grown,
// ripe fruit can be dragged to the breaking stone; young fruit stays
// dimmed and inert.

interface Props {
  theme: Theme;
  onBreak: () => void;
  onGrowComplete?: () => void;
}

const CAPTIONS = [
  "a seed settles into the dark…",
  "the trunk rises",
  "branches reach, leaves unfurl",
  "fruit ripens under a night sky",
  "drag a ripe fruit to the breaking stone",
];

export function SceneGrow({ theme, onBreak, onGrowComplete }: Props) {
  const { settings } = useSettings();
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Baseline is an 8.2s sequence; Settings → Growth → germination time
    // scales the whole schedule proportionally.
    const scale = settings.growth.germinationSeconds / 8;
    const timers = [
      setTimeout(() => setPhase(1), 300 * scale),
      setTimeout(() => setPhase(2), 2800 * scale),
      setTimeout(() => setPhase(3), 5800 * scale),
      setTimeout(() => {
        setDone(true);
        onGrowComplete?.();
      }, 8200 * scale),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pluck = () => {
    fruitPluck();
    onBreak();
  };

  return (
    <div className="grow-scene">
      <div className="grow-caption">
        {done ? CAPTIONS[4] : CAPTIONS[phase]}
        <span style={{ display: "block", fontSize: 11, letterSpacing: "0.25em", marginTop: 6 }}>
          {theme.en} — {theme.key}
        </span>
      </div>

      <div className="tree-wrap">
        <img
          src={germination}
          alt="a seed germinating on a stone"
          className={`germination-art ${phase >= 1 ? "faded" : ""}`}
        />
        <Tree phase={phase} interactive={done} onPluck={pluck} />
      </div>

      <div className={`break-zone ${done ? "ready" : ""}`} data-drop="break">
        <div className="en">the breaking stone</div>
        <div className="jp">割リ石</div>
      </div>
    </div>
  );
}
