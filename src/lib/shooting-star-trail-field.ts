import { pickFireGlyph, type FireSample } from "@/lib/fire-field";

const EMPTY: FireSample = { character: " ", opacity: 0, intensity: 0 };

function smooth(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function fraction(value: number) {
  return value - Math.floor(value);
}

function seed(value: number) {
  const hashed = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return hashed - Math.floor(hashed);
}

function cometEnvelope(along: number, cross: number) {
  if (along < 0 || along > 1) return 0;
  const dist = Math.abs(cross);
  if (dist >= 1.12) return 0;
  const edge = smooth(1 - Math.min(1, dist));
  const alongGlow = Math.pow(Math.max(0, Math.min(1, along)), 0.42);
  return edge * (0.22 + smooth(alongGlow) * 0.78);
}

/**
 * `headAlong` is the live star on the shared flight curve (0 = tail, 1 = head).
 * Glyphs exist behind that head, bright at the star and fading down the tail.
 */
export function sampleShootingStarTrail(
  along: number,
  cross: number,
  column: number,
  row: number,
  time: number,
  headAlong: number,
  idle: boolean,
): FireSample {
  const ahead = along - headAlong;
  if (ahead > 0.08) return EMPTY;

  const envelope = cometEnvelope(along, cross);
  if (envelope <= 0.02) return EMPTY;

  const tongues =
    Math.sin(along * 18 + time * 4.4 + column * 0.35) * 0.14 +
    Math.sin(along * 31 - time * 3.2 + row * 0.4) * 0.08;
  const behind = Math.max(0, headAlong - along);
  const windowFade = smooth(1 - behind / Math.max(0.2, headAlong + 0.16));
  let intensity = envelope * (0.88 + tongues) * (0.45 + 0.55 * windowFade);
  if (ahead > 0) intensity *= 1 - ahead / 0.08;
  intensity *= 0.5 + Math.pow(Math.max(0, along), 0.45) * 0.85;

  if (idle) {
    const stream = fraction(time * 0.78 + along * 1.7 + seed(column * 13 + row * 9) * 0.4);
    const pulse = Math.sin(stream * Math.PI) ** 2;
    intensity *= 0.74 + 0.36 * pulse;
    intensity += (1 - along) * 0.12 * pulse;
  }

  if (intensity <= 0.02) return EMPTY;

  return {
    character: pickFireGlyph(intensity, column, row, time),
    opacity: Math.min(1, smooth(intensity / 0.42) * (0.5 + along * 0.5)),
    intensity: Math.min(1, intensity),
  };
}

export type TrailCrackle = {
  along: number;
  cross: number;
  tailAlong: number;
  tailCross: number;
  phase: number;
  burst: number;
};

/** Embers spawned at the head and pushed out toward the tail. */
export function shootingStarCrackles(time: number, identityOffset: number): TrailCrackle[] {
  const crackles: TrailCrackle[] = [];
  const cycle = Math.floor(time / 1.25);

  for (let event = cycle - 1; event <= cycle; event += 1) {
    const delay = 0.04 + seed(event * 9.7 + identityOffset) * 0.2;
    const count = seed(event * 4.1 + identityOffset) > 0.4 ? 5 : 4;
    for (let index = 0; index < count; index += 1) {
      const identity = event * 17.3 + index * 5.9 + identityOffset;
      const age = time - event * 1.25 - delay - index * 0.035;
      const flight = 0.65 + seed(identity + 1) * 0.5;
      const burstDuration = 0.2;
      if (age < 0 || age >= flight + burstDuration) continue;
      const phase = Math.min(age / flight, 1);
      const burst = Math.max(0, (age - flight) / burstDuration);
      const startAlong = 0.84 + seed(identity + 2) * 0.14;
      const travel = 0.5 + seed(identity + 3) * 0.38;
      const cross = (seed(identity + 4) - 0.5) * 1.1;
      const wobble = Math.sin(phase * Math.PI) * (seed(identity + 5) - 0.5) * 0.25;
      const alongAt = (progress: number) => startAlong - travel * progress;
      crackles.push({
        along: alongAt(phase),
        cross: cross + wobble * phase,
        tailAlong: alongAt(Math.max(0, phase - 0.14)),
        tailCross: cross + wobble * Math.max(0, phase - 0.14),
        phase,
        burst,
      });
    }
  }
  return crackles;
}
