import { gsap } from "gsap";
import { ORIGINAL_STAR_OUTLINE, starOutline } from "./star-shape";
import { SPLASH_DROPLETS, splashKeyframes } from "./water-splashes";
import { SPLASH_CELLS, splashGlyph } from "./water-splash-art";
import { BOAT_DURATION, boatPathKeyframes } from "./boat-motion";

export type WaterMotion = {
  selector: string;
  keyframes: (unit: number) => Keyframe[];
  options: KeyframeAnimationOptions;
};

type TimedPose = {
  at: number;
  easing?: string;
};

type RecoveryPose = TimedPose & {
  x: number;
  y: number;
  tilt: number;
  scale: readonly [number, number];
};

type ArmPose = TimedPose & { tilt: number };
type EyePose = TimedPose & { scale: number };

const RECOVERY_DURATION = 68000;
const SUBMERGED_PAUSE = 2000;
const SOFT = "cubic-bezier(.42,0,.58,1)";
const FALL = "cubic-bezier(.55,0,.85,.45)";
const POP = "cubic-bezier(.08,.78,.18,1)";
// With linear time on the x axis, these controls produce y = t²: one
// uninterrupted, accelerating descent instead of easing into separate steps.
const SINK = "cubic-bezier(.333333,0,.666667,.333333)";

// Unequal quiet intervals keep the mishaps occasional. Each starts and ends
// at the native pose while the separate idle track continues underneath it.
const RECOVERY_BEATS = [
  { at: 6800, direction: 1, strength: 1 },
  { at: 25900, direction: -1, strength: .92 },
  { at: 49300, direction: 1, strength: 1.08 },
] as const;
type RecoveryBeat = (typeof RECOVERY_BEATS)[number];

const RECOVERY_POSES: readonly RecoveryPose[] = [
  { at: 0, x: 0, y: 0, tilt: 0, scale: [1, 1], easing: SOFT },
  // Hold the shoulders at the surface while paddling. Sinking throughout
  // these strokes would cancel their lift and hide the left arm in the water.
  { at: 640, x: 3, y: -16, tilt: 4, scale: [.99, 1.01] },
  { at: 980, x: -3, y: -6, tilt: -3, scale: [1.02, .98] },
  { at: 1310, x: 4, y: -18, tilt: 5, scale: [.98, 1.02] },
  { at: 1640, x: -4, y: -2, tilt: -4, scale: [1.015, .985] },
  { at: 1990, x: 5, y: -8, tilt: 5, scale: [.98, 1.02] },
  { at: 2330, x: -2, y: 8, tilt: -2, scale: [1.01, .99], easing: SINK },
  // Keep a restrained lean as support gives way; no sideways reversals or
  // intermediate stops before the star disappears behind the foreground.
  { at: 3070, x: 6, y: 320, tilt: 3, scale: [.98, 1.03] },
  // Add two seconds completely underwater, preserving the wind-up and pop.
  { at: 3070 + SUBMERGED_PAUSE, x: 6, y: 320, tilt: 3, scale: [.98, 1.03] },
  { at: 3290 + SUBMERGED_PAUSE, x: 3, y: 338, tilt: 6, scale: [1.1, .84] },
  { at: 3400 + SUBMERGED_PAUSE, x: 2, y: 338, tilt: 3, scale: [1.14, .8], easing: POP },
  // A buoyant pop, a short hang, and a single diminishing rebound.
  { at: 3740 + SUBMERGED_PAUSE, x: -6, y: -78, tilt: -12, scale: [.87, 1.13] },
  { at: 3880 + SUBMERGED_PAUSE, x: -4, y: -92, tilt: -7, scale: [.95, 1.06], easing: FALL },
  { at: 4200 + SUBMERGED_PAUSE, x: 3, y: 14, tilt: 7, scale: [1.1, .9], easing: POP },
  { at: 4470 + SUBMERGED_PAUSE, x: -2, y: -14, tilt: -4, scale: [.98, 1.04] },
  { at: 4800 + SUBMERGED_PAUSE, x: 1, y: 3, tilt: 2, scale: [1.02, .99] },
  { at: 5200 + SUBMERGED_PAUSE, x: 0, y: 0, tilt: 0, scale: [1, 1], easing: "linear" },
];

