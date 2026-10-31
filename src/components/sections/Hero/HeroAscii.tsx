"use client";

import { useEffect, useRef } from "react";
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
const SKIP_RATE = 0.05;
/** Every eclipse ellipse, in paint order. */
const ECLIPSE_SOURCE_IDS = ["111:95", "111:97", "111:98", "111:99"] as const;
/** The eclipse star is painted as a dark silhouette, so no glyphs appear over it. */
const ECLIPSE_STAR_ID = "111:100";
/** Stacking the silhouette makes the star's faint rays and glow opaque enough to clear glyphs too. */
const STAR_MASK_PASSES = 4;

type Point = readonly [number, number];
type ColorStop = readonly [offset: number, r: number, g: number, b: number];

/** Colour from head (0) to tail (1). Fading to black reads as transparent under `screen` blending. */
const ORANGE_RAMP: readonly ColorStop[] = [[0, 255, 140, 70], [0.3, 240, 96, 24], [0.65, 205, 64, 4], [0.92, 90, 26, 0], [1, 0, 0, 0]];
const PEACH_RAMP: readonly ColorStop[] = [[0, 255, 246, 232], [0.25, 255, 222, 208], [0.6, 236, 140, 96], [0.92, 110, 44, 16], [1, 0, 0, 0]];

/** Curved shooting-star glows on the 1512 grid, each a chain of quadratic curves from head to tail. */
const STREAKS = [
  { curves: [[[-20, 92], [520, 96], [680, 150]], [[680, 150], [920, 250], [1230, 620]]], width: 40, blur: 22, ramp: ORANGE_RAMP },
  { curves: [[[1540, 146], [1000, 150], [580, 270]]], width: 42, blur: 22, ramp: PEACH_RAMP },
  { curves: [[[-20, 280], [260, 262], [330, 305]], [[330, 305], [375, 345], [350, 565]]], width: 44, blur: 22, ramp: PEACH_RAMP },
] as const satisfies readonly { curves: readonly (readonly [Point, Point, Point])[]; width: number; blur: number; ramp: readonly ColorStop[] }[];
const STREAK_STEPS = 48;
/** The tail narrows to this fraction of the head's width. */
const STREAK_TAIL_WIDTH = 0.35;
/** A wide soft halo under a narrower, tighter core; widths and blurs are fractions of each streak's. */
const STREAK_LAYERS = [
  { width: 1, blur: 1, alpha: 0.7 },
  { width: 0.4, blur: 0.35, alpha: 0.95 },
] as const;
/** The streaks are soft, so they render below CSS resolution and get upscaled. */
const STREAK_RESOLUTION = 0.5;

