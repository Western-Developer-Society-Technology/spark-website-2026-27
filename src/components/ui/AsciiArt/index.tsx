"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ASCII_ART, type AsciiArtMetadata, type AsciiArtMode } from "../../../lib/ascii-art";
import { sampleFire } from "@/lib/fire-field";
import styles from "./AsciiArt.module.css";

interface AsciiCell {
  character: string;
  column: number;
  row: number;
  index: number;
  palette: string;
  phase: number;
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

interface AsciiGeometry {
  origin: Point;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  determinant: number;
}

interface FireCrackle {
  column: number;
  row: number;
  tailColumn: number;
  tailRow: number;
  phase: number;
  burst: number;
  direction: number;
}

interface AsciiMetrics {
  lineHeight: number;
  characterWidth: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  paddingX: number;
  paddingY: number;
  baseline: number;
  fireStride: number;
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
}

// Animation rates are implementation choices; Figma specifies the direction and
// interaction of these effects, but does not specify their duration or easing.
const EFFECT_FRAME_MS = 1000 / 24;
const TEXT_FRAME_MS = 1000 / 12;
const CURSOR_FADE_MS = 260;

function fraction(value: number) {
  return value - Math.floor(value);
}

function seed(value: number) {
  return fraction(Math.sin(value * 127.1 + 311.7) * 43758.5453);
}

function characterPalette(character: string) {
  // Keep each substitution close to the source glyph's ink density. Moving
  // through these characters animates the art without moving its silhouette.
  return [".`',", ":;", "^'`", "-_~", "<>", "iIl1!|", "@%#", "+*x", "()", "/\\"]
    .find((palette) => palette.includes(character)) ?? character;
}

function occupiedCells(text: string): AsciiCell[] {
  const cells: AsciiCell[] = [];
  let row = 0;
  let column = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === "\n") {
      row += 1;
      column = 0;
      continue;
    }
    if (character.trim() && character !== "\u200b") {
      cells.push({
        character,
        column,
        row,
        index,
        palette: characterPalette(character),
        phase: seed(column * 17 + row * 31),
      });
    }
    column += 1;
  }
  return cells;
}

