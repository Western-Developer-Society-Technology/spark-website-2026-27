"use client";

import { useEffect, useRef } from "react";
import { HERO_DURATION } from "./hero-motion";
import styles from "./HeroAscii.module.css";

/** Bright glow uses dense marks, the fade mixes in light ones, and the darkest edge uses only light ones. */
const DENSE_GLYPHS = "#@%&8$0SXBAHK@#X";
const LIGHT_GLYPHS = "x*=+";
const MIXED_GLYPHS = DENSE_GLYPHS + LIGHT_GLYPHS;
/** Cell strength (0–1) at or above which light glyphs are dropped, and below which only light glyphs are used. */
const DENSE_ONLY_ABOVE = 0.6;
const LIGHT_ONLY_BELOW = 0.35;

const FADE_IN = 0.6;
const HOLD = 1.5;
const FADE_OUT = 0.6;
const REST = 0.5;
const CYCLE = FADE_IN + HOLD + FADE_OUT + REST;
const FLIPS_PER_SECOND = 10;
const FRAME_MS = 1000 / 30;
/** Glyph size on the 1512 grid, clamped in CSS pixels so it stops growing on big screens. */
const FONT_UNITS = 12;
const FONT_MIN = 9;
const FONT_MAX = 15;
const SAMPLE_SCALE = 0.2;
/** Brightness (brightest RGB channel) below which no glyph is drawn, and where glyphs reach full strength. */
const BRIGHTNESS_HIDE = 0.08;
const BRIGHTNESS_FULL = 0.45;
/** Below 1, faint edge glyphs stay more visible as the glow fades out. */
const EDGE_OPACITY_CURVE = 0.6;
const COLOR_LIFT = 0.28;
/** Above this sampled brightness, glyph colour mixes further toward white (lens flare / star glow). */
const COLOR_WHITE_FROM = 0.38;
const COLOR_WHITE_MIX = 0.62;
const SKIP_RATE = 0.05;
/** Every eclipse ellipse, in paint order. */
const ECLIPSE_SOURCE_IDS = ["111:95", "111:97", "111:98", "111:99"] as const;
/** Star artwork is sampled for glow colour; glyphs are cleared only where its alpha is high. */
const ECLIPSE_STAR_ID = "111:100";
/** Drop glyphs on the opaque star core, but keep them in the soft outer flare. */
const STAR_MASK_ALPHA = 0.42;

/** Mouse trail: subtle reveal on the same ASCII grid (weaker than the hero streaks). */
const CURSOR_TRAIL_LIFE = 1.15;
const CURSOR_SAMPLE_SPACING = 10;
const CURSOR_RADIUS = 64;
/** Only glyphs this close to the live cursor sample to white; outside stays orange. */
const CURSOR_WHITE_RADIUS = 12;
/** Just outside the core, the head stays extra bright before settling into trail orange. */
const CURSOR_HEAD_HALO = 30;
const CURSOR_MAX_BOOST = 0.88;
/** Lets the cursor tease glyphs out of very dark sky without overpowering the glow sampling. */
const CURSOR_DARK_REVEAL = 0.8;
const CURSOR_MAX_POINTS = 72;

type TrailPoint = { x: number; y: number; t: number };

/** Warm orange along the trail; `along` 0 = tail, 1 = head. */
function trailOrange(along: number, age: number) {
  const vivid = Math.min(1, along * 1.05 + (1 - age) * 0.15);
  const tail = (1 - along) * 0.55 + age * 0.35;
  const strength = Math.max(0.25, vivid - tail * 0.4);
  return [
    Math.round(175 + 80 * strength),
    Math.round(52 + 68 * strength),
    Math.round(4 + 22 * strength),
  ] as const;
}

/** White core only under the cursor; the rim of the core already leans orange. */
function cursorCoreColor(distToHead: number) {
  const t = Math.min(1, distToHead / CURSOR_WHITE_RADIUS);
  const edge = t * t;
  return [
    255,
    Math.round(255 - 90 * edge),
    Math.round(252 - 200 * edge),
  ] as const;
}

/** Hot white-peach ring around the core; fades with distance and trail age. */
function cursorHeadColor(distToHead: number, age: number) {
  if (distToHead <= CURSOR_WHITE_RADIUS) return cursorCoreColor(distToHead);
  const span = Math.max(1, CURSOR_HEAD_HALO - CURSOR_WHITE_RADIUS);
  const t = Math.min(1, (distToHead - CURSOR_WHITE_RADIUS) / span);
  const fresh = Math.min(1, (1 - age) ** 0.65);
  const hot = (1 - t) * fresh;
  return [
    Math.round(255 - 35 * t),
    Math.round(228 - 95 * t + 40 * hot),
    Math.round(168 - 130 * t + 70 * hot),
  ] as const;
}

