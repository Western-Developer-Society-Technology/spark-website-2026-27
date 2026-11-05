// Run with `node scripts/generate-hero-images.mjs`; uses Next.js's existing Sharp encoder.
// The original 2x artwork stays untouched, including as the HTML src fallback.
import { mkdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const base = "/images/figma/rendered";
// 2048 avoids overserving 2560px textures at common laptop paint widths.
const widths = [640, 960, 1280, 1600, 1920, 2048, 2560, 3200];
const images = {
  imgEllipse1: { name: "ellipse-1", paintWidth: 1161 * (1 + .4795 + .4031), peakScale: 1 },
  imgEllipse2: { name: "ellipse-2", paintWidth: 1334 * (1 + .075 + .075), peakScale: 1 },
  imgEllipse4: { name: "ellipse-4", paintWidth: 1090 * (1 + .0917 + .091), peakScale: 1.06 },
  imgEllipse3: { name: "ellipse-3", paintWidth: 1222 * (1 + .0057 + .0058), peakScale: 1 },
  glare: { name: "group-1352", paintWidth: 553.852, peakScale: 1.09 / .84 },
};
const manifest = {};
mkdirSync(path.join(root, "public", base, "responsive"), { recursive: true });

for (const [key, { name, paintWidth, peakScale }] of Object.entries(images)) {
  const src = `${base}/${name}.webp`;
  const input = path.join(root, "public", src);
  const { width: originalWidth } = await sharp(input).metadata();
  const fullUrl = `${base}/responsive/${name}-${originalWidth}.webp`;
  const fullOutput = path.join(root, "public", fullUrl);
  await sharp(input).webp({ lossless: true, quality: 100, effort: 6 }).toFile(fullOutput);
  const fullIsSmaller = statSync(fullOutput).size < statSync(input).size;
  if (fullIsSmaller) {
    const original = await sharp(input).ensureAlpha().raw().toBuffer();
    const encoded = await sharp(fullOutput).ensureAlpha().raw().toBuffer();
    for (let index = 0; index < original.length; index += 4) {
      if (original[index + 3] !== encoded[index + 3] ||
        (original[index + 3] > 0 && (original[index] !== encoded[index] ||
          original[index + 1] !== encoded[index + 1] || original[index + 2] !== encoded[index + 2]))) {
        throw new Error(`${name}: full-resolution recompression changed visible pixels`);
      }
    }
  } else unlinkSync(fullOutput);
  const fullSize = statSync(fullIsSmaller ? fullOutput : input).size;
  const candidates = [];
  for (const width of widths.filter((width) => width < originalWidth)) {
    const url = `${base}/responsive/${name}-${width}.webp`;
    await sharp(input).resize({ width, kernel: "lanczos3" })
      .webp({ lossless: true, quality: 100, effort: 6 }).toFile(path.join(root, "public", url));
    const output = path.join(root, "public", url);
    if (statSync(output).size < fullSize) candidates.push(`${url} ${width}w`);
    else unlinkSync(output); // Resizing noisy light textures can increase lossless entropy.
  }
  candidates.push(`${fullIsSmaller ? fullUrl : src} ${originalWidth}w`);
  // Match --u in Hero.module.css, allowing for the largest authored intro scale.
  const logicalWidth = paintWidth * peakScale;
  const n = (value) => Math.ceil(value * 1000000) / 1000000;
  manifest[key] = {
    srcSet: candidates.join(", "),
    sizes: `(max-width: 1023px) min(${n(logicalWidth / 780 * 100)}vw, ${n(logicalWidth * .8)}px), ${n(logicalWidth / 1512 * 100)}vw`,
  };
  console.log(`${name}: ${candidates.length} sizes (original ${originalWidth}px retained)`);
}
writeFileSync(path.join(root, "src/components/sections/Hero/image-variants.json"), JSON.stringify(manifest, null, 2) + "\n");
