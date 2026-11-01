/** Shared hero-style ASCII glow sampling and glyph animation. */

export const DENSE_GLYPHS = "#@%&8$0SXBAHK@#X";
export const LIGHT_GLYPHS = "x*=+";
export const MIXED_GLYPHS = DENSE_GLYPHS + LIGHT_GLYPHS;
export const DENSE_ONLY_ABOVE = 0.6;
export const LIGHT_ONLY_BELOW = 0.35;

export const FADE_IN = 0.6;
export const HOLD = 1.5;
export const FADE_OUT = 0.6;
export const REST = 0.5;
export const CYCLE = FADE_IN + HOLD + FADE_OUT + REST;
export const FLIPS_PER_SECOND = 10;
export const FRAME_MS = 1000 / 30;

export const FONT_UNITS = 12;
export const FONT_MIN = 9;
export const FONT_MAX = 15;
export const SAMPLE_SCALE = 0.2;
export const BRIGHTNESS_HIDE = 0.08;
export const BRIGHTNESS_FULL = 0.45;
export const EDGE_OPACITY_CURVE = 0.6;
export const COLOR_LIFT = 0.28;
export const COLOR_WHITE_FROM = 0.38;
export const COLOR_WHITE_MIX = 0.62;
export const SKIP_RATE = 0.05;

export type GlowCell = {
  x: number;
  y: number;
  phase: number;
  hold: number;
  strength: number;
  packed: number;
  color: string;
  glyphs: string;
};

export function fract(value: number) {
  return value - Math.floor(value);
}

export function seed(value: number) {
  return fract(Math.sin(value * 127.1 + 311.7) * 43758.5453);
}

export function wrap(index: number, length: number) {
  return ((index % length) + length) % length;
}

export function glyphsFor(strength: number) {
  if (strength >= DENSE_ONLY_ABOVE) return DENSE_GLYPHS;
  if (strength < LIGHT_ONLY_BELOW) return LIGHT_GLYPHS;
  return MIXED_GLYPHS;
}

export function glyphColor(r: number, g: number, b: number, strength: number) {
  const brightness = Math.max(r, g, b) / 255;
  const hot = Math.min(1, Math.max(0, (brightness - COLOR_WHITE_FROM) / (1 - COLOR_WHITE_FROM)));
  const mix = Math.min(1, COLOR_LIFT * strength + hot * COLOR_WHITE_MIX);
  return `rgb(${Math.round(r + (255 - r) * mix)} ${Math.round(g + (255 - g) * mix)} ${Math.round(b + (255 - b) * mix)})`;
}

export function glyphFor(cell: GlowCell, time: number, cycling: boolean, cycleIndex: number) {
  const { glyphs } = cell;
  const hold = cell.hold + cycleIndex * 3;
  if (!cycling) return glyphs[wrap(hold, glyphs.length)];
  const flip = Math.floor(time * FLIPS_PER_SECOND + cell.phase * 11);
  return glyphs[wrap(hold + 1 + flip, glyphs.length)];
}

export function parseLengths(value: string) {
  return value === "none" ? [] : value.split(/\s+/).map((part) => parseFloat(part) || 0);
}

/** Paints a Figma layer into sample space, positioned relative to `origin`’s padding edge. */
export function drawArtLayer(
  target: CanvasRenderingContext2D,
  nodeId: string,
  sampleWidth: number,
  origin: HTMLElement,
  silhouette = false,
) {
  const node = document.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
  const image = node?.querySelector("img");
  const parent = image?.parentElement;
  if (!node || !image || !parent || image.naturalWidth === 0) return;

  const root = origin.parentElement;
  if (!root) return;

  const scale = sampleWidth / Math.max(1, origin.clientWidth);
  const paintBounds = parent === node
    ? { offsetLeft: 0, offsetTop: 0, offsetWidth: node.offsetWidth, offsetHeight: node.offsetHeight }
    : parent;

  let offsetX = 0;
  let offsetY = 0;
  let element: HTMLElement | null = node;
  while (element && element !== root) {
    offsetX += element.offsetLeft;
    offsetY += element.offsetTop;
    element = element.offsetParent as HTMLElement | null;
  }
  offsetX -= origin.offsetLeft;
  offsetY -= origin.offsetTop;

  const style = getComputedStyle(node);
  const [translateX = 0, translateY = 0] = parseLengths(style.translate);
  const [rotate = 0] = parseLengths(style.rotate);
  const [scaleX = 1, scaleY = scaleX] = parseLengths(style.scale);
  const blur = /blur\(([\d.]+)px\)/.exec(style.filter)?.[1];
  const centerX = offsetX + node.offsetWidth / 2;
  const centerY = offsetY + node.offsetHeight / 2;

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