function mixRgb(base: string, r: number, g: number, b: number, amount: number) {
  const match = /^rgb\((\d+) (\d+) (\d+)\)$/.exec(base);
  const br = match ? Number(match[1]) : 0;
  const bg = match ? Number(match[2]) : 0;
  const bb = match ? Number(match[3]) : 0;
  const mix = Math.min(1, Math.max(0, amount));
  return `rgb(${Math.round(br + (r - br) * mix)} ${Math.round(bg + (g - bg) * mix)} ${Math.round(bb + (b - bb) * mix)})`;
}

/** Returns extra opacity (0–1) and a warm streak colour for this cell from the fading pointer trail. */
function trailInfluence(
  cellX: number,
  cellY: number,
  trail: readonly TrailPoint[],
  now: number,
  bbox: { minX: number; minY: number; maxX: number; maxY: number } | null,
) {
  if (trail.length === 0) return null;
  if (bbox && (cellX < bbox.minX || cellX > bbox.maxX || cellY < bbox.minY || cellY > bbox.maxY)) return null;

  const lifeMs = CURSOR_TRAIL_LIFE * 1000;
  let boost = 0;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let weightSum = 0;
  const last = trail.length - 1;

  for (let index = 0; index < trail.length; index += 1) {
    const point = trail[index];
    const age = (now - point.t) / lifeMs;
    if (age >= 1) continue;
    const dx = cellX - point.x;
    const dy = cellY - point.y;
    const dist = Math.hypot(dx, dy);
    if (dist > CURSOR_RADIUS) continue;
    const spatial = (1 - dist / CURSOR_RADIUS) ** 2;
    const temporal = (1 - age) ** 1.4;
    const along = last > 0 ? index / last : 1;
    let influence = spatial * temporal * CURSOR_MAX_BOOST;
    const isHead = index === last;
    if (isHead) {
      influence *= 1 + (1 - age) * 0.45;
      if (dist <= CURSOR_HEAD_HALO) influence *= 1.12;
    }
    if (influence <= 0.001) continue;
    boost = Math.max(boost, influence);
    const [r, g, b] =
      isHead && dist <= CURSOR_HEAD_HALO ? cursorHeadColor(dist, age) : trailOrange(along, age);
    rSum += r * influence;
    gSum += g * influence;
    bSum += b * influence;
    weightSum += influence;
  }

  if (boost <= 0.002) return null;
  const inv = 1 / weightSum;
  return {
    boost,
    r: Math.round(rSum * inv),
    g: Math.round(gSum * inv),
    b: Math.round(bSum * inv),
  };
}