type Cell = {
  x: number;
  y: number;
  phase: number;
  hold: number;
  strength: number;
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

/** Short segments along each streak, tapering and darkening toward the tail. */
const STREAK_SEGMENTS = STREAKS.map((streak) => {
  const curves = streak.curves;
  const spans = curves.map(([start, , end]) => Math.hypot(end[0] - start[0], end[1] - start[1]));
  const total = spans.reduce((sum, span) => sum + span, 0);
  const points = Array.from({ length: STREAK_STEPS + 1 }, (_, step) => {
    let distance = (step / STREAK_STEPS) * total;
    let index = 0;
    while (index < curves.length - 1 && distance > spans[index]) {
      distance -= spans[index];
      index += 1;
    }
    return quadratic(curves[index], Math.min(1, distance / spans[index]));
  });
  return points.slice(1).map((to, index) => {
    const progress = index / STREAK_STEPS;
    return {
      from: points[index],
      to,
      width: streak.width * (1 - (1 - STREAK_TAIL_WIDTH) * progress),
      color: rampColor(streak.ramp, progress),
    };
  });
});

/**
 * Paints every streak into `target`, whose canvas spans the 1512×1273 grid. Segments are stroked sharp on a
 * scratch canvas and blurred once per layer, since a canvas filter would otherwise run on every stroke.
 */
function paintStreaks(target: CanvasRenderingContext2D) {
  const { width, height } = target.canvas;
  const unit = width / 1512;
  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = height;
  const scratchContext = scratch.getContext("2d");
  if (!scratchContext) return;

  target.save();
  target.globalCompositeOperation = "screen";
  STREAKS.forEach((streak, index) => {
    STREAK_LAYERS.forEach((layer) => {
      scratchContext.setTransform(1, 0, 0, 1, 0, 0);
      scratchContext.clearRect(0, 0, width, height);
      scratchContext.setTransform(unit, 0, 0, unit, 0, 0);
      scratchContext.lineCap = "round";
      STREAK_SEGMENTS[index].forEach(({ from, to, width: segmentWidth, color }) => {
        scratchContext.strokeStyle = color;
        scratchContext.lineWidth = segmentWidth * layer.width;
        scratchContext.beginPath();
        scratchContext.moveTo(from[0], from[1]);
        scratchContext.lineTo(to[0], to[1]);
        scratchContext.stroke();
      });
      target.filter = `blur(${streak.blur * layer.blur * unit}px)`;
      target.globalAlpha = layer.alpha;
      target.drawImage(scratch, 0, 0);
    });
  });
  target.restore();
}

export function HeroStreaks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    function render() {
      if (!canvas || !context) return;
      const width = Math.max(1, Math.round(canvas.clientWidth * STREAK_RESOLUTION));
      if (width === canvas.width) return;
      canvas.width = width;
      canvas.height = Math.max(1, Math.round((width * 1273) / 1512));
      paintStreaks(context);
    }

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(canvas);
    render();
    return () => resizeObserver.disconnect();
  }, []);

  return <canvas ref={canvasRef} className={styles.streaks} aria-hidden="true" />;
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
    const streakLayer = document.createElement("canvas");
    streakLayer.width = 0;
    const streakContext = streakLayer.getContext("2d");

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
    let lastDraw = 0;
    let lastGridKey = "";

    /** Paints an ellipse layer at its untransformed layout box, then applies its live translate/rotate/scale. */
    function drawLayer(nodeId: string, scale: number, silhouette = false) {
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

      sampleContext.save();
      sampleContext.scale(scale, scale);
      sampleContext.translate(centerX + translateX, centerY + translateY);
      sampleContext.rotate((rotate * Math.PI) / 180);
      sampleContext.scale(scaleX, scaleY);
      sampleContext.translate(-node.offsetWidth / 2, -node.offsetHeight / 2);
      if (silhouette) {
        sampleContext.filter = "brightness(0)";
        sampleContext.globalAlpha = parseFloat(style.opacity) || 0;
      } else if (blur) {
        sampleContext.filter = `blur(${parseFloat(blur) * scale}px)`;
      }
      sampleContext.drawImage(
        image,
        paintBounds.offsetLeft,
        paintBounds.offsetTop,
        paintBounds.offsetWidth,
        paintBounds.offsetHeight,
      );
      sampleContext.restore();
    }

    /** Mirrors HeroStreaks, painted once per sample size and blended with `screen` over the eclipse. */
    function drawStreaks(width: number, height: number) {
      if (streakLayer.width !== width || streakLayer.height !== height) {
        streakLayer.width = width;
        streakLayer.height = height;
        if (streakContext) paintStreaks(streakContext);
      }
      sampleContext.save();
      sampleContext.globalCompositeOperation = "screen";
      sampleContext.drawImage(streakLayer, 0, 0);
      sampleContext.restore();
    }

    /** Re-renders the glow under the overlay and caches each cell's colour and strength. */
    function sampleField(now: number, force: boolean) {
      const loadState = overlay.closest("[data-load-state]")?.getAttribute("data-load-state");
      const moving = loadState === "running" || loadState === "pending";
      if (!force && (!moving || now - lastSample < 80)) return;
      lastSample = now;

      const width = Math.max(1, Math.round(overlayWidth * SAMPLE_SCALE));
      const height = Math.max(1, Math.round(overlayHeight * SAMPLE_SCALE));
      if (sample.width !== width || sample.height !== height) {
        sample.width = width;
        sample.height = height;
      }
      sampleContext.setTransform(1, 0, 0, 1, 0, 0);
      sampleContext.filter = "none";
      sampleContext.globalAlpha = 1;
      sampleContext.fillStyle = "#0a0a0a";
      sampleContext.fillRect(0, 0, width, height);
      const scale = width / Math.max(1, overlayWidth);
      ECLIPSE_SOURCE_IDS.forEach((nodeId) => drawLayer(nodeId, scale));
      drawStreaks(width, height);
      for (let pass = 0; pass < STAR_MASK_PASSES; pass += 1) drawLayer(ECLIPSE_STAR_ID, scale, true);

      const field = sampleContext.getImageData(0, 0, width, height).data;
      for (const cell of cells) {
        const sampleX = Math.min(width - 1, Math.max(0, Math.round(cell.x * scale)));
        const sampleY = Math.min(height - 1, Math.max(0, Math.round(cell.y * scale)));
        const index = (sampleY * width + sampleX) * 4;
        const r = field[index];
        const g = field[index + 1];
        const b = field[index + 2];
        const brightness = Math.max(r, g, b) / 255;
        cell.strength = Math.min(1, Math.max(0, (brightness - BRIGHTNESS_HIDE) / (BRIGHTNESS_FULL - BRIGHTNESS_HIDE)));
        cell.glyphs = glyphsFor(cell.strength);
        const lift = COLOR_LIFT * cell.strength;
        cell.color = `rgb(${Math.round(r + (255 - r) * lift)} ${Math.round(g + (255 - g) * lift)} ${Math.round(b + (255 - b) * lift)})`;
      }
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
      context.clearRect(0, 0, overlayWidth, overlayHeight);
      const reduced = motionPreference.matches;
      const time = now / 1000;

      for (const cell of cells) {
        if (cell.strength <= 0) continue;
        let opacity = cell.strength ** EDGE_OPACITY_CURVE;
        let cycling = false;
        let cycleIndex = 0;
        if (!reduced) {
          const shifted = time + cell.phase * CYCLE;
          const local = shifted % CYCLE;
          cycleIndex = Math.floor(shifted / CYCLE);
          if (local < FADE_IN) {
            opacity *= local / FADE_IN;
            cycling = true;
          } else if (local >= FADE_IN + HOLD + FADE_OUT) {
            continue;
          } else if (local >= FADE_IN + HOLD) {
            opacity *= 1 - (local - FADE_IN - HOLD) / FADE_OUT;
            cycling = true;
          }
        }
        if (opacity < 0.03) continue;
        context.globalAlpha = opacity;
        context.fillStyle = cell.color;
        context.fillText(glyphFor(cell, time, cycling, cycleIndex), cell.x, cell.y);
      }
      context.globalAlpha = 1;
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
    layout();
    document.fonts.ready.then(() => {
      if (!disposed) layout();
    });
    // The halo and ring images may finish decoding after the first sample.
    ECLIPSE_SOURCE_IDS.forEach((nodeId) => {
      document.querySelector<HTMLImageElement>(`[data-node-id="${nodeId}"] img`)?.decode()
        .then(() => {
          if (!disposed) sampleField(performance.now(), true);
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
    };
  }, []);

  return (
    <div className={styles.overlay} ref={overlayRef} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
