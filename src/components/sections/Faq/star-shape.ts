// The untouched silhouette from group-1364.svg remains the source of truth.
export const ORIGINAL_STAR_OUTLINE = "M202.649 65.8433C213.014 64.7377 222.17 72.5893 222.658 83.002L224.271 117.396C224.437 120.936 225.638 124.35 227.726 127.214L248.007 155.039C254.147 163.462 251.926 175.318 243.152 180.947L214.173 199.54C211.19 201.454 208.834 204.201 207.397 207.442L193.441 238.918C189.216 248.447 177.838 252.451 168.576 247.667L137.984 231.867C134.835 230.241 131.278 229.574 127.754 229.95L93.5165 233.602C83.1512 234.707 73.9949 226.856 73.5067 216.443L71.8941 182.05C71.7281 178.509 70.5268 175.095 68.439 172.231L48.1579 144.407C42.0178 135.983 44.2394 124.128 53.0129 118.498L81.9923 99.905C84.9754 97.991 87.3313 95.2437 88.7679 92.0036L102.724 60.5274C106.949 50.998 118.327 46.9943 127.589 51.7778L158.181 67.578C161.33 69.2045 164.887 69.871 168.411 69.4951L202.649 65.8433Z";

type Point = readonly [number, number];
type Cubic = readonly [Point, Point, Point, Point];
type BentPoint = {
  position: Point;
  // Row-major derivative of the deformation at this point.
  jacobian: readonly [number, number, number, number];
};

function between(a: Point, b: Point, fraction: number): Point {
  return [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction];
}

function halves([start, control1, control2, end]: Cubic): readonly [Cubic, Cubic] {
  const a = between(start, control1, .5);
  const b = between(control1, control2, .5);
  const c = between(control2, end, .5);
  const d = between(a, b, .5);
  const e = between(b, c, .5);
  const midpoint = between(d, e, .5);
  return [[start, a, d, midpoint], [midpoint, e, c, end]];
}

function originalCurves(): Cubic[] {
  const curves: Cubic[] = [];
  let cursor: Point = [0, 0];

  // This reads only the absolute M/C/L commands in the source artwork.
  // Expressing lines as exact cubics gives every animation pose one topology.
  for (const command of ORIGINAL_STAR_OUTLINE.match(/[MCL][^MCLZ]+/g) ?? []) {
    const values = command.slice(1).trim().split(/\s+/).map(Number);
    const point = (index: number): Point => [values[index], values[index + 1]];
    if (command[0] === "M") {
      cursor = point(0);
      continue;
    }

    const end = point(command[0] === "L" ? 0 : 4);
    const curve: Cubic = command[0] === "L"
      ? [cursor, between(cursor, end, 1 / 3), between(cursor, end, 2 / 3), end]
      : [cursor, point(0), point(2), end];
    // Exact subdivision gives the bend enough resolution without changing
    // any of the original curves in the neutral pose.
    curves.push(...halves(curve));
    cursor = end;
  }
  return curves;
}

const CURVES = originalCurves();

function bend(point: Point, leftDegrees: number, rightDegrees: number): BentPoint {
  // Put the full-strength part of each bend at the existing rounded side
  // tip. Its broad support fades through the shoulder, leaving the face
  // and the other points outside it instead of cutting out a rigid arm.
  const left = point[0] < 148;
  const center: Point = left ? [46, 131] : [251, 169];
  const pivot: Point = left ? [104, 141] : [194, 159];
  const degrees = left ? leftDegrees : rightDegrees;
  const dx = point[0] - center[0];
  const dy = point[1] - center[1];
  const q = dx * dx / (90 * 90) + dy * dy / (92 * 92);

  if (q >= 1 || degrees === 0) {
    return { position: point, jacobian: [1, 0, 0, 1] };
  }

  // (1-q)^3 and its first two derivatives vanish at the support boundary.
  const falloff = 1 - q;
  const radians = degrees * Math.PI / 180;
  const angle = radians * falloff ** 3;
  const angleX = -6 * radians * falloff ** 2 * dx / (90 * 90);
  const angleY = -6 * radians * falloff ** 2 * dy / (92 * 92);
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const x = point[0] - pivot[0];
  const y = point[1] - pivot[1];
  const rotatedX = cosine * x - sine * y;
  const rotatedY = sine * x + cosine * y;

  return {
    position: [pivot[0] + rotatedX, pivot[1] + rotatedY],
    jacobian: [
      cosine - rotatedY * angleX,
      -sine - rotatedY * angleY,
      sine + rotatedX * angleX,
      cosine + rotatedX * angleY,
    ],
  };
}

function bendHandle(endpoint: Point, handle: Point, bent: BentPoint): Point {
  const dx = handle[0] - endpoint[0];
  const dy = handle[1] - endpoint[1];
  const [xx, xy, yx, yy] = bent.jacobian;
  return [bent.position[0] + xx * dx + xy * dy, bent.position[1] + yx * dx + yy * dy];
}

function coordinates(point: Point): string {
  // Sub-millionth-unit rounding keeps SVG attributes compact.
  return point.map((value) => Number(value.toFixed(6))).join(" ");
}

/** Flex the existing star outline; positive angles rotate clockwise in SVG. */
export function starOutline(leftDegrees: number, rightDegrees: number): string {
  const curves = CURVES.map(([start, control1, control2, end]) => {
    const bentStart = bend(start, leftDegrees, rightDegrees);
    const bentEnd = bend(end, leftDegrees, rightDegrees);
    // Both sides of each join use the same endpoint and derivative. Their
    // tangent directions stay aligned, including between animation samples.
    return [
      bentStart.position,
      bendHandle(start, control1, bentStart),
      bendHandle(end, control2, bentEnd),
      bentEnd.position,
    ] as const;
  });

  return `M${coordinates(curves[0][0])}${curves.map(([, control1, control2, end]) => (
    `C${coordinates(control1)} ${coordinates(control2)} ${coordinates(end)}`
  )).join("")}Z`;
}