function trailBounds(trail: readonly TrailPoint[], pad: number) {
  if (trail.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of trail) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

type Point = readonly [number, number];
type ColorStop = readonly [offset: number, r: number, g: number, b: number];

/** Colour from head (0) to tail (1). Fading to black reads as transparent under `screen` blending. */
const ORANGE_RAMP: readonly ColorStop[] = [[0, 255, 140, 70], [0.3, 240, 96, 24], [0.65, 205, 64, 4], [0.92, 90, 26, 0], [1, 0, 0, 0]];
const PEACH_RAMP: readonly ColorStop[] = [[0, 255, 246, 232], [0.25, 255, 222, 208], [0.6, 236, 140, 96], [0.92, 110, 44, 16], [1, 0, 0, 0]];

/** Curved shooting-star glows on the 1512 grid, each a chain of quadratic curves from head to tail. */
const STREAKS = [
  { curves: [[[-20, 92], [520, 96], [680, 150]], [[680, 150], [920, 250], [1230, 620]]], width: 70, ramp: ORANGE_RAMP },
  { curves: [[[1540, 146], [1000, 150], [580, 270]]], width: 58, ramp: PEACH_RAMP },
  { curves: [[[-20, 280], [260, 262], [330, 305]], [[330, 305], [375, 345], [350, 565]]], width: 55, ramp: PEACH_RAMP },
] as const satisfies readonly { curves: readonly (readonly [Point, Point, Point])[]; width: number; ramp: readonly ColorStop[] }[];
const STREAK_STEPS = 48;
/** The tail narrows to this fraction of the head's width. */
const STREAK_TAIL_WIDTH = 0.35;
/** Halo blur on the 1512 grid. */
const STREAK_BLUR = 22;
/** A wide soft halo under a narrower, tighter core; widths and blurs are fractions of the streak's. */
const STREAK_LAYERS = [
  { width: 1, blur: 1, alpha: 0.7 },
  { width: 0.4, blur: 0.35, alpha: 0.95 },
] as const;
/** The streaks are soft, so they render below CSS resolution and get upscaled. */
const STREAK_RESOLUTION = 0.5;
/** Average flight speed in grid units per second. */
const STREAK_SPEED = 1200;
/** Fraction of the eclipse intro at which the streaks fly in. */
const STREAK_ENTER_AT = 0.3;
/** Seconds the streaks rest in place, once all have arrived, before flying off. */
const STREAK_HOLD = 2.5;
/** Seconds between each streak entering, and again between each one leaving. */
const STREAK_STAGGER = 0.15;
/** Rough seconds between repeat flights per streak; each wait is jittered by ±STREAK_JITTER so they never sync up. */
const STREAK_PERIODS = [5, 3.5, 7.5] as const;
const STREAK_JITTER = 0.5;
/** Entering and repeat flights start mid-sky, so they fade in over this fraction of the flight. */
const STREAK_FADE_IN = 0.18;
/** Extra travel past the screen edge so the soft tail fully clears it. */
const STREAK_EXIT_MARGIN = 160;
const PATH_SAMPLES_PER_CURVE = 64;

type Cell = {
  x: number;
  y: number;
  phase: number;
  hold: number;
  strength: number;
  /** Last sampled RGB, so the colour string is only rebuilt when it changes. */
  packed: number;
  color: string;
  glyphs: string;
};

function fract(value: number) {
  return value - Math.floor(value);
}

function seed(value: number) {
  return fract(Math.sin(value * 127.1 + 311.7) * 43758.5453);
}

function wrap(index: number, length: number) {
  return ((index % length) + length) % length;
}

function glyphsFor(strength: number) {
  if (strength >= DENSE_ONLY_ABOVE) return DENSE_GLYPHS;
  if (strength < LIGHT_ONLY_BELOW) return LIGHT_GLYPHS;
  return MIXED_GLYPHS;
}

/** Pulls glyph fill toward white in bright glow, especially the star flare and hot eclipse rim. */
function glyphColor(r: number, g: number, b: number, strength: number) {
  const brightness = Math.max(r, g, b) / 255;
  const hot = Math.min(1, Math.max(0, (brightness - COLOR_WHITE_FROM) / (1 - COLOR_WHITE_FROM)));
  const mix = Math.min(1, COLOR_LIFT * strength + hot * COLOR_WHITE_MIX);
  return `rgb(${Math.round(r + (255 - r) * mix)} ${Math.round(g + (255 - g) * mix)} ${Math.round(b + (255 - b) * mix)})`;
}

function lengths(value: string) {
  return value === "none" ? [] : value.split(/\s+/).map((part) => parseFloat(part) || 0);
}

function quadratic([start, control, end]: readonly [Point, Point, Point], t: number): Point {
  const a = (1 - t) ** 2;
  const b = 2 * (1 - t) * t;
  const c = t ** 2;
  return [a * start[0] + b * control[0] + c * end[0], a * start[1] + b * control[1] + c * end[1]];
}

function rampColor(ramp: readonly ColorStop[], progress: number) {
  const next = ramp.findIndex(([offset]) => offset >= progress);
  if (next <= 0) return `rgb(${ramp[0].slice(1).join(" ")})`;
  const [fromOffset, ...from] = ramp[next - 1];
  const [toOffset, ...to] = ramp[next];
  const mix = (progress - fromOffset) / (toOffset - fromOffset);
  return `rgb(${from.map((channel, index) => Math.round(channel + (to[index] - channel) * mix)).join(" ")})`;
}

/**
 * Each streak's flight path runs from its tail through its head and then straight on past the screen edge.
 * A streak is a window of its own length sliding along that path; at rest its head sits at `length`.
 */
const STREAK_PATHS = STREAKS.map((streak) => {
  const headToTail: Point[] = [];
  streak.curves.forEach((curve, index) => {
    for (let step = index === 0 ? 0 : 1; step <= PATH_SAMPLES_PER_CURVE; step += 1) {
      headToTail.push(quadratic(curve, step / PATH_SAMPLES_PER_CURVE));
    }
  });
  const points = headToTail.reverse();
  const distances = [0];
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1];
    const [x1, y1] = points[index];
    distances.push(distances[index - 1] + Math.hypot(x1 - x0, y1 - y0));
  }
  const length = distances[distances.length - 1];
  const [headX, headY] = points[points.length - 1];
  const [beforeX, beforeY] = points[points.length - 2];
  const run = Math.hypot(headX - beforeX, headY - beforeY) || 1;
  const exit = length + STREAK_EXIT_MARGIN;
  points.push([headX + ((headX - beforeX) / run) * exit, headY + ((headY - beforeY) / run) * exit]);
  distances.push(length + exit);
  return {
    points,
    distances,
    length,
    end: length + exit,
    colors: Array.from({ length: STREAK_STEPS }, (_, step) => rampColor(streak.ramp, step / STREAK_STEPS)),
    widths: Array.from({ length: STREAK_STEPS }, (_, step) => streak.width * (1 - (1 - STREAK_TAIL_WIDTH) * (step / STREAK_STEPS))),
  };
});
type StreakPath = (typeof STREAK_PATHS)[number];

