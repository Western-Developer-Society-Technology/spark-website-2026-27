/** Keep in sync with --last-year-art-scale in LastYear.module.css */
export const LAST_YEAR_ART_SCALE = 0.91;
export const FIGMA_WIDTH = 1512;

export type FlightPath = {
  kind: "quad" | "cubic";
  fromX: number;
  fromY: number;
  ctrlX: number;
  ctrlY: number;
  ctrl2X: number;
  ctrl2Y: number;
  toX: number;
  toY: number;
};

export function lastYearUnit(viewportWidth: number) {
  return Math.min((viewportWidth / FIGMA_WIDTH) * LAST_YEAR_ART_SCALE, 1);
}

export function departureOffsetX(marker: HTMLElement, side: number, unit: number) {
  const bounds = marker.getBoundingClientRect();
  const gutter = Math.max(24, 40 * unit);
  return side < 0 ? -bounds.right - gutter : window.innerWidth - bounds.left + gutter;
}

export function dipAmount(fromX: number, dip: number) {
  return Math.abs(fromX) * dip;
}

/** Stretch horizontal travel so the trail arc is longer without starting lower. */
export const SHOOTING_STAR_PATH_LENGTH = 1.12;

export function buildShootingStarPath(
  fromX: number,
  dip: number,
  arc: "default" | "overshoot" = "default",
): FlightPath {
  const dipY = dipAmount(fromX, dip);
  const stretchedX = fromX * SHOOTING_STAR_PATH_LENGTH;
  if (arc === "overshoot") return makeOvershootFlightPath(stretchedX, dipY);
  return makeFlightPath(stretchedX, dipY);
}

export const TRAIL_HEAD_HALF = 68;
export const TRAIL_TAIL_HALF = 22;
const TRAIL_THICKNESS_POWER = 0.36;

/** along 0 = tail, 1 = head — keeps head width over more of the trail before tapering. */
export function trailHalfWidth(along: number) {
  const t = Math.max(0, Math.min(1, along));
  return TRAIL_TAIL_HALF + (TRAIL_HEAD_HALF - TRAIL_TAIL_HALF) * t ** TRAIL_THICKNESS_POWER;
}

/**
 * Quadratic from off-screen and below (`fromY` > 0) up to rest (0, 0).
 * Control Y stays >= 0, so the curve never rises above the final pose.
 */
export function makeFlightPath(fromX: number, dipY: number): FlightPath {
  return {
    kind: "quad",
    fromX,
    fromY: dipY,
    ctrlX: fromX * 0.38,
    ctrlY: dipY * 0.16,
    ctrl2X: 0,
    ctrl2Y: 0,
    toX: 0,
    toY: 0,
  };
}

/** Start below rest, arc slightly above rest, then settle at rest. */
export function makeOvershootFlightPath(fromX: number, dipY: number): FlightPath {
  const peakY = Math.max(40, dipY * 1.35);
  return {
    kind: "cubic",
    fromX,
    fromY: dipY,
    ctrlX: fromX * 0.58,
    ctrlY: dipY * 0.78,
    ctrl2X: fromX * 0.16,
    ctrl2Y: -peakY,
    toX: 0,
    toY: 0,
  };
}

export function flightPoint(path: FlightPath, t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const u = 1 - clamped;
  if (path.kind === "cubic") {
    const tt = clamped;
    return {
      x:
        u * u * u * path.fromX
        + 3 * u * u * tt * path.ctrlX
        + 3 * u * tt * tt * path.ctrl2X
        + tt * tt * tt * path.toX,
      y:
        u * u * u * path.fromY
        + 3 * u * u * tt * path.ctrlY
        + 3 * u * tt * tt * path.ctrl2Y
        + tt * tt * tt * path.toY,
    };
  }
  return {
    x: u * u * path.fromX + 2 * u * clamped * path.ctrlX + clamped * clamped * path.toX,
    y: u * u * path.fromY + 2 * u * clamped * path.ctrlY + clamped * clamped * path.toY,
  };
}

export function flightTangent(path: FlightPath, t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  let x: number;
  let y: number;
  if (path.kind === "cubic") {
    const u = 1 - clamped;
    x =
      3 * u * u * (path.ctrlX - path.fromX)
      + 6 * u * clamped * (path.ctrl2X - path.ctrlX)
      + 3 * clamped * clamped * (path.toX - path.ctrl2X);
    y =
      3 * u * u * (path.ctrlY - path.fromY)
      + 6 * u * clamped * (path.ctrl2Y - path.ctrlY)
      + 3 * clamped * clamped * (path.toY - path.ctrl2Y);
  } else {
    x = 2 * (1 - clamped) * (path.ctrlX - path.fromX) + 2 * clamped * (path.toX - path.ctrlX);
    y = 2 * (1 - clamped) * (path.ctrlY - path.fromY) + 2 * clamped * (path.toY - path.ctrlY);
  }
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

export function flightAngle(path: FlightPath, t: number) {
  const tangent = flightTangent(path, t);
  return (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;
}

/** Entrance tilt in degrees — same visual spin for left- and right-side approaches. */
export function entranceTilt(path: FlightPath, t: number) {
  let angle = flightAngle(path, t);
  if (path.fromX > 0) angle += angle > 0 ? -180 : 180;
  return angle * (1 - t);
}
