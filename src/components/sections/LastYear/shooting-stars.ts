// Star-head bounds in the authored 1512px composition. Separate, stationary
// markers keep ScrollTrigger's measurements independent of the moving artwork.
// `dip` is how much lower the entrance starts, as a fraction of path length.
// `arc: "overshoot"` dips below rest, rises slightly above, then lands at rest.
export const SHOOTING_STARS = [
  { id: "peach", nodeId: "116:184", left: 277.61, top: 2623, width: 475.648, height: 442.983, side: -1, duration: .95, dip: .08, arc: "overshoot" },
  { id: "yellow", nodeId: "116:208", left: 658, top: 2770, width: 582.876, height: 560.975, side: 1, duration: .98, dip: .09, arc: "overshoot" },
  { id: "blue", nodeId: "116:201", left: 196, top: 3008.8, width: 522.924, height: 500.091, side: -1, duration: .92, dip: .33 },
  { id: "pink", nodeId: "116:231", left: 725, top: 3235, width: 577.893, height: 555.304, side: 1, duration: 1, dip: .32 },
] as const;

export type ShootingStarId = (typeof SHOOTING_STARS)[number]["id"];
