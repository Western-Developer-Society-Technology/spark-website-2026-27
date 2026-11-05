import assert from "node:assert/strict";
import test from "node:test";
import { canvasDirtyRegion, canvasViewportRegion } from "../src/lib/canvas-viewport.ts";

test("visible pixels and the glow guard survive transformed parents and partial visibility", () => {
  for (const scale of [0.75, 1, 1.5, 2]) {
    for (const top of [-1200, -400, 0, 760]) {
      const bounds = { left: -100, top, width: 1000 * scale, height: 1200 * scale };
      const region = canvasViewportRegion(bounds, 1000, 1200, 1280, 800);
      // Check actual visible source points, independently of region rounding.
      for (let y = 0; y <= 1200; y += 10) {
        for (let x = 0; x <= 1000; x += 10) {
          const screenX = bounds.left + x * scale;
          const screenY = bounds.top + y * scale;
          if (screenX < 0 || screenX > 1280 || screenY < 0 || screenY > 800) continue;
          assert.ok(region);
          assert.ok(x >= region.left && x <= region.right);
          assert.ok(y >= region.top && y <= region.bottom);
        }
      }
    }
  }
});

test("offscreen or uninitialized canvases have no drawing region", () => {
  assert.equal(canvasViewportRegion({ left: 0, top: 1000, width: 500, height: 500 }, 500, 500, 1280, 800), null);
  assert.equal(canvasViewportRegion({ left: 0, top: 0, width: 0, height: 0 }, 0, 0, 1280, 800), null);
});

test("scroll jumps clear both the previous ink and the destination without leaving stale pixels", () => {
  const previous = { left: 0, top: 0, right: 250, bottom: 200 };
  const current = { left: 100, top: 700, right: 400, bottom: 1000 };
  const dirty = canvasDirtyRegion(current, previous, 500, 1200);
  assert.deepEqual(dirty, { left: 0, top: 0, right: 424, bottom: 1024 });
  assert.deepEqual(canvasDirtyRegion(null, previous, 500, 1200), { left: 0, top: 0, right: 274, bottom: 224 });
  assert.equal(canvasDirtyRegion(null, null, 500, 1200), null);
});