const ARM_POSES: readonly ArmPose[] = [
  { at: 0, tilt: 0 },
  { at: 300, tilt: 12 },
  { at: 500, tilt: 28 },
  { at: 800, tilt: -20 },
  { at: 1130, tilt: 30 },
  { at: 1450, tilt: -22 },
  { at: 1780, tilt: 28 },
  { at: 2110, tilt: -18 },
  { at: 2400, tilt: 18 },
  { at: 2700, tilt: 9 },
  { at: 3100, tilt: 0 },
  { at: 3100 + SUBMERGED_PAUSE, tilt: 0 },
  // Limbs lag the upward launch, then catch up on landing.
  { at: 3400 + SUBMERGED_PAUSE, tilt: -12 },
  { at: 3600 + SUBMERGED_PAUSE, tilt: -26 },
  { at: 3850 + SUBMERGED_PAUSE, tilt: -10 },
  { at: 4100 + SUBMERGED_PAUSE, tilt: 16 },
  { at: 4350 + SUBMERGED_PAUSE, tilt: -7 },
  { at: 4700 + SUBMERGED_PAUSE, tilt: 2 },
  { at: 5200 + SUBMERGED_PAUSE, tilt: 0, easing: "linear" },
];

const EYE_POSES: readonly EyePose[] = [
  { at: 0, scale: 1 },
  { at: 500, scale: 1.22 },
  // One worried expression lasts through paddling, sinking, and resurfacing.
  { at: 4200 + SUBMERGED_PAUSE, scale: 1.22 },
  { at: 4900 + SUBMERGED_PAUSE, scale: 1 },
  { at: 5200 + SUBMERGED_PAUSE, scale: 1, easing: "linear" },
];

// All acting tracks use the same beat offsets and clock. The first and last
// poses are neutral, so the long gaps and the 68-second loop have no reset.
function repeatRecovery<T extends TimedPose>(
  poses: readonly T[],
  frame: (pose: T, beat: RecoveryBeat) => Keyframe,
): Keyframe[] {
  const neutral = { ...frame(poses[0], RECOVERY_BEATS[0]), easing: "linear" };
  return [
    { ...neutral, offset: 0 },
    ...RECOVERY_BEATS.flatMap((beat) => poses.map((pose) => ({
      ...frame(pose, beat),
      easing: pose.easing ?? SOFT,
      offset: (beat.at + pose.at) / RECOVERY_DURATION,
    }))),
    { ...neutral, offset: 1 },
  ];
}

function recoveryKeyframes(unit: number): Keyframe[] {
  return repeatRecovery(RECOVERY_POSES, (pose, beat) => ({
    translate: `${pose.x * beat.direction * unit}px ${pose.y * beat.strength * unit}px`,
    rotate: `${pose.tilt * beat.direction}deg`,
    scale: `${pose.scale[0]} ${pose.scale[1]}`,
  }));
}

function eyeKeyframes(): Keyframe[] {
  return repeatRecovery(EYE_POSES, (pose) => ({
    scale: pose.scale,
  }));
}

