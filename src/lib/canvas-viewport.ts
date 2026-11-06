export type CanvasRegion = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

/** A window in the original backing store, without changing its pixel grid. */
export type CanvasSurface = {
  left: number;
  top: number;
  width: number;
  height: number;
  fullWidth: number;
  fullHeight: number;
};

export function intersectCanvasRegions(a: CanvasRegion | null, b: CanvasRegion): CanvasRegion | null {
  if (!a) return null;
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);
  return right > left && bottom > top ? { left, top, right, bottom } : null;
}

/** The last transparent stop is a fraction of the ellipse radius, not the box. */
export function maskedCanvasRegion(width: number, height: number, radius: number, end: number, guard = 32): CanvasRegion {
  const full = { left: 0, top: 0, right: width, bottom: height };
  if (![width, height, radius, end, guard].every(Number.isFinite) || width <= 0 || height <= 0 ||
    radius <= 0 || radius > 1 || end <= 0 || end > 1 || guard < 0) return full;
  const extent = radius * end;
  return {
    left: Math.max(0, Math.floor(width * (0.5 - extent) - guard)),
    top: Math.max(0, Math.floor(height * (0.5 - extent) - guard)),
    right: Math.min(width, Math.ceil(width * (0.5 + extent) + guard)),
    bottom: Math.min(height, Math.ceil(height * (0.5 + extent) + guard)),
  };
}

export function canvasSurface(width: number, height: number, crop: CanvasRegion, pixelRatio: number): CanvasSurface {
  const fullWidth = Math.max(1, Math.ceil(width * pixelRatio));
  const fullHeight = Math.max(1, Math.ceil(height * pixelRatio));
  const left = Math.max(0, Math.floor(crop.left * pixelRatio));
  const top = Math.max(0, Math.floor(crop.top * pixelRatio));
  return {
    left, top, fullWidth, fullHeight,
    width: Math.max(1, Math.min(fullWidth, Math.ceil(crop.right * pixelRatio)) - left),
    height: Math.max(1, Math.min(fullHeight, Math.ceil(crop.bottom * pixelRatio)) - top),
  };
}

/** CSS placement uses the original backing-store ratio, including ceil rounding. */
export function canvasSurfaceStyle(surface: CanvasSurface, cssWidth: number, cssHeight: number) {
  return {
    left: `${surface.left / surface.fullWidth * 100}%`,
    top: `${surface.top / surface.fullHeight * 100}%`,
    right: "auto", bottom: "auto",
    width: `${surface.width / surface.fullWidth * 100}%`,
    height: `${surface.height / surface.fullHeight * 100}%`,
    maskSize: `${cssWidth}px ${cssHeight}px`,
    maskPosition: `${-cssWidth * surface.left / surface.fullWidth}px ${-cssHeight * surface.top / surface.fullHeight}px`,
    maskRepeat: "no-repeat",
  };
}

/** Logical canvas coordinates, including room for glyph ink, blur and scrolling. */
export function canvasViewportRegion(
  bounds: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
  padding = 96,
): CanvasRegion | null {
  if (width <= 0 || height <= 0 || bounds.width <= 0 || bounds.height <= 0) return null;
  const scaleX = bounds.width / width;
  const scaleY = bounds.height / height;
  const left = Math.max(0, Math.floor(-bounds.left / scaleX - padding));
  const top = Math.max(0, Math.floor(-bounds.top / scaleY - padding));
  const right = Math.min(width, Math.ceil((viewportWidth - bounds.left) / scaleX + padding));
  const bottom = Math.min(height, Math.ceil((viewportHeight - bounds.top) / scaleY + padding));
  return right > left && bottom > top ? { left, top, right, bottom } : null;
}

/** Seed or invalidate the complete cache; otherwise repaint only the current
 * viewport. Never erase outgoing pixels: compositor scrolling can reveal them
 * before the next animation frame, especially during a fast reversal. */
export function canvasRepaintRegion(
  current: CanvasRegion | null,
  surface: CanvasRegion,
  invalidate: boolean,
): CanvasRegion | null {
  return invalidate ? surface : intersectCanvasRegions(current, surface);
}

/** Keep the full-image sampling transform when updating only part of the bloom. */
export function copyBloomRegion(
  source: HTMLCanvasElement,
  bloom: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  region: CanvasRegion,
  surfaces?: { source: CanvasSurface; bloom: CanvasSurface },
) {
  const width = region.right - region.left;
  const height = region.bottom - region.top;
  const scaleX = (surfaces?.source.fullWidth ?? source.width) / (surfaces?.bloom.fullWidth ?? bloom.width);
  const scaleY = (surfaces?.source.fullHeight ?? source.height) / (surfaces?.bloom.fullHeight ?? bloom.height);
  const left = region.left - (surfaces?.bloom.left ?? 0);
  const top = region.top - (surfaces?.bloom.top ?? 0);
  context.clearRect(left, top, width, height);
  context.drawImage(
    source,
    region.left * scaleX - (surfaces?.source.left ?? 0), region.top * scaleY - (surfaces?.source.top ?? 0),
    width * scaleX, height * scaleY,
    left, top, width, height,
  );
}
