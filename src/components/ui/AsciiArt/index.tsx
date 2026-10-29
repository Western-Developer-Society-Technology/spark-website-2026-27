"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ASCII_ART, type AsciiArtMetadata, type AsciiArtMode } from "../../../lib/ascii-art";
import styles from "./AsciiArt.module.css";

interface AsciiCell {
  character: string;
  column: number;
  row: number;
}

interface AsciiBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface PreparedAsciiArt extends AsciiArtMetadata {
  nodeId: string;
  cells: AsciiCell[];
  bounds: AsciiBounds;
  fireText: string | null;
}

interface Point {
  x: number;
  y: number;
}

interface AsciiMetrics {
  fontSize: number;
  lineHeight: number;
  characterWidth: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
  baseline: number;
}

interface AsciiArtStyle extends CSSProperties {
  "--ascii-left": string;
  "--ascii-top": string;
  "--ascii-font-size": string;
  "--ascii-line-height": string;
  "--ascii-color": string;
  "--ascii-weight": number;
}

interface AsciiArtProps {
  nodeId: string;
  mode?: AsciiArtMode;
}

const TAU = Math.PI * 2;
const FIRE_CHARACTERS = ".,:;*x%#@";

// Animation rates are implementation choices; Figma specifies the direction and
// interaction of these effects, but does not specify their duration or easing.
const EFFECT_FRAME_MS = 1000 / 24;
const CURSOR_FADE_MS = 260;

function fraction(value: number) {
  return value - Math.floor(value);
}

function seed(value: number) {
  return fraction(Math.sin(value * 127.1 + 311.7) * 43758.5453);
}

function occupiedCells(text: string): AsciiCell[] {
  return text.split("\n").flatMap((line, row) =>
    Array.from(line).flatMap((character, column) =>
      character.trim() && character !== "\u200b"
        ? [{ character, column, row }]
        : [],
    ),
  );
}

function cellBounds(cells: AsciiCell[]): AsciiBounds {
  return {
    left: Math.min(...cells.map((cell) => cell.column)),
    right: Math.max(...cells.map((cell) => cell.column)),
    top: Math.min(...cells.map((cell) => cell.row)),
    bottom: Math.max(...cells.map((cell) => cell.row)),
  };
}

function mixColor(color: string, amount: number) {
  const matches = color.match(/[a-f\d]{2}/gi);
  if (!matches) return color;
  const channels = matches.map((channel) => parseInt(channel, 16));
  return `rgb(${channels.map((channel) => Math.round(channel + (255 - channel) * amount)).join(" ")})`;
}

// Keep the replacement fire in the supplied sparkler's occupied grid. Its
// original line count, column count, typography, offsets and color are retained.
function fireCharacter(column: number, row: number, bounds: AsciiBounds, time: number) {
  const height = bounds.bottom - bounds.top;
  const elevation = (bounds.bottom - row) / height;
  if (elevation < 0 || elevation > 1) return " ";

  const center = (bounds.left + bounds.right) / 2;
  const halfWidth = (bounds.right - bounds.left) / 2;
  const x = (column - center) / halfWidth;
  const bend =
    Math.sin(elevation * 7 - time * 2.2) * elevation * 0.16 +
    Math.sin(elevation * 13 - time * 3.1) * elevation * 0.09;
  const envelope = Math.pow(1 - elevation, 0.8) * 0.88 + 0.025;
  const tongues =
    Math.sin(x * 13 + elevation * 8 - time * 4.2) * 0.12 +
    Math.sin(x * 23 - elevation * 11 + time * 3.5) * 0.07;
  const intensity = (envelope - Math.abs(x - bend) + tongues) / 0.45;
  if (intensity <= 0.02) return " ";

  const flicker = seed(column * 17 + row * 31 + Math.floor(time * 14));
  const index = Math.min(
    FIRE_CHARACTERS.length - 1,
    Math.floor(Math.max(0, intensity) * 5 + flicker * 2),
  );
  return FIRE_CHARACTERS[index];
}

function staticFire(art: AsciiArtMetadata, bounds: AsciiBounds) {
  return Array.from({ length: art.rows }, (_, row) =>
    Array.from({ length: art.columns }, (_, column) =>
      fireCharacter(column, row, bounds, 0),
    ).join(""),
  ).join("\n");
}

