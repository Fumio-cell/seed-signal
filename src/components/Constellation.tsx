import { useMemo } from "react";
import type { ConstellationGraph } from "../lib/lexicon";

// A force-directed-style graph: one node per sealed haiku, edges between
// haiku that share a motif word. Simple manual physics (repulsion +
// spring attraction, damped over a fixed number of iterations) — no
// charting library, consistent with the rest of the app's zero-dependency
// approach.

const W = 640;
const H = 420;
const ITER = 140;

interface Pos {
  x: number;
  y: number;
}

function layout(graph: ConstellationGraph): Map<string, Pos> {
  const pos = new Map<string, Pos>();
  const n = graph.nodes.length;
  graph.nodes.forEach((node, i) => {
    const a = (i / Math.max(1, n)) * Math.PI * 2;
    pos.set(node.id, {
      x: W / 2 + Math.cos(a) * Math.min(W, H) * 0.32,
      y: H / 2 + Math.sin(a) * Math.min(W, H) * 0.32,
    });
  });

  const ids = graph.nodes.map((n2) => n2.id);
  for (let iter = 0; iter < ITER; iter++) {
    const damp = 1 - iter / ITER;
    const disp = new Map<string, Pos>(ids.map((id) => [id, { x: 0, y: 0 }]));

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos.get(ids[i])!;
        const b = pos.get(ids[j])!;
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const rep = 1400 / (dist * dist);
        dx = (dx / dist) * rep;
        dy = (dy / dist) * rep;
        disp.get(ids[i])!.x += dx;
        disp.get(ids[i])!.y += dy;
        disp.get(ids[j])!.x -= dx;
        disp.get(ids[j])!.y -= dy;
      }
    }

    for (const e of graph.edges) {
      const a = pos.get(e.a);
      const b = pos.get(e.b);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const target = 130;
      const force = (dist - target) * 0.02;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      disp.get(e.a)!.x += fx;
      disp.get(e.a)!.y += fy;
      disp.get(e.b)!.x -= fx;
      disp.get(e.b)!.y -= fy;
    }

    for (const id of ids) {
      const p = pos.get(id)!;
      const d = disp.get(id)!;
      p.x = Math.min(W - 20, Math.max(20, p.x + d.x * damp * 0.6));
      p.y = Math.min(H - 20, Math.max(20, p.y + d.y * damp * 0.6));
    }
  }

  return pos;
}

interface Props {
  graph: ConstellationGraph;
  onSelect?: (id: string) => void;
}

export function Constellation({ graph, onSelect }: Props) {
  const positions = useMemo(() => layout(graph), [graph]);

  if (graph.nodes.length === 0) {
    return <div className="muted constellation-empty">seal a few more haiku to see them connect.</div>;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="constellation" xmlns="http://www.w3.org/2000/svg">
      {graph.edges.map((e, i) => {
        const a = positions.get(e.a)!;
        const b = positions.get(e.b)!;
        return (
          <g key={i} className="constellation-edge">
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2} textAnchor="middle">
              {e.word}
            </text>
          </g>
        );
      })}
      {graph.nodes.map((node) => {
        const p = positions.get(node.id)!;
        return (
          <g
            key={node.id}
            className="constellation-node"
            transform={`translate(${p.x}, ${p.y})`}
            onClick={() => onSelect?.(node.id)}
          >
            <circle r={9} />
            <text y={-14} textAnchor="middle">
              {node.title || node.number}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