export const WATER_MOTION: readonly WaterMotion[] = [
  {
    selector: '[data-animation="boat-drift"]',
    keyframes: boatPathKeyframes,
    options: { duration: BOAT_DURATION, iterations: Infinity },
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
  // Eye transforms stay in the SVG's local coordinates as the scene resizes.
  ...(["left", "right"] as const).map((side): WaterMotion => ({
    selector: `[data-animation="yellow-star-eye-${side}"]`,
    keyframes: eyeKeyframes,
    options: { duration: RECOVERY_DURATION, iterations: Infinity },
  })),
  // These stay at the waterline while the character bobs and sinks.
  ...SPLASH_DROPLETS.map((droplet): WaterMotion => ({
    selector: `[data-animation="water-splash-${droplet.id}"]`,
    keyframes: (unit) => splashKeyframes(droplet, unit, RECOVERY_BEATS, RECOVERY_DURATION),
    options: { duration: RECOVERY_DURATION, iterations: Infinity },
  })),
];

/** Bend the one body outline, always sampling the existing body animation's
 * clock. Writing the SVG attribute also works without CSS `d` support. */
export function createStarOutlineMotion(path: SVGPathElement, clock: Animation) {
  const host = path.closest('[data-animation="yellow-star-balance"]');
  let outline = path;
  const pose = { left: 0, right: 0 };
  const timeline = gsap.timeline({ paused: true, repeat: -1 });
  timeline.set(pose, { left: 0, right: 0 }, 0);

  RECOVERY_BEATS.forEach((beat) => {
    (["left", "right"] as const).forEach((side) => {
      const at = (pose: ArmPose) => pose.at + (side === "right" && pose.at > 0 && pose.at < 2400 ? 120 : 0);
      // The distal tips get the authored angle; the spatial bend fades it
      // smoothly through the shoulders without weakening the whole stroke.
      const angle = (pose: ArmPose) => pose.tilt * (side === "left" ? 1 : -.92) * beat.strength;
      ARM_POSES.slice(1).forEach((next, index) => {
        const previous = ARM_POSES[index];
        timeline.fromTo(pose, { [side]: angle(previous) }, {
          [side]: angle(next),
          duration: (at(next) - at(previous)) / 1000,
          ease: "sine.inOut",
          immediateRender: false,
        }, (beat.at + at(previous)) / 1000);
      });
    });
  });
  // Keep the quiet tail of the 68-second cycle, too.
  timeline.set(pose, { left: 0, right: 0 }, RECOVERY_DURATION / 1000);

  let ticking = false;
  let previousLeft = 0;
  let previousRight = 0;
  const render = () => {
    // A streamed child refresh can replace the SVG without remounting Scene.
    // Rebind instead of continuing to animate a detached, invisible path.
    if (!outline.isConnected && host?.isConnected) {
      const replacement = host.querySelector<SVGPathElement>('[data-animation="yellow-star-outline"]');
      if (replacement) {
        outline = replacement;
        previousLeft = previousRight = NaN;
      }
    }
    timeline.totalTime(Number(clock.currentTime ?? 0) / 1000);
    if (pose.left === previousLeft && pose.right === previousRight) return;
    previousLeft = pose.left;
    previousRight = pose.right;
    outline.setAttribute("d", pose.left === 0 && pose.right === 0
      ? ORIGINAL_STAR_OUTLINE
      : starOutline(pose.left, pose.right));
  };

  return {
    sync() {
      render();
      const playing = clock.playState === "running";
      if (playing === ticking) return;
      ticking = playing;
      if (playing) gsap.ticker.add(render);
      else gsap.ticker.remove(render);
    },
    dispose() {
      gsap.ticker.remove(render);
      timeline.kill();
      outline.setAttribute("d", ORIGINAL_STAR_OUTLINE);
    },
  };
}

/** Shares the campfire/sparkler density glyphs and the existing water clock.
 * The particle wrappers and glyphs share the same pause/resume lifecycle. */
export function createWaterSplashArt(root: HTMLElement, clock: Animation) {
  const particles = SPLASH_DROPLETS.map((droplet) => ({
    droplet,
    element: root.querySelector<HTMLElement>('[data-animation="water-splash-' + droplet.id + '"]'),
  }));
  let ticking = false;
  let lastStep = -1;

  const render = () => {
    const elapsed = Number(clock.currentTime ?? 0);
    const step = Math.floor(elapsed / 100);
    if (step === lastStep) return;
    lastStep = step;
    const localTime = elapsed % RECOVERY_DURATION;
    const beat = RECOVERY_BEATS.find(({ at }) => localTime >= at && localTime < at + 3000);
    if (!beat) return;

    particles.forEach((particle) => {
      const { droplet } = particle;
      const age = localTime - beat.at - droplet.at;
      if (age <= 0 || age >= droplet.flight) return;
      if (!particle.element?.isConnected) {
        particle.element = root.querySelector<HTMLElement>('[data-animation="water-splash-' + droplet.id + '"]');
      }
      if (particle.element) {
        particle.element.querySelectorAll<SVGTSpanElement>("[data-splash-cell]").forEach((cell, index) => {
          const glyph = splashGlyph(SPLASH_CELLS[index], droplet.variant, elapsed / 1000);
          if (cell.textContent !== glyph) cell.textContent = glyph;
        });
      }
    });
  };

  return {
    sync() {
      render();
      const playing = clock.playState === "running";
      if (playing === ticking) return;
      ticking = playing;
      if (playing) gsap.ticker.add(render);
      else gsap.ticker.remove(render);
    },
    dispose() {
      gsap.ticker.remove(render);
    },
  };
}
