import { SPLASH_ART } from "./water-splash-art";

type SplashBeat = { at: number; strength: number };

export type SplashDroplet = {
  id: string;
  variant: number;
  x: number;
  y: number;
  height: number;
  mirror: boolean;
  at: number;
  flight: number;
  drift: number;
  rise: number;
};

const STROKES = [620, 1270, 1930] as const;
const SPRAY = [
  { height: 36, delay: 0, flight: 590, drift: 75, rise: 48 },
  { height: 29, delay: 65, flight: 690, drift: 120, rise: 72 },
  { height: 22, delay: 130, flight: 760, drift: 165, rise: 96 },
] as const;

// The emitters belong to the scene's surface, not the moving character.
// Three fanned arcs give each stroke a visible spray without merging the drops.
export const SPLASH_DROPLETS: readonly SplashDroplet[] = (["left", "right"] as const)
  .flatMap((side) => STROKES.flatMap((stroke, strokeIndex) => SPRAY.map((spray, index) => {
    const direction = side === "left" ? -1 : 1;
    const variation = [1, .91, 1.05][strokeIndex];
    const variant = (side === "left" ? 0 : STROKES.length * SPRAY.length) + strokeIndex * SPRAY.length + index;
    return {
      id: `${side}-${strokeIndex}-${index}`,
      variant,
      x: (side === "left" ? 190 : 378) + direction * (index % 2 === 0 ? -3 : 3),
      y: 420,
      height: spray.height,
      mirror: side === "right",
      at: stroke + spray.delay + (side === "right" ? 120 : 0),
      flight: spray.flight,
      drift: spray.drift * direction * variation,
      rise: spray.rise * variation,
    };
  })));

/** Small ballistic arcs: leave the water quickly, crest, then fall back in.
 * The body animation supplies its shared beats and clock duration so sprays
 * follow the same pause, resize, and reduced-motion lifecycle as the star. */
export function splashKeyframes(
  droplet: SplashDroplet,
  unit: number,
  beats: readonly SplashBeat[],
  duration: number,
): Keyframe[] {
  const hidden: Keyframe = { opacity: 0, translate: "0px 0px", rotate: "0deg", easing: "linear" };
  // The reference leans left: its rounded head is below/right of the tip.
  // Account for that native axis and the mirrored right-hand artwork.
  const headAngle = Math.atan2(.65, .38 * SPLASH_ART.aspect) * 180 / Math.PI;
  const nativeHeading = droplet.mirror ? 180 - headAngle : headAngle;
  const samples = Array.from({ length: 33 }, (_, index) => index / 32);
  return [
    { ...hidden, offset: 0 },
    ...beats.flatMap((beat) => samples.map((progress): Keyframe => {
      const horizontal = Math.abs(droplet.drift);
      const vertical = 4 * droplet.rise * (2 * progress - 1);
      const heading = Math.atan2(vertical, horizontal) * 180 / Math.PI;
      // Unwrap the left arc through 180° so crossing the crest never spins.
      const travelHeading = droplet.drift < 0 ? 180 - heading : heading;
      return {
        offset: (beat.at + droplet.at + droplet.flight * progress) / duration,
        translate: `${droplet.drift * beat.strength * progress * unit}px ${-4 * droplet.rise * beat.strength * progress * (1 - progress) * unit}px`,
        rotate: `${travelHeading - nativeHeading}deg`,
        opacity: .95 * Math.min(1, progress / .12, (1 - progress) / .45),
        easing: "linear",
      };
    })),
    { ...hidden, offset: 1 },
  ];
}
