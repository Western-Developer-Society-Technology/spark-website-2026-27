export type WaterMotion = {
  selector: string;
  keyframes: (unit: number) => Keyframe[];
  options: KeyframeAnimationOptions;
};

type RecoveryPose = {
  at: number;
  x: number;
  y: number;
  tilt: number;
  scale: readonly [number, number];
  easing: string;
};

const RECOVERY_DURATION = 68000;
const SOFT = "cubic-bezier(.42,0,.58,1)";
const FALL = "cubic-bezier(.55,0,.85,.45)";
const POP = "cubic-bezier(.08,.78,.18,1)";

// Unequal quiet intervals keep the mishaps occasional. Each starts and ends
// at the native pose while the separate idle track continues underneath it.
const RECOVERY_BEATS = [
  { at: 6800, direction: 1, strength: 1 },
  { at: 25900, direction: -1, strength: .92 },
  { at: 49300, direction: 1, strength: 1.08 },
] as const;

const RECOVERY_POSES: readonly RecoveryPose[] = [
  { at: 0, x: 0, y: 0, tilt: 0, scale: [1, 1], easing: SOFT },
  // A small lean, a counter-lean, then two increasingly frantic corrections.
  { at: 420, x: -4, y: 2, tilt: -7, scale: [1.025, .975], easing: SOFT },
  { at: 670, x: 5, y: 5, tilt: 14, scale: [.98, 1.02], easing: SOFT },
  { at: 800, x: -3, y: 12, tilt: -15, scale: [1.03, .97], easing: SOFT },
  { at: 930, x: 8, y: 25, tilt: 24, scale: [.96, 1.04], easing: FALL },
  { at: 1130, x: 14, y: 70, tilt: 36, scale: [1.02, .96], easing: FALL },
  // The foreground water hides the sinking character, including the wind-up.
  { at: 1440, x: 12, y: 205, tilt: 29, scale: [.92, 1.08], easing: FALL },
  { at: 1630, x: 8, y: 318, tilt: 20, scale: [.91, 1.08], easing: SOFT },
  { at: 1840, x: 4, y: 338, tilt: 12, scale: [1.12, .82], easing: SOFT },
  { at: 1990, x: 2, y: 338, tilt: 7, scale: [1.17, .76], easing: POP },
  // Fast, stretched ascent; hang at the apex, squash on landing, then settle.
  { at: 2310, x: -8, y: -78, tilt: -18, scale: [.84, 1.17], easing: SOFT },
  { at: 2480, x: -6, y: -94, tilt: -10, scale: [.93, 1.08], easing: FALL },
  { at: 2730, x: 3, y: 16, tilt: 10, scale: [1.14, .87], easing: POP },
  { at: 2940, x: -2, y: -18, tilt: -6, scale: [.96, 1.06], easing: SOFT },
  { at: 3170, x: 1, y: 5, tilt: 3, scale: [1.03, .98], easing: SOFT },
  { at: 3460, x: 0, y: 0, tilt: 0, scale: [1, 1], easing: "linear" },
];

function recoveryKeyframes(unit: number): Keyframe[] {
  const neutral: Keyframe = { translate: "0px 0px", rotate: "0deg", scale: "1 1", easing: "linear" };
  return [
    { ...neutral, offset: 0 },
    ...RECOVERY_BEATS.flatMap((beat) => RECOVERY_POSES.map((pose) => ({
      translate: `${pose.x * beat.direction * unit}px ${pose.y * beat.strength * unit}px`,
      rotate: `${pose.tilt * beat.direction}deg`,
      scale: `${pose.scale[0]} ${pose.scale[1]}`,
      easing: pose.easing,
      offset: (beat.at + pose.at) / RECOVERY_DURATION,
    }))),
    { ...neutral, offset: 1 },
  ];
}

export const WATER_MOTION: readonly WaterMotion[] = [
  {
    selector: '[data-animation="boat-drift"]',
    // The hull travels into the left half of the scene beside the floating
    // character. Drift and hull-centred rocking use separate wrappers.
    keyframes: (unit) => [
      { translate: "0px 0px", offset: 0, easing: SOFT },
      { translate: "0px 0px", offset: 1000 / 32000, easing: SOFT },
      { translate: `${-580 * unit}px 0px`, offset: 14500 / 32000, easing: SOFT },
      { translate: `${-580 * unit}px 0px`, offset: 16000 / 32000, easing: SOFT },
      { translate: "0px 0px", offset: 30500 / 32000, easing: SOFT },
      { translate: "0px 0px", offset: 1 },
    ],
    options: { duration: 32000, iterations: Infinity },
  },
  {
    selector: '[data-animation="boat"]',
    keyframes: (unit) => [
      { translate: "0px 0px", rotate: "0deg", offset: 0 },
      { translate: `0px ${-7 * unit}px`, rotate: "-1.2deg", offset: .25 },
      { translate: "0px 0px", rotate: "0deg", offset: .5 },
      { translate: `0px ${7 * unit}px`, rotate: "1.2deg", offset: .75 },
      { translate: "0px 0px", rotate: "0deg", offset: 1 },
    ].map((frame) => ({ ...frame, easing: "ease-in-out" })),
    options: { duration: 5200, iterations: Infinity },
  },
  {
    selector: '[data-animation="yellow-star"]',
    keyframes: (unit) => [
      { translate: "0px 0px", rotate: "0deg", offset: 0 },
      { translate: `0px ${-5 * unit}px`, rotate: "1.8deg", offset: .25 },
      { translate: "0px 0px", rotate: "0deg", offset: .5 },
      { translate: `0px ${5 * unit}px`, rotate: "-1.8deg", offset: .75 },
      { translate: "0px 0px", rotate: "0deg", offset: 1 },
    ].map((frame) => ({ ...frame, easing: "ease-in-out" })),
    options: { duration: 4600, iterations: Infinity },
  },
  {
    selector: '[data-animation="yellow-star-balance"]',
    keyframes: recoveryKeyframes,
    options: { duration: RECOVERY_DURATION, iterations: Infinity },
  },
];
