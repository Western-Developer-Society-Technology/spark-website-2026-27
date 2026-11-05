import type { ShootingStarId } from "./shooting-stars";

/** Curved label geometry in a 0–100 viewBox; paired with rendered star PNG size in comp units. */
export type StarBadgeConfig = {
  width: number;
  height: number;
  lines: readonly [string, string];
  topPath: string;
  bottomPath: string;
  topFontSize: number;
  bottomFontSize: number;
};

export const STAR_BADGE_CONFIG: Record<ShootingStarId, StarBadgeConfig> = {
  peach: {
    width: 277,
    height: 247,
    lines: ["110+", "hackers"],
    topPath: "M 18 44 Q 50 37 82 44",
    bottomPath: "M 16 58 Q 50 51 84 58",
    topFontSize: 15.5,
    bottomFontSize: 15.5,
  },
  yellow: {
    width: 267,
    height: 270,
    lines: ["25+", "projects"],
    topPath: "M 20 42 Q 50 36 80 42",
    bottomPath: "M 16 58 Q 50 51 84 58",
    topFontSize: 15.5,
    bottomFontSize: 15.5,
  },
  blue: {
    width: 275,
    height: 259,
    lines: ["36", "hours"],
    topPath: "M 26 45 Q 50 39 74 45",
    bottomPath: "M 18 59 Q 50 52 82 59",
    topFontSize: 16.5,
    bottomFontSize: 16.5,
  },
  pink: {
    width: 268,
    height: 269,
    lines: ["$1k+", "in prizes"],
    topPath: "M 16 45 Q 50 38 84 45",
    bottomPath: "M 10 59 Q 50 52 90 59",
    topFontSize: 14,
    bottomFontSize: 14,
  },
};