function localPoint(point: Point, markers: [HTMLElement, HTMLElement, HTMLElement]): Point | null {
  const origin = markers[0].getBoundingClientRect();
  const horizontal = markers[1].getBoundingClientRect();
  const vertical = markers[2].getBoundingClientRect();
  const ax = (horizontal.x - origin.x) / 100;
  const ay = (horizontal.y - origin.y) / 100;
  const bx = (vertical.x - origin.x) / 100;
  const by = (vertical.y - origin.y) / 100;
  const determinant = ax * by - ay * bx;
  if (Math.abs(determinant) < 0.0001) return null;
  const x = point.x - origin.x;
  const y = point.y - origin.y;
  return {
    x: (x * by - y * bx) / determinant,
    y: (y * ax - x * ay) / determinant,
  };
}

function useAsciiMotion(artwork: PreparedAsciiArt | undefined, mode: AsciiArtMode | undefined) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLPreElement>(null);
  const originRef = useRef<HTMLElement>(null);
  const axisXRef = useRef<HTMLElement>(null);
  const axisYRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!artwork || mode === "static") return;

    const mountedElement = elementRef.current;
    const mountedCanvas = canvasRef.current;
    const mountedSource = sourceRef.current;
    const origin = originRef.current;
    const axisX = axisXRef.current;
    const axisY = axisYRef.current;
    if (!mountedElement || !mountedCanvas || !mountedSource || !origin || !axisX || !axisY) return;
    const art = artwork;
    const element = mountedElement;
    const canvas = mountedCanvas;
    const source = mountedSource;
    const markers: [HTMLElement, HTMLElement, HTMLElement] = [origin, axisX, axisY];
    const { cells, bounds } = art;
    const drawingContext = canvas.getContext("2d");
    if (!drawingContext) return;
    const context = drawingContext;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let intersecting = false;
    let frame = 0;
    let lastDraw = 0;
    let lastFrame = 0;
    let metrics: AsciiMetrics | null = null;
    let pointer: Point | null = null;
    let cursorStrength = 0;
    let needsPointerRead = false;
    let localPointer: Point | null = null;

    const lines = art.text.split("\n");
    const white = mixColor(art.color, 0.8);
    const highlight = mixColor(art.color, 0.45);
    const identifierSeed = Array.from(art.nodeId).reduce(
      (sum, character) => sum + character.charCodeAt(0),
      art.fontSize * 100,
    );

    function clear() {
      if (metrics) context.clearRect(0, 0, metrics.canvasWidth, metrics.canvasHeight);
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      element.dataset.running = "false";
      clear();
    }

    function measure() {
      const computed = getComputedStyle(source);
      const fontSize = parseFloat(computed.fontSize);
      const lineHeight = parseFloat(computed.lineHeight);
      context.font = `${computed.fontWeight} ${fontSize}px "Roboto Mono"`;
      const measurement = context.measureText("M");
      const characterWidth = measurement.width;
      const ascent = measurement.fontBoundingBoxAscent ?? fontSize * 0.8;
      const descent = measurement.fontBoundingBoxDescent ?? fontSize * 0.2;
      const width = characterWidth * art.columns;
      const height = lineHeight * art.rows;
      const padding = mode === "trail" ? fontSize * 5 : 0;
      const canvasWidth = mode === "cursor" ? characterWidth * 31 : width + padding * 2;
      const canvasHeight =
        mode === "cursor"
          ? lineHeight * 21
          : mode === "trail"
            ? (bounds.bottom + 1) * lineHeight + padding * 2
            : height;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.ceil(canvasWidth * pixelRatio));
      canvas.height = Math.max(1, Math.ceil(canvasHeight * pixelRatio));
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      canvas.style.left = `${-padding}px`;
      canvas.style.top = `${-padding}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.font = `${computed.fontWeight} ${fontSize}px "Roboto Mono"`;
      context.textBaseline = "alphabetic";
      metrics = {
        fontSize,
        lineHeight,
        characterWidth,
        width,
        height,
        canvasWidth,
        canvasHeight,
        padding,
        baseline: (lineHeight - ascent - descent) / 2 + ascent,
      };
      needsPointerRead = true;
      lastDraw = 0;
      start();
    }

    function glyph(character: string, column: number, row: number, color: string, opacity = 1) {
      if (!metrics) return;
      context.fillStyle = color;
      context.globalAlpha = opacity;
      context.fillText(
        character,
        column * metrics.characterWidth + metrics.padding,
        row * metrics.lineHeight + metrics.baseline + metrics.padding,
      );
    }

    function drawCursor(elapsed: number) {
      if (!metrics) return false;
      if (needsPointerRead) {
        localPointer = pointer ? localPoint(pointer, markers) : null;
        needsPointerRead = false;
      }
      const point = localPointer;
      const nearby =
        point &&
        point.x >= 0 &&
        point.y >= 0 &&
        point.x <= metrics.width &&
        point.y <= metrics.height;
      const target = nearby ? 1 : 0;
      const blend = 1 - Math.exp((-elapsed * 3) / CURSOR_FADE_MS);
      cursorStrength += (target - cursorStrength) * blend;
      clear();
      if (!point || cursorStrength < 0.005) return false;

      const centerColumn = Math.floor(point.x / metrics.characterWidth);
      const centerRow = Math.floor(point.y / metrics.lineHeight);
      const firstColumn = centerColumn - 15;
      const firstRow = centerRow - 10;
      canvas.style.transform = `translate(${firstColumn * metrics.characterWidth}px, ${firstRow * metrics.lineHeight}px)`;
      for (let row = Math.max(0, firstRow); row <= Math.min(art.rows - 1, centerRow + 10); row += 1) {
        for (let column = Math.max(0, firstColumn); column <= Math.min(art.columns - 1, centerColumn + 15); column += 1) {
          const character = lines[row]?.[column];
          if (!character?.trim() || character === "\u200b") continue;
          const distance = Math.hypot((column - centerColumn) / 15, (row - centerRow) / 10);
          if (distance >= 1) continue;
          const glow = (1 - distance) ** 2 * cursorStrength;
          const star = glow > 0.45 && seed(column * 29 + row * 61) > 0.84;
          context.fillStyle = star ? white : highlight;
          context.globalAlpha = glow;
          context.fillText(
            star ? (column % 2 ? "*" : "+") : character,
            (column - firstColumn) * metrics.characterWidth,
            (row - firstRow) * metrics.lineHeight + metrics.baseline,
          );
        }
      }
      return nearby ? cursorStrength < 0.995 : cursorStrength > 0.005;
    }

    function drawTrail(time: number) {
      const centerColumn = (bounds.left + bounds.right) / 2;
      const centerRow = (bounds.top + bounds.bottom) / 2;
      for (let index = 0; index < 42; index += 1) {
        const cell = cells[Math.floor(seed(index + identifierSeed) * cells.length)];
        const phase = fraction(time * 0.42 + seed(index * 5.1));
        const angle = Math.atan2(cell.row - centerRow, (cell.column - centerColumn) * 0.6);
        const travel = phase * (2 + seed(index * 11) * 5);
        glyph(
          cell.character,
          cell.column + Math.cos(angle) * travel,
          cell.row + Math.sin(angle) * travel * 0.6,
          index % 5 ? art.color : highlight,
          Math.sin(phase * Math.PI) * 0.8,
        );
      }
    }

    function drawSparkler(time: number) {
      const centerColumn = (bounds.left + bounds.right) / 2;
      const centerRow = (bounds.top + bounds.bottom) / 2;
      for (let index = 0; index < 38; index += 1) {
        const phase = fraction(time * (0.65 + seed(index) * 0.3) + seed(index * 7));
        const angle = seed(index * 13 + identifierSeed) * TAU;
        const distance = 1 + phase * (12 + seed(index * 3) * 15);
        glyph(
          phase < 0.22 ? "*" : index % 2 ? "+" : ".",
          centerColumn + Math.cos(angle) * distance,
          centerRow + Math.sin(angle) * distance * 0.6 + phase * phase * 3,
          index % 4 ? art.color : white,
          Math.sin(Math.PI * phase) * 0.95,
        );
      }
      for (let index = 0; index < 16; index += 1) {
        const cell = cells[Math.floor(seed(index * 3.9) * cells.length)];
        const brightness = Math.max(0, Math.sin(time * 9 + index * 4));
        glyph(cell.character, cell.column, cell.row, white, brightness * 0.8);
      }
    }

    function drawFire(time: number) {
      for (let row = bounds.top; row <= bounds.bottom; row += 1) {
        for (let column = bounds.left; column <= bounds.right; column += 1) {
          const character = fireCharacter(column, row, bounds, time);
          if (character !== " ") glyph(character, column, row, art.color);
        }
      }
      for (let index = 0; index < 6; index += 1) {
        const phase = fraction(time * 0.3 + seed(index * 9 + identifierSeed));
        const spread = (seed(index * 5) - 0.5) * (bounds.right - bounds.left) * 0.45;
        const column =
          (bounds.left + bounds.right) / 2 + spread + Math.sin(time * 1.7 + index) * phase * 2;
        const row = bounds.bottom - phase * (bounds.bottom - bounds.top + 4);
        glyph(phase < 0.35 ? "+" : ".", column, row, art.color, Math.sin(phase * Math.PI));
      }
    }

    function tick(now: number) {
      frame = 0;
      if (disposed || !intersecting || motionPreference.matches || document.hidden || !metrics) {
        stop();
        return;
      }
      const elapsed = lastFrame ? now - lastFrame : 16;
      lastFrame = now;
      let continuing = true;
      if (mode === "cursor") {
        continuing = drawCursor(elapsed);
      } else if (now - lastDraw >= EFFECT_FRAME_MS) {
        clear();
        const time = now / 1000 + seed(identifierSeed) * 10;
        if (mode === "trail") drawTrail(time);
        else if (mode === "sparkler") drawSparkler(time);
        else if (mode === "fire") drawFire(time);
        element.dataset.running = "true";
        lastDraw = now;
      }
      context.globalAlpha = 1;
      if (continuing) frame = requestAnimationFrame(tick);
    }

    function start() {
      if (!frame && !disposed && metrics && intersecting && !motionPreference.matches && !document.hidden) {
        frame = requestAnimationFrame(tick);
      }
    }

    function updateActivity() {
      if (motionPreference.matches || document.hidden || !intersecting) stop();
      else start();
    }

    function handlePointer(event: PointerEvent) {
      pointer = { x: event.clientX, y: event.clientY };
      needsPointerRead = true;
      start();
    }

    function clearPointer() {
      pointer = null;
      needsPointerRead = true;
      start();
    }

    function handlePointerOut(event: PointerEvent) {
      if (!event.relatedTarget) clearPointer();
    }

    function handleScroll() {
      needsPointerRead = true;
      start();
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      needsPointerRead = true;
      updateActivity();
    });
    intersectionObserver.observe(element);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(source);
    motionPreference.addEventListener("change", updateActivity);
    document.addEventListener("visibilitychange", updateActivity);
    if (mode === "cursor") {
      window.addEventListener("pointermove", handlePointer, { passive: true });
      window.addEventListener("pointerout", handlePointerOut, { passive: true });
      window.addEventListener("blur", clearPointer);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    measure();
    document.fonts.ready.then(() => {
      if (!disposed) measure();
    });

    return () => {
      disposed = true;
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      motionPreference.removeEventListener("change", updateActivity);
      document.removeEventListener("visibilitychange", updateActivity);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("blur", clearPointer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [artwork, mode]);

  return {
    element: elementRef,
    source: sourceRef,
    canvas: canvasRef,
    origin: originRef,
    axisX: axisXRef,
    axisY: axisYRef,
  };
}

const PREPARED_ART: Partial<Record<string, PreparedAsciiArt>> = Object.fromEntries(
  Object.entries(ASCII_ART).map(([nodeId, art]) => {
    const cells = occupiedCells(art.text);
    const bounds = cellBounds(cells);
    return [nodeId, { ...art, nodeId, cells, bounds, fireText: art.mode === "fire" ? staticFire(art, bounds) : null }];
  }),
);

export default function AsciiArt({ nodeId, mode }: AsciiArtProps) {
  const art = PREPARED_ART[nodeId];
  const selectedMode = mode ?? art?.mode;
  const { element, source, canvas, origin, axisX, axisY } = useAsciiMotion(art, selectedMode);

  if (!art) return null;

  const artStyle: AsciiArtStyle = {
    "--ascii-left": `calc(${art.left} * var(--u))`,
    "--ascii-top": `calc(${art.top} * var(--u))`,
    "--ascii-font-size": `calc(${art.fontSize} * var(--u))`,
    "--ascii-line-height": `calc(${art.lineHeight} * var(--u))`,
    "--ascii-color": art.color,
    "--ascii-weight": selectedMode === "trail" ? 700 : art.fontWeight,
  };

  return (
    <span
      ref={element}
      className={styles.art}
      data-figma-ascii={nodeId}
      data-mode={selectedMode}
      aria-hidden="true"
      style={artStyle}
    >
      <pre ref={source} className={styles.source}>{selectedMode === "fire" ? art.fireText ?? staticFire(art, art.bounds) : art.text}</pre>
      <canvas ref={canvas} className={styles.canvas} />
      <i ref={origin} className={styles.marker} />
      <i ref={axisX} className={`${styles.marker} ${styles.axisX}`} />
      <i ref={axisY} className={`${styles.marker} ${styles.axisY}`} />
    </span>
  );
}