/** Written by HeroStreaks every frame it moves; the ASCII sampler reads it to light up along the live streaks. */
const liveStreaks = {
  version: 0,
  heads: STREAK_PATHS.map(() => 0),
  alphas: STREAK_PATHS.map(() => 0),
};

function pointAt({ points, distances }: StreakPath, distance: number): Point {
  let low = 0;
  let high = distances.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (distances[middle] <= distance) low = middle;
    else high = middle;
  }
  const mix = Math.min(1, Math.max(0, (distance - distances[low]) / (distances[high] - distances[low] || 1)));
  const [x0, y0] = points[low];
  const [x1, y1] = points[high];
  return [x0 + (x1 - x0) * mix, y0 + (y1 - y0) * mix];
}

/** Strokes every live streak sharp, tail first so the head paints on top; blur is applied by the caller. */
function strokeStreaks(context: CanvasRenderingContext2D, unit: number, widthFactor: number) {
  context.save();
  context.setTransform(unit, 0, 0, unit, 0, 0);
  context.lineCap = "round";
  STREAK_PATHS.forEach((path, index) => {
    const head = liveStreaks.heads[index];
    const alpha = liveStreaks.alphas[index];
    if (alpha <= 0) return;
    context.globalAlpha = alpha;
    const step = path.length / STREAK_STEPS;
    for (let segment = STREAK_STEPS - 1; segment >= 0; segment -= 1) {
      const near = head - segment * step;
      if (near <= 0) continue;
      const [fromX, fromY] = pointAt(path, Math.max(0, near - step));
      const [toX, toY] = pointAt(path, near);
      context.strokeStyle = path.colors[segment];
      context.lineWidth = path.widths[segment] * widthFactor;
      context.beginPath();
      context.moveTo(fromX, fromY);
      context.lineTo(toX, toY);
      context.stroke();
    }
  });
  context.restore();
}

/**
 * `enter` flies in from the tail end and settles at rest, `exit` speeds up from rest and leaves, and
 * `loop` crosses the whole path at speed.
 */
type FlightKind = "enter" | "exit" | "loop";
type Flight = { kind: FlightKind; start: number; from: number; to: number; duration: number };

const FLIGHT_EASING: Record<FlightKind, (progress: number) => number> = {
  enter: (progress) => Math.sin((progress * Math.PI) / 2),
  exit: (progress) => 1 - Math.cos((progress * Math.PI) / 2),
  loop: (progress) => progress,
};

function streakLayerStyle(layer: (typeof STREAK_LAYERS)[number]) {
  return { filter: `blur(calc(${STREAK_BLUR * layer.blur} * var(--u)))`, opacity: layer.alpha };
}

/**
 * Streaks fly in head-first halfway through the eclipse intro, rest for a few seconds, then fly off one after
 * another. Afterwards each one reappears mid-sky on its own jittered timer and flies the whole path again.
 */
