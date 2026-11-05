"use client";

import { useEffect, useRef } from "react";
import {
  sampleShootingStarTrail,
  shootingStarCrackles,
  type TrailCrackle,
} from "@/lib/shooting-star-trail-field";
import { SHOOTING_STARS, type ShootingStarId } from "./shooting-stars";
import {
  buildShootingStarPath,
  departureOffsetX,
  flightPoint,
  flightTangent,
  lastYearUnit,
  trailHalfWidth,
  TRAIL_HEAD_HALF,
  type FlightPath,
} from "./flight-path";
import styles from "./ShootingStarTrailAscii.module.css";

const EFFECT_FRAME_MS = 1000 / 24;
const FONT_MIN = 13;
const FONT_MAX = 18;
const ALONG_COLS = 58;

type ShootingStarTrailAsciiProps = {
  color: string;
  starId: ShootingStarId;
};

type Cell = { x: number; y: number; along: number; cross: number; column: number; row: number };

type Metrics = {
  width: number;
  height: number;
  characterWidth: number;
  lineHeight: number;
  baseline: number;
  cells: Cell[];
  path: FlightPath;
  originX: number;
  originY: number;
};

function mixColor(color: string, amount: number) {
  const matches = color.match(/[a-f\d]{2}/gi);
  if (!matches) return color;
  const channels = matches.map((channel) => parseInt(channel, 16));
  return `rgb(${channels.map((channel) => Math.round(channel + (255 - channel) * amount)).join(" ")})`;
}

function fireFill(color: string, intensity: number) {
  const hot = Math.min(1, Math.max(0, (intensity - 0.38) / 0.62));
  return mixColor(color, Math.min(0.62, 0.28 * intensity + hot * 0.62));
}

function readHeadAlong(group: HTMLElement | null) {
  if (!group) return 0;
  if (group.dataset.starState === "complete") return 1;
  if (group.dataset.starState !== "running") return 0;
  const parsed = parseFloat(group.dataset.starProgress ?? "0");
  return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0;
}

function curvePoint(
  path: FlightPath,
  along: number,
  cross: number,
  originX: number,
  originY: number,
  half: number,
) {
  const point = flightPoint(path, along);
  const tangent = flightTangent(path, along);
  return {
    x: originX + point.x - tangent.y * cross * half,
    y: originY + point.y + tangent.x * cross * half,
  };
}

