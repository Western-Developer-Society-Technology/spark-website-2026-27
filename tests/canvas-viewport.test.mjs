import assert from "node:assert/strict";
import test from "node:test";
import { canvasRepaintRegion, canvasViewportRegion } from "../src/lib/canvas-viewport.ts";

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

test("scroll reversals retain cached ink while the next paint is delayed", () => {
  const surface = { left: 0, top: 0, right: 500, bottom: 1200 };
  const cache = new Uint8Array(500 * 1200).fill(1);
  const destination = { left: 100, top: 700, right: 400, bottom: 1000 };
  const paint = canvasRepaintRegion(destination, surface, false);
  for (let y = paint.top; y < paint.bottom; y++) {
    cache.fill(0, y * 500 + paint.left, y * 500 + paint.right);
  }
  // Returning to the old viewport before this new paint finishes must still
  // expose its last complete pixels, rather than transparent erased rows.
  assert.equal(cache[50 * 500 + 50], 1);
  assert.equal(cache[150 * 500 + 200], 1);
  assert.equal(cache[800 * 500 + 200], 0);
  assert.equal(canvasRepaintRegion(null, surface, false), null);
  assert.deepEqual(canvasRepaintRegion(null, surface, true), surface);
});

test("partial paints stay inside the current viewport and complete invalidations cover the surface", () => {
  const surface = { left: 50, top: 75, right: 650, bottom: 1275 };
  for (let top = -1400; top < 1600; top += 37) {
    const viewport = canvasViewportRegion({ left: 0, top, width: 700, height: 1400 }, 700, 1400, 600, 800);
    const paint = canvasRepaintRegion(viewport, surface, false);
    if (paint) {
      assert.ok(paint.left >= surface.left && paint.top >= surface.top);
      assert.ok(paint.right <= surface.right && paint.bottom <= surface.bottom);
      assert.ok(paint.left >= viewport.left && paint.top >= viewport.top);
      assert.ok(paint.right <= viewport.right && paint.bottom <= viewport.bottom);
    }
    assert.deepEqual(canvasRepaintRegion(viewport, surface, true), surface);
  }
});