function animatedText(art: PreparedAsciiArt, mode: AsciiArtMode | undefined, time: number) {
  const characters = art.text.split("");
  const centerColumn = (art.bounds.left + art.bounds.right) / 2;
  const centerRow = (art.bounds.top + art.bounds.bottom) / 2;
  const speed = mode === "sparkler" ? 11 : mode === "trail" ? 9 : 6;
  for (const cell of art.cells) {
    const { character, column, row, palette, phase } = cell;
    const travel = mode === "sparkler"
      ? Math.hypot((column - centerColumn) * 0.6, row - centerRow) * 0.7
      : mode === "trail"
        ? column * 0.16 + row * 0.2
        : column * 0.035 + row * 0.06;
    const step = Math.floor(time * speed - travel + phase * 3);
    // Each wave returns to the exact source character, keeping its original
    // detail legible between substitutions. No blank cell becomes occupied.
    if ((step + Math.floor(phase * 7)) % 4 === 0) continue;
    const index = ((palette.indexOf(character) + step) % palette.length + palette.length) % palette.length;
    characters[cell.index] = palette[index];
  }
  return characters.join("");
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

function staticFire(art: AsciiArtMetadata, bounds: AsciiBounds) {
  const stride = art.fireStride ?? 1;
  const displayRows = Math.ceil((bounds.bottom - bounds.top + 1) / stride);
  const displayColumns = Math.ceil((bounds.right - bounds.left + 1) / stride);
  return Array.from({ length: displayRows }, (_, displayRow) =>
    Array.from({ length: displayColumns }, (_, displayColumn) => {
      const column = bounds.left + displayColumn * stride;
      const row = bounds.top + displayRow * stride;
      const { character, opacity } = sampleFire(column, row, bounds, 0);
      if (opacity < 0.15) return " ";
      if (opacity < 0.4) return ".";
      return opacity < 0.7 ? ":" : character;
    }).join(""),
  ).join("\n");
}

function fireCrackles(time: number, bounds: AsciiBounds): FireCrackle[] {
  const crackles: FireCrackle[] = [];
  const cycle = Math.floor(time / 2.4);
  const height = bounds.bottom - bounds.top;
  const center = (bounds.left + bounds.right) / 2;

  // Uneven pauses and a small group of related embers read as one log crackle.
  // The previous cycle lets an occasional late burst finish without cutting out.
  for (let event = cycle - 1; event <= cycle; event += 1) {
    const delay = 0.15 + seed(event * 13.7) * 0.6;
    const count = seed(event * 3.9) > 0.6 ? 3 : 2;
    const origin = center + (seed(event * 19.1) - 0.5) * 10;
    for (let index = 0; index < count; index += 1) {
      const identity = event * 23.3 + index * 7.1;
      const age = time - event * 2.4 - delay - index * 0.095;
      const flight = 0.85 + seed(identity + 1) * 0.32;
      const burstDuration = 0.32;
      if (age < 0 || age >= flight + burstDuration) continue;
      const phase = Math.min(age / flight, 1);
      const burst = Math.max(0, (age - flight) / burstDuration);
      const direction = seed(identity + 2) > 0.5 ? 1 : -1;
      const drift = direction * (2 + seed(identity + 3) * 3);
      const start = bounds.bottom - height * (0.48 + seed(identity + 4) * 0.15);
      const rise = height * (0.7 + seed(identity + 5) * 0.2);
      const position = (progress: number) => ({
        column: origin + index * direction + drift * (progress + Math.sin(progress * Math.PI) * 0.35),
        row: start - rise * (0.45 * progress + 0.55 * progress * progress),
      });
      const head = position(phase);
      const tail = position(Math.max(0, phase - 0.13));
      crackles.push({
        column: Math.round(head.column),
        row: Math.round(head.row),
        tailColumn: Math.round(tail.column),
        tailRow: Math.round(tail.row),
        phase,
        burst,
        direction,
      });
    }
  }
  return crackles;
}

function measureGeometry(markers: [HTMLElement, HTMLElement, HTMLElement]): AsciiGeometry | null {
  const origin = markers[0].getBoundingClientRect();
  const horizontal = markers[1].getBoundingClientRect();
  const vertical = markers[2].getBoundingClientRect();
  const ax = (horizontal.x - origin.x) / 100;
  const ay = (horizontal.y - origin.y) / 100;
  const bx = (vertical.x - origin.x) / 100;
  const by = (vertical.y - origin.y) / 100;
  const determinant = ax * by - ay * bx;
  if (Math.abs(determinant) < 0.0001) return null;
  return {
    origin: { x: origin.x + window.scrollX, y: origin.y + window.scrollY },
    ax,
    ay,
    bx,
    by,
    determinant,
  };
}

function localPoint(point: Point, geometry: AsciiGeometry): Point {
  const { origin, ax, ay, bx, by, determinant } = geometry;
  const x = point.x + window.scrollX - origin.x;
  const y = point.y + window.scrollY - origin.y;
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
    if (!artwork) return;

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
    const emitsCrackles = mode === "fire" && art.nodeId === "121:55";
    const drawingContext = canvas.getContext("2d");
    if (!drawingContext) return;
    const context = drawingContext;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let intersecting = false;
    let frame = 0;
    let lastDraw = 0;
    let lastTextDraw = 0;
    let lastFrame = 0;
    let metrics: AsciiMetrics | null = null;
    let geometry: AsciiGeometry | null = null;
    let pointer: Point | null = null;
    let cursorStrength = 0;
    let cursorDrawn = false;
    let needsPointerRead = false;
    let localPointer: Point | null = null;

    const lines = art.text.split("\n");
    const sourceText = mode === "fire" ? art.fireText ?? staticFire(art, bounds) : art.text;
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
      lastTextDraw = 0;
      element.dataset.running = "false";
      source.textContent = sourceText;
      clear();
      cursorDrawn = false;
    }

    function measure() {
      const computed = getComputedStyle(source);
      // Cursor artwork is fixed in document space. Cache its transform before
      // canvas writes, so scrolling never forces layout after a text animation.
      if (mode === "cursor") geometry = measureGeometry(markers);
      const fireStride = mode === "fire" ? (art.fireStride ?? 1) : 1;
      let fontSize = parseFloat(computed.fontSize);
      let lineHeight = parseFloat(computed.lineHeight);
      const fontWeight = computed.fontWeight;
      if (mode === "fire" && fireStride > 1) {
        fontSize *= fireStride;
        lineHeight *= fireStride;
      }
      context.font = `${fontWeight} ${fontSize}px "Roboto Mono"`;
      const measurement = context.measureText("M");
      const characterWidth = measurement.width;
      const ascent = measurement.fontBoundingBoxAscent ?? fontSize * 0.8;
      const descent = measurement.fontBoundingBoxDescent ?? fontSize * 0.2;
      const boundColumns = bounds.right - bounds.left + 1;
      const boundRows = bounds.bottom - bounds.top + 1;
      const displayColumns =
        mode === "fire" ? Math.ceil(boundColumns / fireStride) : art.columns;
      const displayRows = mode === "fire" ? Math.ceil(boundRows / fireStride) : art.rows;
      const width = characterWidth * displayColumns;
      const height = lineHeight * displayRows;
      const paddingX = mode === "trail" ? fontSize * 5 : emitsCrackles ? characterWidth * 8 : 0;
      const paddingY = emitsCrackles ? lineHeight * 16 : mode === "trail" ? fontSize * 5 : 0;
      const canvasWidth = mode === "cursor" ? characterWidth * 31 : width + paddingX * 2;
      const canvasHeight =
        mode === "cursor"
          ? lineHeight * 21
          : mode === "trail"
            ? (bounds.bottom + 1) * lineHeight + paddingY * 2
            : height + paddingY;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.ceil(canvasWidth * pixelRatio));
      canvas.height = Math.max(1, Math.ceil(canvasHeight * pixelRatio));
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      canvas.style.left = `${-paddingX}px`;
      canvas.style.top = `${-paddingY}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.font = `${fontWeight} ${fontSize}px "Roboto Mono"`;
      context.textBaseline = "alphabetic";
      metrics = {
        lineHeight,
        characterWidth,
        width,
        height,
        canvasWidth,
        canvasHeight,
        paddingX,
        paddingY,
        baseline: (lineHeight - ascent - descent) / 2 + ascent,
        fireStride,
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
        column * metrics.characterWidth + metrics.paddingX,
        row * metrics.lineHeight + metrics.baseline + metrics.paddingY,
      );
    }

    function drawCursor(elapsed: number) {
      if (!metrics) return;
      if (needsPointerRead) {
        localPointer = pointer && geometry ? localPoint(pointer, geometry) : null;
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
      if (!point || cursorStrength < 0.005) {
        if (cursorDrawn) {
          clear();
          cursorDrawn = false;
        }
        return;
      }
      clear();
      cursorDrawn = true;

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

    function fireFill(intensity: number) {
      // Same white lift as hero ASCII hot glow (HeroAscii glyphColor).
      const hot = Math.min(1, Math.max(0, (intensity - 0.38) / 0.62));
      return mixColor(art.color, Math.min(0.62, 0.28 * intensity + hot * 0.62));
    }

    function drawFire(time: number) {
      const stride = art.fireStride ?? 1;
      const toDisplay = (column: number, row: number) => ({
        column: (column - bounds.left) / stride,
        row: (row - bounds.top) / stride,
      });
      for (let row = bounds.top; row <= bounds.bottom; row += stride) {
        for (let column = bounds.left; column <= bounds.right; column += stride) {
          const { character, opacity, intensity } = sampleFire(column, row, bounds, time);
          if (character !== " ") {
            const point = toDisplay(column, row);
            glyph(character, point.column, point.row, fireFill(intensity), opacity);
          }
        }
      }
      if (!emitsCrackles) return;
      for (const crackle of fireCrackles(time, bounds)) {
        const { column, row, tailColumn, tailRow, phase, burst, direction } = crackle;
        if (phase < 1) {
          const character = ["+", "x", "*"][Math.floor(time * 15 + column) % 3];
          const head = toDisplay(column, row);
          const tail = toDisplay(tailColumn, tailRow);
          glyph(character, head.column, head.row, phase > 0.82 ? white : highlight, Math.min(1, phase * 7) * 0.95);
          glyph(".", tail.column, tail.row, art.color, Math.min(0.5, phase));
        } else {
          const fade = (1 - burst) ** 1.5;
          const spread = 1 + Math.round(burst * 2);
          const head = toDisplay(column, row);
          // A white-hot centre breaks into a few orange glyphs, then disappears.
          glyph(burst < 0.3 ? "*" : "+", head.column, head.row, white, fade);
          glyph("+", head.column - spread, head.row - 1, highlight, fade * 0.9);
          glyph("x", head.column + spread, head.row + direction, art.color, fade * 0.9);
          glyph(".", head.column + direction, head.row - spread, art.color, fade * 0.7);
        }
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
      const time = now / 1000 + seed(identifierSeed) * 10;
      if (mode !== "fire" && now - lastTextDraw >= TEXT_FRAME_MS) {
        source.textContent = animatedText(art, mode, time);
        element.dataset.running = "true";
        lastTextDraw = now;
      }
      if (mode === "cursor") {
        drawCursor(elapsed);
      } else if (now - lastDraw >= EFFECT_FRAME_MS) {
        clear();
        if (mode === "trail") drawTrail(time);
        else if (mode === "fire") drawFire(time);
        element.dataset.running = "true";
        lastDraw = now;
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(tick);
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

export default function AsciiArt({ nodeId }: AsciiArtProps) {
  const art = PREPARED_ART[nodeId];
  const selectedMode = art?.mode;
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
      <pre ref={source} className={styles.source}>
        {selectedMode === "fire" ? art.fireText ?? staticFire(art, art.bounds) : art.text}
      </pre>
      <canvas ref={canvas} className={styles.canvas} />
      <i ref={origin} className={styles.marker} />
      <i ref={axisX} className={`${styles.marker} ${styles.axisX}`} />
      <i ref={axisY} className={`${styles.marker} ${styles.axisY}`} />
    </span>
  );
}
