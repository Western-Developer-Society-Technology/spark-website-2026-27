type FireBounds = { left: number; right: number; top: number; bottom: number };

export type FireSample = { character: string; opacity: number };

const CHARACTERS = ".,:;*x%#@";
const EMPTY: FireSample = { character: " ", opacity: 0 };

function smooth(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function seed(value: number) {
  const hashed = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return hashed - Math.floor(hashed);
}

/** Original dense flame, rooted across the wood with a few uneven contact points. */
export function sampleFire(column: number, row: number, bounds: FireBounds, time: number): FireSample {
  const height = bounds.bottom - bounds.top;
  const x = (column - (bounds.left + bounds.right) / 2) / ((bounds.right - bounds.left) / 2);
  const y = (row - bounds.top) / height;
  // The shallow contact follows the front log's slope. Small, uneven roots
  // cross its face without a horizontal shelf or a pointed tail below the fire.
  const underside = 0.965 + 0.11 * x - 0.035 * x * x +
    0.045 * Math.exp(-(((x + 0.08) / 0.5) ** 4)) +
    0.02 * Math.sin(x * 18 + time * 0.7) +
    0.007 * Math.sin(x * 31 - time * 0.5);
  if (y < 0 || y >= underside) return EMPTY;
  const elevation = Math.max(0, 1 - y);
  const bend =
    Math.sin(elevation * 7 - time * 2.2) * elevation * 0.16 +
    Math.sin(elevation * 13 - time * 3.1) * elevation * 0.09;
  const envelope = Math.pow(1 - elevation, 0.8) * 0.88 + 0.025;
  const tongues =
    Math.sin(x * 13 + elevation * 8 - time * 4.2) * 0.12 +
    Math.sin(x * 23 - elevation * 11 + time * 3.5) * 0.07;
  const intensity = (envelope - Math.abs(x - bend) + tongues) / 0.45;
  if (intensity <= 0.02) return EMPTY;

  const flicker = seed(column * 17 + row * 31 + Math.floor(time * 14));
  const index = Math.min(CHARACTERS.length - 1, Math.floor(Math.max(0, intensity) * 5 + flicker * 2));
  return { character: CHARACTERS[index], opacity: smooth((underside - y) / 0.065) };
}
