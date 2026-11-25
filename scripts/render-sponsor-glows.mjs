// Rasterize the blurred sponsor glow SVG once, so phones don't redraw SVG blur filters while scrolling.
// The SVG sources stay the originals; rerun after editing them.
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
// scale: pixels per SVG unit. The glow is blurred so heavily that half size, stretched back,
// stays within 5/255 of the original in Chrome and Safari. planet-ball.svg stays an SVG:
// Safari draws it without its mask, so no single image matches both browsers.
const sources = [
  // pad: SVG units drawn past each edge, so the blur near the edge matches browsers (they blur shapes outside the viewBox too).
  { source: "/images/sponsors/gradient.svg", scale: 0.5, pad: 200 },
];
for (const { source, scale, pad = 0 } of sources) {
  const input = path.join(root, "public", source);
  const target = source.replace("/images/", "/images/optimized/").slice(0, -4) + ".webp";
  const output = path.join(root, "public", target);
  mkdirSync(path.dirname(output), { recursive: true });
  let svg = readFileSync(input, "utf8");
  const [x, y, width, height] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  if (pad) svg = svg.replace(/viewBox="[^"]+"/, `viewBox="${x - pad} ${y - pad} ${width + 2 * pad} ${height + 2 * pad}"`);
  const padded = await sharp(Buffer.from(svg), { density: 72 * scale }).png().toBuffer();
  const info = await sharp(padded)
    .extract({ left: Math.round(pad * scale), top: Math.round(pad * scale), width: Math.round(width * scale), height: Math.round(height * scale) })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(output);
  console.log(`${source} -> ${target} (${info.width}x${info.height}, ${info.size} bytes)`);
}
