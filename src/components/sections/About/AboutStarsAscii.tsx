"use client";

import { useEffect, useRef } from "react";
import {
  CYCLE,
  FADE_IN,
  FADE_OUT,
  FONT_MAX,
  FONT_MIN,
  FONT_UNITS,
  FRAME_MS,
  HOLD,
  SAMPLE_SCALE,
  SKIP_RATE,
  type GlowCell,
  drawArtLayer,
  glyphColor,
  glyphFor,
  glyphsFor,
  lightEmission,
  seed,
  LIGHT_GLYPHS,
} from "@/lib/ascii-glow";
import styles from "./AboutStarsAscii.module.css";

/** Clip ASCII before the baked gradient tail (hero uses lower thresholds). */
const STAR_BRIGHTNESS_HIDE = 0.22;
const STAR_BRIGHTNESS_FULL = 0.62;
const STAR_STRENGTH_GAMMA = 2.1;
const STAR_EDGE_OPACITY_CURVE = 1.65;

/** Orange-red star flares between the mountain PNGs, back to front. */
export type MountainStarNodeId = "116:102" | "116:87" | "116:96";

type AboutStarsAsciiProps = {
  nodeId: MountainStarNodeId;
  className: string;
};

export default function AboutStarsAscii({ nodeId, className }: AboutStarsAsciiProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    const mountedBloom = bloomRef.current;
    if (!overlay || !canvas || !mountedBloom) return;
    const overlayEl = overlay;
    const canvasEl = canvas;
    const context = canvasEl.getContext("2d", { alpha: true });
    const bloomDrawingContext = mountedBloom.getContext("2d", { alpha: true });
    if (!context || !bloomDrawingContext) return;
    const bloom = mountedBloom;
    const bloomContext = bloomDrawingContext;

    const sample = document.createElement("canvas");
    const samplingContext = sample.getContext("2d", { willReadFrequently: true });
    if (!samplingContext) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let intersecting = false;
    let frame = 0;
    let cells: GlowCell[] = [];
    let overlayWidth = 0;
    let overlayHeight = 0;
    let lastSample = 0;
    let lastDraw = 0;
    let lastGridKey = "";
    let asciiVisible = false;

    const sampleContext = samplingContext;
    const drawContext = context;

    const revealAscii = () => {
      if (asciiVisible || disposed || motionPreference.matches) return;
      asciiVisible = true;
      overlayEl.setAttribute("data-visible", "");
    };

    function sampleField(force: boolean) {
      const now = performance.now();
      const width = Math.max(1, Math.round(overlayWidth * SAMPLE_SCALE));
      const height = Math.max(1, Math.round(overlayHeight * SAMPLE_SCALE));
      const resized = sample.width !== width || sample.height !== height;
      if (!force && !resized && now - lastSample < 500) return;
      lastSample = now;

      if (resized) {
        sample.width = width;
        sample.height = height;
      }

      sampleContext.setTransform(1, 0, 0, 1, 0, 0);
      sampleContext.fillStyle = "#0a0a0a";
      sampleContext.fillRect(0, 0, width, height);
      drawArtLayer(sampleContext, nodeId, width, overlayEl);

      const field = sampleContext.getImageData(0, 0, width, height).data;
      const scale = width / Math.max(1, overlayWidth);
      for (const cell of cells) {
        const sampleX = Math.min(width - 1, Math.max(0, Math.round(cell.x * scale)));
        const sampleY = Math.min(height - 1, Math.max(0, Math.round(cell.y * scale)));
        const index = (sampleY * width + sampleX) * 4;
        const r = field[index];
        const g = field[index + 1];
        const b = field[index + 2];
        const brightness = Math.max(r, g, b) / 255;
        const normalized = Math.max(
          0,
          (brightness - STAR_BRIGHTNESS_HIDE) / (STAR_BRIGHTNESS_FULL - STAR_BRIGHTNESS_HIDE),
        );
        cell.strength = Math.min(1, normalized ** STAR_STRENGTH_GAMMA);
        cell.glyphs = glyphsFor(cell.strength);
        const packed = (r << 16) | (g << 8) | b;
        if (packed === cell.packed) continue;
        cell.packed = packed;
        cell.emission = lightEmission(r, g, b);
        cell.color = glyphColor(r, g, b, cell.strength);
      }
      if (!asciiVisible && cells.some((cell) => cell.strength > 0)) revealAscii();
    }

    function layout() {
      overlayWidth = overlayEl.offsetWidth;
      overlayHeight = overlayEl.offsetHeight;
      const fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, overlayWidth * (FONT_UNITS / 1512)));
      const font = `400 ${fontSize}px "Roboto Mono", monospace`;
      drawContext.font = font;
      const cellWidth = drawContext.measureText("M").width * 1.05;
      const cellHeight = fontSize * 1.12;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvasEl.width = Math.max(1, Math.ceil(overlayWidth * pixelRatio));
      canvasEl.height = Math.max(1, Math.ceil(overlayHeight * pixelRatio));
      // Bloom needs CSS-pixel resolution only; the sharp pass retains full DPR.
      bloom.width = Math.max(1, Math.ceil(overlayWidth));
      bloom.height = Math.max(1, Math.ceil(overlayHeight));
      drawContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawContext.font = font;
      drawContext.textAlign = "center";
      drawContext.textBaseline = "middle";

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
              emission: 0,
              packed: -1,
              color: "",
              glyphs: LIGHT_GLYPHS,
            });
          }
        }
      }
      sampleField(true);
      lastDraw = 0;
    }

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;
      sampleField(false);

      drawContext.clearRect(0, 0, overlayWidth, overlayHeight);
      const reduced = motionPreference.matches;
      const time = now / 1000;

      for (const cell of cells) {
        if (cell.strength <= 0) continue;
        let opacity = cell.strength ** STAR_EDGE_OPACITY_CURVE * cell.emission;
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
        if (opacity < 0.045) continue;
        drawContext.globalAlpha = opacity;
        drawContext.fillStyle = cell.color;
        drawContext.fillText(glyphFor(cell, time, cycling, cycleIndex), cell.x, cell.y);
      }
      drawContext.globalAlpha = 1;
      bloomContext.clearRect(0, 0, bloom.width, bloom.height);
      bloomContext.drawImage(canvasEl, 0, 0, bloom.width, bloom.height);
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
    intersectionObserver.observe(overlayEl);
    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(overlayEl);
    document.addEventListener("visibilitychange", updateActivity);
    layout();
    if (motionPreference.matches) overlayEl.setAttribute("data-visible", "");
    document.fonts.ready.then(() => {
      if (!disposed) layout();
    });
    document.querySelector<HTMLImageElement>(`[data-node-id="${nodeId}"] img`)?.decode()
      .then(() => {
        if (!disposed) sampleField(true);
      })
      .catch(() => undefined);
    start();

    return () => {
      disposed = true;
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", updateActivity);
    };
  }, [nodeId]);

  return (
    <div ref={overlayRef} className={`${styles.overlay} ${className}`.trim()} aria-hidden="true">
      <canvas ref={bloomRef} className={styles.bloom} />
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
