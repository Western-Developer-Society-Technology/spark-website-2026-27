import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ORIGINAL_STAR_OUTLINE, starOutline } from "../src/components/sections/Faq/star-shape.ts";

const artwork = readFileSync(new URL("./fixtures/yellow-star.svg", import.meta.url), "utf8");
const sourceOutline = artwork.match(/<path d="([^"]+)"/)[1];
const poses = [
  ...[-40, -20, 0, 20, 40].flatMap((left) => [-40, -20, 0, 20, 40].map((right) => [left, right])),
  [30, -27.6], [-22, 20.24], [18, -16], [-14, 18], [12, -7], [-8, 4],
  ...[.1, .3, .5, .7, .9].map((t) => [40 - 80 * t, -40 + 80 * t]),
];

function segments(outline) {
  let cursor;
  const result = [];
  for (const command of outline.match(/[MCL][^MCLZ]+/g)) {
    const values = command.slice(1).trim().split(/[\s,]+/).map(Number);
    assert.ok(values.every(Number.isFinite), "coordinates must be finite");
    const point = (index) => values.slice(index, index + 2);
    if (command[0] === "M") {
      cursor = point(0);
      continue;
    }
    const end = point(command[0] === "L" ? 0 : 4);
    result.push({ start: cursor, end, controls: command[0] === "C" ? [point(0), point(2)] : null });
    cursor = end;
  }
  return result;
}

function evaluate(segment, t) {
  const { start, end, controls } = segment;
  return start.map((value, axis) => controls
    ? (1 - t) ** 3 * value + 3 * (1 - t) ** 2 * t * controls[0][axis]
      + 3 * (1 - t) * t ** 2 * controls[1][axis] + t ** 3 * end[axis]
    : (1 - t) * value + t * end[axis]);
}

const subtract = (a, b) => a.map((value, axis) => value - b[axis]);
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const orientation = (a, b, c) => cross(subtract(b, a), subtract(c, a));

function restingOrientation(point) {
  // Water.module.css presents the source artwork at this native angle.
  const radians = -24.9 * Math.PI / 180;
  return [
    point[0] * Math.cos(radians) - point[1] * Math.sin(radians),
    point[0] * Math.sin(radians) + point[1] * Math.cos(radians),
  ];
}

function sideTip(curves, side) {
  let tip;
  curves.forEach((curve, index) => {
    for (let sample = 0; sample <= 100; sample++) {
      const t = sample / 100;
      const point = restingOrientation(evaluate(curve, t));
      if (!tip || (side === "left" ? point[0] < tip.point[0] : point[0] > tip.point[0])) {
        tip = { index, t, point };
      }
    }
  });
  return tip;
}

function outlinePoints(outline) {
  return segments(outline).flatMap((curve) => (
    Array.from({ length: 12 }, (_, index) => evaluate(curve, index / 12))
  ));
}

function distanceToSegment(point, start, end) {
  const delta = subtract(end, start);
  const relative = subtract(point, start);
  const t = Math.max(0, Math.min(1, (relative[0] * delta[0] + relative[1] * delta[1])
    / (delta[0] ** 2 + delta[1] ** 2)));
  return Math.hypot(relative[0] - t * delta[0], relative[1] - t * delta[1]);
}

function insideContour(point, contour) {
  let inside = false;
  contour.forEach((start, index) => {
    const end = contour[(index + 1) % contour.length];
    if ((start[1] > point[1]) !== (end[1] > point[1])
      && point[0] < start[0] + (end[0] - start[0]) * (point[1] - start[1]) / (end[1] - start[1])) {
      inside = !inside;
    }
  });
  return inside;
}

test("the neutral source remains the original artwork", () => {
  assert.equal(ORIGINAL_STAR_OUTLINE, sourceOutline);
});