export default function ShootingStarTrailAscii({ color, starId }: ShootingStarTrailAsciiProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mountedRoot = rootRef.current;
    const mountedCanvas = canvasRef.current;
    const mountedBloom = bloomRef.current;
    if (!mountedRoot || !mountedCanvas || !mountedBloom) return;

    const drawingContext = mountedCanvas.getContext("2d");
    const bloomDrawingContext = mountedBloom.getContext("2d");
    if (!drawingContext || !bloomDrawingContext) return;

    const root = mountedRoot;
    const canvas = mountedCanvas;
    const bloom = mountedBloom;
    const context = drawingContext;
    const bloomContext = bloomDrawingContext;
    const spec = SHOOTING_STARS.find((star) => star.id === starId);
    if (!spec) return;
    const star = spec;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const white = mixColor(color, 0.8);
    const highlight = mixColor(color, 0.45);
    const identifierSeed = Array.from(color).reduce((sum, character) => sum + character.charCodeAt(0), 0);

    let disposed = false;
    let intersecting = false;
    let frame = 0;
    let lastDraw = 0;
    let metrics: Metrics | null = null;

    function measure() {
      const group = root.parentElement;
      const scene = group?.closest<HTMLElement>("main") ?? document.documentElement;
      const marker = document.querySelector<HTMLElement>(`[data-star-trigger="${starId}"]`);
      if (!group || !marker) return;

      const unit = lastYearUnit(scene.clientWidth);
      const fromX = departureOffsetX(marker, star.side, unit);
      const path = buildShootingStarPath(
        fromX,
        star.dip,
        "arc" in star && star.arc === "overshoot" ? "overshoot" : "default",
      );
      const originX = group.clientWidth / 2;
      const originY = group.clientHeight / 2;
      const fontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, group.clientWidth * (16 / 520)));
      context.font = `400 ${fontSize}px "Roboto Mono", monospace`;
      const measurement = context.measureText("M");
      const characterWidth = Math.max(fontSize * 0.62, measurement.width);
      const lineHeight = fontSize * 1.05;
      const ascent = measurement.fontBoundingBoxAscent ?? fontSize * 0.8;
      const descent = measurement.fontBoundingBoxDescent ?? fontSize * 0.2;

      const cells: Cell[] = [];
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let column = 0; column < ALONG_COLS; column += 1) {
        const along = (column + 0.5) / ALONG_COLS;
        const half = trailHalfWidth(along);
        const crossRows = Math.max(7, Math.round((half * 2) / (lineHeight * 0.84)));
        for (let row = 0; row < crossRows; row += 1) {
          const cross = -1 + ((row + 0.5) / crossRows) * 2;
          const point = curvePoint(path, along, cross, originX, originY, half);
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
          cells.push({
            x: point.x,
            y: point.y,
            along,
            cross,
            column,
            row,
          });
        }
      }

      const pad = TRAIL_HEAD_HALF + fontSize;
      const left = minX - pad;
      const top = minY - pad;
      const width = Math.max(1, maxX - minX + pad * 2);
      const height = Math.max(1, maxY - minY + pad * 2);
      for (const cell of cells) {
        cell.x -= left;
        cell.y -= top;
      }

      root.style.left = `${left}px`;
      root.style.top = `${top}px`;
      root.style.width = `${width}px`;
      root.style.height = `${height}px`;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.ceil(width * pixelRatio));
      canvas.height = Math.max(1, Math.ceil(height * pixelRatio));
      bloom.width = Math.max(1, Math.ceil(width));
      bloom.height = Math.max(1, Math.ceil(height));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.font = `400 ${fontSize}px "Roboto Mono", monospace`;
      context.textAlign = "center";
      context.textBaseline = "alphabetic";
      metrics = {
        width,
        height,
        characterWidth,
        lineHeight,
        baseline: (lineHeight - ascent - descent) / 2 + ascent,
        cells,
        path,
        originX: originX - left,
        originY: originY - top,
      };
      lastDraw = 0;
      start();
    }

    function glyph(character: string, x: number, y: number, fill: string, opacity: number) {
      if (!metrics) return;
      context.fillStyle = fill;
      context.globalAlpha = opacity;
      context.fillText(character, x, y + metrics.baseline - metrics.lineHeight * 0.5);
    }

    function drawCrackle(crackle: TrailCrackle, time: number, current: Metrics) {
      const halfAt = trailHalfWidth;
      const head = curvePoint(
        current.path,
        crackle.along,
        crackle.cross,
        current.originX,
        current.originY,
        halfAt(crackle.along),
      );
      const tail = curvePoint(
        current.path,
        crackle.tailAlong,
        crackle.tailCross,
        current.originX,
        current.originY,
        halfAt(crackle.tailAlong),
      );
      if (crackle.phase < 1) {
        const character = ["+", "x", "*"][Math.floor(time * 15 + crackle.along * 40) % 3];
        glyph(character, head.x, head.y, crackle.phase > 0.82 ? white : highlight, Math.min(1, crackle.phase * 7) * 0.95);
        glyph(".", tail.x, tail.y, color, Math.min(0.5, crackle.phase));
        return;
      }
      const fade = (1 - crackle.burst) ** 1.5;
      glyph(crackle.burst < 0.3 ? "*" : "+", head.x, head.y, white, fade);
      glyph("+", head.x - current.characterWidth, head.y - current.lineHeight * 0.3, highlight, fade * 0.9);
      glyph("x", head.x + current.characterWidth, head.y + current.lineHeight * 0.2, color, fade * 0.85);
    }

    function draw(time: number) {
      if (!metrics) return;
      const current = metrics;
      context.clearRect(0, 0, current.width, current.height);
      const group = root.parentElement;
      const reduced = motionPreference.matches;
      const idle = group?.dataset.starState === "complete" && !reduced;
      const headAlong = reduced ? 1 : readHeadAlong(group);
      if (headAlong <= 0.001 && group?.dataset.starState !== "complete") {
        bloomContext.clearRect(0, 0, bloom.width, bloom.height);
        return;
      }

      for (const cell of current.cells) {
        const sample = sampleShootingStarTrail(
          cell.along,
          cell.cross,
          cell.column,
          cell.row,
          reduced ? 0 : time,
          headAlong,
          idle,
        );
        if (sample.character === " ") continue;
        glyph(sample.character, cell.x, cell.y, fireFill(color, sample.intensity), sample.opacity);
      }

      if (idle) {
        for (const crackle of shootingStarCrackles(time, identifierSeed)) {
          drawCrackle(crackle, time, current);
        }
      }

      context.globalAlpha = 1;
      bloomContext.clearRect(0, 0, bloom.width, bloom.height);
      bloomContext.drawImage(canvas, 0, 0, bloom.width, bloom.height);
    }

    function tick(now: number) {
      frame = 0;
      if (disposed || !intersecting || document.hidden || !metrics) {
        stop();
        return;
      }
      if (now - lastDraw >= EFFECT_FRAME_MS) {
        draw(now / 1000 + identifierSeed * 0.01);
        lastDraw = now;
      }
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (!frame && !disposed && metrics && intersecting && !document.hidden) {
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
    intersectionObserver.observe(root);
    const resizeObserver = new ResizeObserver(measure);
    const group = root.parentElement;
    if (group) resizeObserver.observe(group);
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", updateActivity);
    measure();
    document.fonts.ready.then(() => {
      if (!disposed) measure();
    });

    return () => {
      disposed = true;
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", updateActivity);
    };
  }, [color, starId]);

  return (
    <div ref={rootRef} className={styles.trailAscii} aria-hidden="true">
      <canvas ref={bloomRef} className={styles.bloom} />
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
