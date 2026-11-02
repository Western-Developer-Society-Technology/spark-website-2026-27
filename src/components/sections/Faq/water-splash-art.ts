import { pickFireGlyph } from "../../../lib/fire-field";

// Horizontal silhouette extents sampled from the middle-left droplet in the
// supplied reference. Its curved tip leans left of the rounded lower bulb.
const DROPLET_PROFILE = [
  [.1116, .1405],
  [.0702, .2314],
  [.0620, .3058],
  [.0537, .3760],
  [.0496, .4504],
  [.0455, .5248],
  [.0372, .6033],
  [.0289, .6736],
  [.0248, .7438],
  [.0207, .8017],
  [.0124, .8512],
  [.0083, .8926],
  [.0000, .9298],
  [.0000, .9545],
  [.0041, .9793],
  [.0124, .9917],
  [.0248, .9917],
  [.0413, .9876],
  [.0661, .9711],
  [.0950, .9421],
  [.1364, .9050],
  [.1901, .8512],
  [.2769, .7603],
  [.4711, .5702],
] as const;

// Fewer, larger glyphs keep the ASCII readable inside the small droplets.
export const SPLASH_ART = {
  width: 36,
  height: 59.5,
  fontSize: 13.2,
  lineHeight: 59.5 / 6,
  baseline: 9.3,
  columns: 5,
  rows: 6,
  aspect: 242 / 371,
} as const;

const DROPLET_DENSITY = Array.from({ length: SPLASH_ART.rows }, (_, row) => {
  const profilePosition = row * (DROPLET_PROFILE.length - 1) / (SPLASH_ART.rows - 1);
  const lower = Math.floor(profilePosition);
  const upper = Math.min(DROPLET_PROFILE.length - 1, lower + 1);
  const fraction = profilePosition - lower;
  const left = DROPLET_PROFILE[lower][0] * (1 - fraction) + DROPLET_PROFILE[upper][0] * fraction;
  const right = DROPLET_PROFILE[lower][1] * (1 - fraction) + DROPLET_PROFILE[upper][1] * fraction;
  const center = (left + right) / 2;
  const nearestColumn = Math.min(SPLASH_ART.columns - 1, Math.floor(center * SPLASH_ART.columns));
  return Array.from({ length: SPLASH_ART.columns }, (_, column) => {
    const x = (column + .5) / SPLASH_ART.columns;
    // Whole characters define the contour, just as they do in the campfire.
    // Keep a single glyph at the fine tip rather than clipping letters in half.
    if ((x < left || x > right) && column !== nearestColumn) return 0;
    const interior = Math.max(0, 1 - Math.abs(x - center) / ((right - left) / 2));
    return .28 + .67 * Math.sqrt(interior);
  });
});

export type SplashCell = {
  row: number;
  column: number;
  strength: number;
};

export const SPLASH_COLORS = { center: "#ffffff", edge: "#0099ff" } as const;

// Geometry and animated glyphs stay independent of the centered color falloff.
export const SPLASH_CELLS: readonly SplashCell[] = DROPLET_DENSITY.flatMap((row, rowIndex) => (
  row.flatMap((strength, column) => {
    if (strength === 0) return [];
    return [{ row: rowIndex, column, strength }];
  })
));

export function splashGlyph(cell: SplashCell, variant: number, timeSeconds: number): string {
  return pickFireGlyph(cell.strength, cell.column + variant * 7, cell.row + variant * 11, timeSeconds);
}
