// Pointer-capture drag helper. All drag interactions use the Pointer Events
// API with setPointerCapture on the actual dragged element — this proved
// reliable for both mouse and touch, unlike clone-and-position:fixed.

export interface DragCallbacks {
  onMove?: (x: number, y: number, el: HTMLElement | SVGGraphicsElement) => void;
  onDrop: (x: number, y: number, el: HTMLElement | SVGGraphicsElement) => void;
}

export function startDrag(
  e: React.PointerEvent<Element>,
  cb: DragCallbacks
): void {
  const el = e.currentTarget as unknown as HTMLElement;
  try {
    el.setPointerCapture(e.pointerId);
  } catch {
    // no active pointer (e.g. synthetic events) — listeners still work
  }
  const sx = e.clientX;
  const sy = e.clientY;
  let moved = false;

  const move = (ev: PointerEvent) => {
    moved = true;
    el.style.transform = `translate(${ev.clientX - sx}px, ${ev.clientY - sy}px)`;
    el.classList.add("dragging");
    cb.onMove?.(ev.clientX, ev.clientY, el);
  };
  const up = (ev: PointerEvent) => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
    el.classList.remove("dragging");
    el.style.transform = "";
    if (moved) cb.onDrop(ev.clientX, ev.clientY, el);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
}

// Find the drop target under a point, ignoring the dragged element itself.
export function dropTargetAt(
  x: number,
  y: number,
  attr: string,
  dragged?: HTMLElement | SVGGraphicsElement
): HTMLElement | null {
  const style = dragged ? (dragged as HTMLElement).style : null;
  const prev = style?.visibility ?? "";
  if (style) style.visibility = "hidden";
  const hit = document.elementFromPoint(x, y);
  if (style) style.visibility = prev;
  return hit ? (hit.closest(`[${attr}]`) as HTMLElement | null) : null;
}
