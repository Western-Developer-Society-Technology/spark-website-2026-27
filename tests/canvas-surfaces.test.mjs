import assert from "node:assert/strict";
import test from "node:test";
import { canvasSurface, canvasSurfaceStyle, maskedCanvasRegion, intersectCanvasRegions,
  canvasDirtyRegion, copyBloomRegion } from "../src/lib/canvas-viewport.ts";
import { glowCandidates } from "../src/lib/ascii-cells.ts";

test("mask crops contain every potentially visible point plus the blur guard", () => {
  for (const [width, height] of [[898, 898], [944, 943], [327, 414]]) {
    for (const [radius, end] of [[.4, .6], [.42, .62], [.38, .58]]) {
      const crop = maskedCanvasRegion(width, height, radius, end);
      for (let angle = 0; angle < Math.PI * 2; angle += .01) {
        const x = width / 2 + Math.cos(angle) * radius * end * width;
        const y = height / 2 + Math.sin(angle) * radius * end * height;
        assert.ok(x - crop.left >= 32 && crop.right - x >= 32);
        assert.ok(y - crop.top >= 32 && crop.bottom - y >= 32);
      }
    }
  }
  assert.deepEqual(maskedCanvasRegion(100, 80, NaN, .6), { left: 0, top: 0, right: 100, bottom: 80 });
});

test("cropping preserves original glyph and mask coordinates at fractional sizes and DPR", () => {
  for (const dpr of [1, 1.25, 1.5, 1.75, 2]) {
    const width = 899, height = 897, cssWidth = 898.414, cssHeight = 897.078;
    const crop = maskedCanvasRegion(width, height, .4, .6);
    const s = canvasSurface(width, height, crop, dpr);
    const css = canvasSurfaceStyle(s, cssWidth, cssHeight);
    const placedLeft = parseFloat(css.left) / 100 * cssWidth;
    const placedTop = parseFloat(css.top) / 100 * cssHeight;
    for (const [x, y] of [[300.123, 350.77], [499.333, 544.321]]) {
      const newX = placedLeft + (x * dpr - s.left) / s.width * parseFloat(css.width) / 100 * cssWidth;
      const newY = placedTop + (y * dpr - s.top) / s.height * parseFloat(css.height) / 100 * cssHeight;
      assert.ok(Math.abs(newX - x * dpr / s.fullWidth * cssWidth) < 1e-10);
      assert.ok(Math.abs(newY - y * dpr / s.fullHeight * cssHeight) < 1e-10);
    }
    const [maskX, maskY] = css.maskPosition.split(" ").map(parseFloat);
    assert.ok(Math.abs(maskX + placedLeft) < 1e-10);
    assert.ok(Math.abs(maskY + placedTop) < 1e-10);
    assert.ok(s.left <= crop.left * dpr && s.left + s.width >= crop.right * dpr);
  }
});

test("cropped bloom samples the same full-resolution pixels as the original copy", () => {
  for (const dpr of [1, 1.25, 1.5, 2]) {
    const crop = maskedCanvasRegion(899, 897, .42, .62);
    const source = canvasSurface(899, 897, crop, dpr), bloom = canvasSurface(899, 897, crop, 1);
    const region = { left: 300, top: 350, right: 450, bottom: 520 };
    let draw, clear;
    const context = { drawImage: (...args) => draw = args, clearRect: (...args) => clear = args };
    copyBloomRegion(source, bloom, context, region, { source, bloom });
    const [, sx, sy, sw, sh, dx, dy, dw, dh] = draw;
    for (const t of [0, .25, 1]) {
      assert.ok(Math.abs(sx + t * sw + source.left - (dx + t * dw + bloom.left) * source.fullWidth / bloom.fullWidth) < 1e-10);
      assert.ok(Math.abs(sy + t * sh + source.top - (dy + t * dh + bloom.top) * source.fullHeight / bloom.fullHeight) < 1e-10);
    }
    assert.deepEqual(clear, [region.left - bloom.left, region.top - bloom.top, 150, 170]);
  }
});

test("scroll jumps clear previous ink within the cropped surface", () => {
  const crop = { left: 200, top: 200, right: 700, bottom: 700 };
  const previous = { left: 200, top: 200, right: 700, bottom: 400 };
  const current = { left: 200, top: 500, right: 700, bottom: 700 };
  assert.deepEqual(intersectCanvasRegions(canvasDirtyRegion(current, previous, 900, 900), crop), crop);
  assert.deepEqual(intersectCanvasRegions(canvasDirtyRegion(null, previous, 900, 900), crop),
    { left: 200, top: 200, right: 700, bottom: 424 });
});

test("cursor candidates retain dark reveals, original paint order, and unique membership", () => {
  const cells = Array.from({ length: 6 }, (_, id) => ({ id, x: id * 10, y: 20, strength: id % 2 }));
  const lit = cells.filter(c => c.strength > 0);
  assert.equal(glowCandidates(cells, lit), lit);
  assert.deepEqual(glowCandidates(cells, lit, { left: 15, top: 10, right: 40, bottom: 30 }).map(c => c.id), [1, 2, 3, 4, 5]);
  assert.deepEqual(glowCandidates(cells, lit, { left: 100, top: 100, right: 200, bottom: 200 }), lit);
});