export function HeroStreaks() {
  const rootRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mountedRoot = rootRef.current;
    const halo = haloRef.current;
    const core = coreRef.current;
    const haloContext = halo?.getContext("2d");
    const coreContext = core?.getContext("2d");
    if (!mountedRoot || !halo || !core || !haloContext || !coreContext) return;
    const root = mountedRoot;
    const layers = [
      { canvas: halo, context: haloContext, width: STREAK_LAYERS[0].width },
      { canvas: core, context: coreContext, width: STREAK_LAYERS[1].width },
    ];
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const flights: (Flight | null)[] = STREAK_PATHS.map(() => null);
    const nextFlight: { at: number; kind: FlightKind }[] = STREAK_PATHS.map(() => ({ at: Infinity, kind: "loop" }));
    const flightCounts = STREAK_PATHS.map(() => 0);
    const resting = motionPreference.matches;
    let launched = false;
    let frame = 0;
    let intersecting = true;

    liveStreaks.heads = STREAK_PATHS.map((path) => (resting ? path.length : 0));
    liveStreaks.alphas = STREAK_PATHS.map(() => (resting ? 1 : 0));

    function paint() {
      for (const { canvas, context, width } of layers) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        strokeStreaks(context, canvas.width / 1512, width);
      }
      liveStreaks.version += 1;
    }

    function resize() {
      const width = Math.max(1, Math.round(root.clientWidth * STREAK_RESOLUTION));
      if (width === halo?.width) return;
      const height = Math.max(1, Math.round((width * 1273) / 1512));
      for (const { canvas } of layers) {
        canvas.width = width;
        canvas.height = height;
      }
      paint();
    }

    function fly(index: number, kind: FlightKind, start: number) {
      const path = STREAK_PATHS[index];
      const from = kind === "exit" ? path.length : 0;
      const to = kind === "enter" ? path.length : path.end;
      const flight = { kind, start, from, to, duration: ((to - from) / STREAK_SPEED) * 1000 };
      flights[index] = flight;
      flightCounts[index] += 1;
      return flight;
    }

    function scheduleLoop(index: number, now: number) {
      const jitter = 1 + (seed(index * 31.7 + flightCounts[index] * 5.3) * 2 - 1) * STREAK_JITTER;
      nextFlight[index] = { at: now + STREAK_PERIODS[index % STREAK_PERIODS.length] * jitter * 1000, kind: "loop" };
    }

    /** Enters every streak in turn, then lines up their exits once the last one has arrived and rested. */
    function launch(now: number) {
      launched = true;
      const arrivals = STREAK_PATHS.map((_, index) => {
        const flight = fly(index, "enter", now + index * STREAK_STAGGER * 1000);
        return flight.start + flight.duration;
      });
      const leaveAt = Math.max(...arrivals) + STREAK_HOLD * 1000;
      STREAK_PATHS.forEach((_, index) => {
        nextFlight[index] = { at: leaveAt + index * STREAK_STAGGER * 1000, kind: "exit" };
      });
    }

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      if (resting) return;
      if (!launched) {
        const loadState = root.closest("[data-load-state]")?.getAttribute("data-load-state") ?? "complete";
        if (loadState === "pending") return;
        if (loadState === "running") {
          // The intro waits paused for fonts and artwork, so follow its own clock rather than wall time.
          const intro = document.querySelector(`[data-node-id="${ECLIPSE_SOURCE_IDS[0]}"]`)?.getAnimations()[0];
          if (intro && Number(intro.currentTime ?? 0) < HERO_DURATION * STREAK_ENTER_AT) return;
        }
        launch(now);
      }

      let changed = false;
      STREAK_PATHS.forEach((_, index) => {
        if (!flights[index] && now >= nextFlight[index].at) fly(index, nextFlight[index].kind, now);
        const flight = flights[index];
        if (!flight) return;
        const progress = (now - flight.start) / flight.duration;
        if (progress < 0) return;
        changed = true;
        if (progress >= 1) {
          flights[index] = null;
          liveStreaks.heads[index] = flight.to;
          if (flight.kind === "enter") return;
          liveStreaks.alphas[index] = 0;
          scheduleLoop(index, now);
          return;
        }
        liveStreaks.heads[index] = flight.from + (flight.to - flight.from) * FLIGHT_EASING[flight.kind](progress);
        liveStreaks.alphas[index] = flight.kind === "exit" ? 1 : Math.min(1, progress / STREAK_FADE_IN);
      });
      if (changed) paint();
    }

    function updateActivity() {
      cancelAnimationFrame(frame);
      frame = intersecting ? requestAnimationFrame(tick) : 0;
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      updateActivity();
    });
    intersectionObserver.observe(root);
    resize();
    updateActivity();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.streaks} aria-hidden="true">
      <canvas ref={haloRef} className={styles.streakLayer} style={streakLayerStyle(STREAK_LAYERS[0])} />
      <canvas ref={coreRef} className={styles.streakLayer} style={streakLayerStyle(STREAK_LAYERS[1])} />
    </div>
  );
}