test("the canonical neutral curves preserve the original lines and curves", () => {
  const original = segments(sourceOutline);
  const neutral = segments(starOutline(0, 0));
  assert.equal(neutral.length, original.length * 2);
  original.forEach((segment, index) => {
    for (let sample = 0; sample <= 100; sample++) {
      const t = sample / 100;
      const half = t < .5 ? 0 : 1;
      const expected = evaluate(segment, t);
      const actual = evaluate(neutral[index * 2 + half], t * 2 - half);
      assert.ok(Math.hypot(...subtract(actual, expected)) < .000001, `neutral silhouette changed at segment ${index}`);
    }
  });
});

test("every deformed pose stays one closed contour with smooth joins", () => {
  for (const pose of poses) {
    const outline = starOutline(...pose);
    assert.equal((outline.match(/M/g) ?? []).length, 1, "the body must have one contour");
    assert.equal((outline.match(/Z/g) ?? []).length, 1);
    assert.ok(outline.endsWith("Z"));
    assert.match(outline, /^M[\d. -]+(?:C[\d. -]+)+Z$/);
    const curves = segments(outline);
    assert.equal(curves.length, 48, "animation poses must keep matching cubic topology");
    curves.forEach((curve, index) => {
      const next = curves[(index + 1) % curves.length];
      assert.deepEqual(curve.end, next.start, `disconnected outline in pose ${pose}`);
      const incoming = subtract(curve.end, curve.controls[1]);
      const outgoing = subtract(next.controls[0], next.start);
      assert.ok(Math.hypot(...incoming) > 0 && Math.hypot(...outgoing) > 0, "collapsed tangent");
      const dot = incoming[0] * outgoing[0] + incoming[1] * outgoing[1];
      const angle = Math.abs(Math.atan2(cross(incoming, outgoing), dot)) * 180 / Math.PI;
      // The source export already has small decimal-rounding differences.
      assert.ok(angle < .02, `sharp join ${index} in pose ${pose}: ${angle} degrees`);
    });
  }
});

test("both existing side tips make a visible stroke at the native scene size", () => {
  const neutral = segments(starOutline(0, 0));
  const raised = segments(starOutline(30, -27.6));
  const lowered = segments(starOutline(-22, 20.24));
  for (const side of ["left", "right"]) {
    const { index, t } = sideTip(neutral, side);
    const up = restingOrientation(evaluate(raised[index], t));
    const down = restingOrientation(evaluate(lowered[index], t));
    // At the 1512px scene width, one SVG unit is one screen pixel. Track
    // the same material point so body rocking cannot fake an arm stroke.
    assert.ok(down[1] - up[1] >= 40, `${side} tip must sweep at least 40px vertically`);
  }
});

test("bending the arms preserves the head and keeps the face inside the torso", () => {
  const neutral = segments(starOutline(0, 0));
  const headCurves = [0, 41, 42, 43, 44, 45, 46, 47];
  const eyeCenters = [[125.5, 129.7], [169.5, 139.85]];
  for (const pose of poses) {
    const outline = starOutline(...pose);
    const curves = segments(outline);
    headCurves.forEach((index) => {
      assert.deepEqual(curves[index], neutral[index], `head changed in pose ${pose}`);
    });
    const points = outlinePoints(outline);
    for (const eye of eyeCenters) {
      assert.ok(insideContour(eye, points), `eye left the torso in pose ${pose}`);
      // Leave room for each original white stroke and its animated widening.
      const clearance = Math.min(...points.map((point, index) => (
        distanceToSegment(eye, point, points[(index + 1) % points.length])
      )));
      assert.ok(clearance > 24, `arm bend crowded an eye in pose ${pose}`);
    }
  }
});

test("extreme and asymmetric arm bends do not cross the body outline", () => {
  for (const pose of poses) {
    const points = outlinePoints(starOutline(...pose));
    for (let first = 0; first < points.length; first++) {
      for (let second = first + 2; second < points.length; second++) {
        if (first === 0 && second === points.length - 1) continue;
        const a = points[first];
        const b = points[(first + 1) % points.length];
        const c = points[second];
        const d = points[(second + 1) % points.length];
        const crossing = orientation(a, b, c) * orientation(a, b, d) < 0
          && orientation(c, d, a) * orientation(c, d, b) < 0;
        assert.ok(!crossing, `outline crosses itself in pose ${pose}`);
      }
    }
  }
});
