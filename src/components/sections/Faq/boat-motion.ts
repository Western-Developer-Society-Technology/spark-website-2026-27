export const BOAT_DURATION = 32000;

const RESTING_CENTER_X = 1221.00013;
const TRAVEL = 580;
const HALF_HULL = 150;
const HALF_KEEL = 120;

// Foreground cloud-31.webp's white waterline at a 1512px scene width.
// Samples run from x=440 to x=1440 in 40px steps; y is relative to its crest.
// Only height differences matter, so shared scenery offsets cancel out.
const WAVE_HEIGHTS = [
  27.5, 34, 42, 48.5, 51, 50.5, 50, 49.5, 48.5,
  38, 24, 12.5, 4, 0, 5, 13.5, 19.5, 22.5,
  26, 34.5, 41, 44, 35, 24.5, 16, 7,
] as const;

function waveHeight(x: number): number {
  const position = Math.max(0, Math.min(WAVE_HEIGHTS.length - 1, (x - 440) / 40));
  const index = Math.min(WAVE_HEIGHTS.length - 2, Math.floor(position));
  const t = position - index;
  const a = WAVE_HEIGHTS[Math.max(0, index - 1)];
  const b = WAVE_HEIGHTS[index];
  const c = WAVE_HEIGHTS[index + 1];
  const d = WAVE_HEIGHTS[Math.min(WAVE_HEIGHTS.length - 1, index + 2)];
  // A continuous tangent through the measured crests and troughs.
  return .5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t
    + (3 * b - a - 3 * c + d) * t * t * t);
}

function wavePitch(x: number): number {
  // Average under the hull instead of snapping to each small ripple.
  return Math.atan2(waveHeight(x + HALF_HULL) - waveHeight(x - HALF_HULL), 2 * HALF_HULL)
    * 180 / Math.PI;
}

function travelEase(progress: number): number {
  // Preserve the existing cubic-bezier(.42,0,.58,1) horizontal timing.
  let t = progress;
  for (let iteration = 0; iteration < 6; iteration++) {
    const x = 1.26 * t - .78 * t * t + .52 * t * t * t;
    const derivative = 1.26 - 1.56 * t + 1.56 * t * t;
    t -= (x - progress) / derivative;
  }
  return t * t * (3 - 2 * t);
}

export function boatPathKeyframes(unit: number): Keyframe[] {
  const restingHeight = waveHeight(RESTING_CENTER_X);
  const restingPitch = wavePitch(RESTING_CENTER_X);
  // Dense linear samples follow one continuous path without restarting the
  // easing at each wave crest. WAAPI still handles playback and resizing.
  return Array.from({ length: 321 }, (_, index) => {
    const time = index * 100;
    const progress = time <= 1000 ? 0
      : time < 14500 ? travelEase((time - 1000) / 13500)
        : time <= 16000 ? 1
          : time < 30500 ? 1 - travelEase((time - 16000) / 14500) : 0;
    const x = -TRAVEL * progress;
    const center = RESTING_CENTER_X + x;
    // A broad, flat keel needs extra immersion over a convex crest. Account
    // for both ends so following the center cannot lift the bottom edge clear.
    const keelHeight = (waveHeight(center - HALF_KEEL) + waveHeight(center + HALF_KEEL)) / 2;
    const centerHeight = waveHeight(center);
    const clearance = keelHeight - centerHeight;
    // Blend the extra draft in smoothly rather than changing vertical speed
    // abruptly where a crest starts supporting the ends of the keel.
    const crestImmersion = clearance <= -2 ? 0
      : clearance >= 2 ? clearance : (clearance + 2) ** 2 / 8;
    const ridingHeight = centerHeight + crestImmersion;
    return {
      translate: `${x * unit}px ${(ridingHeight - restingHeight) * unit}px`,
      // Let the existing gentle rocking ride on top of the wave's slope.
      rotate: `${(wavePitch(center) - restingPitch) * .65}deg`,
      offset: time / BOAT_DURATION,
      easing: "linear",
    };
  });
}