export default function HeroAscii() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mountedOverlay = overlayRef.current;
    const mountedCanvas = canvasRef.current;
    if (!mountedOverlay || !mountedCanvas) return;
    const drawingContext = mountedCanvas.getContext("2d", { alpha: true });
    if (!drawingContext) return;
    const sample = document.createElement("canvas");
    const samplingContext = sample.getContext("2d", { willReadFrequently: true });
    if (!samplingContext) return;
    // Helper canvases stay in software like `sample`, so compositing them never reads back from the GPU.
    const base = document.createElement("canvas");
    const mask = document.createElement("canvas");
    const scratch = document.createElement("canvas");
    const eclipseContext = base.getContext("2d", { willReadFrequently: true });
    const starContext = mask.getContext("2d", { willReadFrequently: true });
    const streakingContext = scratch.getContext("2d", { willReadFrequently: true });
    if (!eclipseContext || !starContext || !streakingContext) return;
    const baseContext = eclipseContext;
    const maskContext = starContext;
    const scratchContext = streakingContext;

    const overlay = mountedOverlay;
    const canvas = mountedCanvas;
    const context = drawingContext;
    const sampleContext = samplingContext;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    let disposed = false;
    let intersecting = true;
    let frame = 0;
    let cells: Cell[] = [];
    let overlayWidth = 0;
    let overlayHeight = 0;
    let lastSample = 0;
    let lastStreakVersion = -1;
    let lastDraw = 0;
    let lastGridKey = "";
    let starMaskField: Uint8ClampedArray | null = null;
    const trail: TrailPoint[] = [];
    let lastSampleX = Number.NaN;
    let lastSampleY = Number.NaN;
    let asciiVisible = false;

    const revealAscii = () => {
      if (asciiVisible || disposed || motionPreference.matches) return;
      asciiVisible = true;
      overlay.setAttribute("data-visible", "");
    };

    /** Paints an ellipse layer at its untransformed layout box, then applies its live translate/rotate/scale. */
    function drawLayer(target: CanvasRenderingContext2D, nodeId: string, scale: number, silhouette = false) {
      const node = document.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
      const image = node?.querySelector("img");
      const parent = image?.parentElement;
      if (!node || !image || !parent || image.naturalWidth === 0) return;
      const paintBounds = parent === node
        ? { offsetLeft: 0, offsetTop: 0, offsetWidth: node.offsetWidth, offsetHeight: node.offsetHeight }
        : parent;
      const style = getComputedStyle(node);
      const [translateX = 0, translateY = 0] = lengths(style.translate);
      const [rotate = 0] = lengths(style.rotate);
      const [scaleX = 1, scaleY = scaleX] = lengths(style.scale);
      const blur = /blur\(([\d.]+)px\)/.exec(style.filter)?.[1];
      const centerX = node.offsetLeft + node.offsetWidth / 2;
      const centerY = node.offsetTop + node.offsetHeight / 2;

      target.save();
      target.scale(scale, scale);
      target.translate(centerX + translateX, centerY + translateY);
      target.rotate((rotate * Math.PI) / 180);
      target.scale(scaleX, scaleY);
      target.translate(-node.offsetWidth / 2, -node.offsetHeight / 2);
      if (silhouette) {
        target.filter = "brightness(0)";
        target.globalAlpha = parseFloat(style.opacity) || 0;
      } else if (blur) {
        target.filter = `blur(${parseFloat(blur) * scale}px)`;
      }
      target.drawImage(
        image,
        paintBounds.offsetLeft,
        paintBounds.offsetTop,
        paintBounds.offsetWidth,
        paintBounds.offsetHeight,
      );
      target.restore();
    }

    /** Mirrors HeroStreaks' live pose: each layer stroked sharp, then blurred once and blended with `screen`. */
    function drawStreaks(width: number, height: number) {
      const unit = width / 1512;
      sampleContext.save();
      sampleContext.globalCompositeOperation = "screen";
      STREAK_LAYERS.forEach((layer) => {
        scratchContext.setTransform(1, 0, 0, 1, 0, 0);
        scratchContext.clearRect(0, 0, width, height);
        strokeStreaks(scratchContext, unit, layer.width);
        sampleContext.filter = `blur(${STREAK_BLUR * layer.blur * unit}px)`;
        sampleContext.globalAlpha = layer.alpha;
        sampleContext.drawImage(scratch, 0, 0);
      });
      sampleContext.restore();
    }

    /**
     * Caches the eclipse and star mask (re-rendered only while the intro moves), composites the live streaks
     * between them, and stores each cell's colour and strength.
     */
    function sampleField(now: number, force: boolean) {
      const loadState = overlay.closest("[data-load-state]")?.getAttribute("data-load-state");
      const moving = loadState === "running" || loadState === "pending";
      const width = Math.max(1, Math.round(overlayWidth * SAMPLE_SCALE));
      const height = Math.max(1, Math.round(overlayHeight * SAMPLE_SCALE));
      const resized = sample.width !== width || sample.height !== height;
      const refreshBase = force || resized || (moving && now - lastSample >= 80);
      if (!refreshBase && liveStreaks.version === lastStreakVersion) return;
      lastStreakVersion = liveStreaks.version;

      if (resized) {
        for (const target of [sample, base, mask, scratch]) {
          target.width = width;
          target.height = height;
        }
      }
      const scale = width / Math.max(1, overlayWidth);
      if (refreshBase) {
        lastSample = now;
        baseContext.setTransform(1, 0, 0, 1, 0, 0);
        baseContext.fillStyle = "#0a0a0a";
        baseContext.fillRect(0, 0, width, height);
        ECLIPSE_SOURCE_IDS.forEach((nodeId) => drawLayer(baseContext, nodeId, scale));
        drawLayer(baseContext, ECLIPSE_STAR_ID, scale);
        maskContext.setTransform(1, 0, 0, 1, 0, 0);
        maskContext.clearRect(0, 0, width, height);
        drawLayer(maskContext, ECLIPSE_STAR_ID, scale);
        starMaskField = maskContext.getImageData(0, 0, width, height).data;
      }

      sampleContext.setTransform(1, 0, 0, 1, 0, 0);
      sampleContext.filter = "none";
      sampleContext.globalAlpha = 1;
      sampleContext.globalCompositeOperation = "source-over";
      sampleContext.drawImage(base, 0, 0);
      drawStreaks(width, height);

      const field = sampleContext.getImageData(0, 0, width, height).data;
      const maskField = starMaskField;
      for (const cell of cells) {
        const sampleX = Math.min(width - 1, Math.max(0, Math.round(cell.x * scale)));
        const sampleY = Math.min(height - 1, Math.max(0, Math.round(cell.y * scale)));
        const index = (sampleY * width + sampleX) * 4;
        const r = field[index];
        const g = field[index + 1];
        const b = field[index + 2];
        const maskAlpha = maskField ? maskField[index + 3] / 255 : 0;
        if (maskAlpha > STAR_MASK_ALPHA) {
          cell.strength = 0;
          cell.packed = -1;
          continue;
        }
        const brightness = Math.max(r, g, b) / 255;
        cell.strength = Math.min(1, Math.max(0, (brightness - BRIGHTNESS_HIDE) / (BRIGHTNESS_FULL - BRIGHTNESS_HIDE)));
        cell.glyphs = glyphsFor(cell.strength);
        const packed = (r << 16) | (g << 8) | b;
        if (packed === cell.packed) continue;
        cell.packed = packed;
        cell.color = glyphColor(r, g, b, cell.strength);
      }
      if (!asciiVisible && cells.some((cell) => cell.strength > 0)) revealAscii();
    }

    function layout() {
      overlayWidth = overlay.offsetWidth;
      overlayHeight = overlay.offsetHeight;
      const fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, overlayWidth * (FONT_UNITS / 1512)));
      const font = `500 ${fontSize}px "Roboto Mono", monospace`;
      context.font = font;
      const cellWidth = context.measureText("M").width * 1.05;
      const cellHeight = fontSize * 1.12;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.ceil(overlayWidth * pixelRatio));
      canvas.height = Math.max(1, Math.ceil(overlayHeight * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.font = font;
      context.textAlign = "center";
      context.textBaseline = "middle";

      const columns = Math.max(1, Math.ceil(overlayWidth / cellWidth));
      const rows = Math.max(1, Math.ceil(overlayHeight / cellHeight));
      const gridKey = `${columns}x${rows}x${Math.round(fontSize * 10)}`;
      if (gridKey !== lastGridKey) {
        lastGridKey = gridKey;
        cells = [];
        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < columns; column += 1) {
            const identity = column * 19.13 + row * 47.91;
            if (seed(identity) < SKIP_RATE) continue;
            cells.push({
              x: (column + 0.5) * cellWidth,
              y: (row + 0.5) * cellHeight,
              phase: seed(identity + 3.7),
              hold: Math.floor(seed(identity + 8.2) * 1000),
              strength: 0,
              packed: -1,
              color: "",
              glyphs: LIGHT_GLYPHS,
            });
          }
        }
      }
      sampleField(performance.now(), true);
      lastDraw = 0;
    }

    function glyphFor(cell: Cell, time: number, cycling: boolean, cycleIndex: number) {
      const { glyphs } = cell;
      const hold = cell.hold + cycleIndex * 3;
      if (!cycling) return glyphs[wrap(hold, glyphs.length)];
      const flip = Math.floor(time * FLIPS_PER_SECOND + cell.phase * 11);
      return glyphs[wrap(hold + 1 + flip, glyphs.length)];
    }

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;
      sampleField(now, false);

      const cutoff = now - CURSOR_TRAIL_LIFE * 1000;
      while (trail.length > 0 && trail[0].t < cutoff) trail.shift();
      const trailBox = trailBounds(trail, CURSOR_RADIUS);

      context.clearRect(0, 0, overlayWidth, overlayHeight);
      const reduced = motionPreference.matches;
      const time = now / 1000;
      const cursorOn = !reduced;

      for (const cell of cells) {
        const trailFx = cursorOn ? trailInfluence(cell.x, cell.y, trail, now, trailBox) : null;
        const hasGlow = cell.strength > 0;
        if (!hasGlow && !trailFx) continue;

        let opacity = hasGlow ? cell.strength ** EDGE_OPACITY_CURVE : 0;
        let cycling = false;
        let cycleIndex = 0;
        if (hasGlow && !reduced) {
          const shifted = time + cell.phase * CYCLE;
          const local = shifted % CYCLE;
          cycleIndex = Math.floor(shifted / CYCLE);
          if (local < FADE_IN) {
            opacity *= local / FADE_IN;
            cycling = true;
          } else if (local >= FADE_IN + HOLD + FADE_OUT) {
            if (!trailFx) continue;
            opacity = 0;
          } else if (local >= FADE_IN + HOLD) {
            opacity *= 1 - (local - FADE_IN - HOLD) / FADE_OUT;
            cycling = true;
          }
        }

        if (trailFx) {
          const cursorOpacity = trailFx.boost * (hasGlow ? 1 : CURSOR_DARK_REVEAL);
          opacity = Math.min(1, opacity + cursorOpacity * (1 - opacity * 0.2));
        }

        if (opacity < 0.03) continue;
        const fill = trailFx
          ? hasGlow
            ? mixRgb(cell.color, trailFx.r, trailFx.g, trailFx.b, Math.min(1, trailFx.boost * 0.95))
            : `rgb(${trailFx.r} ${trailFx.g} ${trailFx.b})`
          : cell.color;

        context.globalAlpha = opacity;
        context.fillStyle = fill;
        context.fillText(glyphFor(cell, time, cycling, cycleIndex), cell.x, cell.y);
      }
      context.globalAlpha = 1;
    }

    function addTrailPoint(clientX: number, clientY: number, now: number) {
      const rect = overlay.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      if (Number.isFinite(lastSampleX) && Math.hypot(x - lastSampleX, y - lastSampleY) < CURSOR_SAMPLE_SPACING) return;
      lastSampleX = x;
      lastSampleY = y;
      trail.push({ x, y, t: now });
      while (trail.length > CURSOR_MAX_POINTS) trail.shift();
    }

    function onPointerMove(event: PointerEvent) {
      if (disposed || !intersecting) return;
      addTrailPoint(event.clientX, event.clientY, performance.now());
    }

    function start() {
      if (!frame && !disposed && intersecting && !document.hidden) {
        frame = requestAnimationFrame(tick);
      }
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function updateActivity() {
      if (!intersecting || document.hidden) stop();
      else start();
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      updateActivity();
    });
    intersectionObserver.observe(overlay);
    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(overlay);
    document.addEventListener("visibilitychange", updateActivity);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    layout();
    if (motionPreference.matches) overlay.setAttribute("data-visible", "");
    document.fonts.ready.then(() => {
      if (!disposed) layout();
    });
    // The halo and ring images may finish decoding after the first sample.
    ECLIPSE_SOURCE_IDS.forEach((nodeId) => {
      document.querySelector<HTMLImageElement>(`[data-node-id="${nodeId}"] img`)?.decode()
        .then(() => {
          if (!disposed) {
            sampleField(performance.now(), true);
            if (cells.some((cell) => cell.strength > 0)) revealAscii();
          }
        })
        .catch(() => undefined);
    });
    start();

    return () => {
      disposed = true;
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", updateActivity);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div className={styles.overlay} ref={overlayRef} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
