import type { CanvasRegion } from "./canvas-viewport";

type CellPoint = { x: number; y: number; strength: number };

/** Merge lit cells and cursor candidates in their original, stable paint order. */
export function glowCandidates<T extends CellPoint>(
  cells: readonly T[],
  active: readonly T[],
  cursor: CanvasRegion | null = null,
): readonly T[] {
  if (!cursor) return active;
  // The uncommon pointer path includes unlit cells, which can reveal dark sky.
  // Preserve ordering and visit each cell at most once even when both apply.
  return cells.filter(cell => cell.strength > 0 || (cell.x >= cursor.left && cell.x <= cursor.right &&
    cell.y >= cursor.top && cell.y <= cursor.bottom));
}
