// Rebuild pixel-preserving delivery copies; original artwork is never overwritten.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, statSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
// Preserve the authored palette and alpha, including artwork sampled by ASCII.
const sources = [
  "/images/footer/wds-logo.png",
  "/images/mountains/mountain1.png",
  "/images/mountains/mountain2.png",
  "/images/mountains/mountain3.png",
  "/images/mountains/mountain3foreground.png",
  "/images/mountains/mountaingradient.png",
  "/images/campfire/campfire-wood.png",
  "/images/mountains/mountain4.png",
  "/images/mountains/ridge-foreground.png",
  "/images/figma/tall-left-cloud-native.png",
  "/images/figma/upper-right-cloud-native.png",
  "/images/figma/lower-right-cloud-native.png",
  "/images/figma/lower-left-cloud-native.png",
  "/images/figma/middle-left-cloud-native.png",
  "/images/figma/rendered/orangeStar.png",
  "/images/figma/rendered/cloud-1.png",
  "/images/figma/rendered/blueStar.png",
  "/images/figma/rendered/yellowStar.png",
  "/images/figma/rendered/cloud-2.png",
  "/images/figma/rendered/cloud-3.png",
  "/images/figma/rendered/redStar.png",
  "/images/figma/rendered/cloud-4.png",
  "/images/figma/rendered/lastYearCloud.png",
  "/images/figma/rendered/ellipse-1.png",
  "/images/figma/rendered/blue-left-cloud.png",
  "/images/figma/faq-left-cloud-noise-native.png",
  "/images/figma/rendered/blue-right-cloud.png",
  "/images/figma/faq-right-cloud-noise-native.png",
  "/images/figma/rendered/blue-middle-cloud.png",
  "/images/figma/faq-middle-cloud-noise-native.png",
  "/images/figma/rendered/blue-wide-cloud.png",
  "/images/figma/faq-wide-cloud-noise-native.png",
  "/images/figma/rendered/blue-front-cloud.png",
  "/images/figma/faq-front-cloud-noise-native.png"
];
const manifest = [];
for (const source of sources) {
  const input = path.join(root, "public", source);
  const target = source.replace("/images/", "/images/optimized/").slice(0, -4) + ".webp";
  const output = path.join(root, "public", target);
  mkdirSync(path.dirname(output), { recursive: true });
  await sharp(input).webp({ lossless: true, quality: 100, effort: 6 }).toFile(output);
  if (statSync(output).size >= statSync(input).size) {
    unlinkSync(output);
    continue;
  }
  const a = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) throw new Error(source + ": dimensions changed");
  for (let i = 0; i < a.data.length; i += 4) {
    if (a.data[i + 3] !== b.data[i + 3] || (a.data[i + 3] > 0 &&
      (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]))) {
      throw new Error(source + ": visible pixels changed");
    }
  }
  const item = {
    source,
    target,
    width: a.info.width,
    height: a.info.height,
    sourceBytes: statSync(input).size,
    bytes: statSync(output).size,
    sourceSha256: createHash("sha256").update(readFileSync(input)).digest("hex"),
  };
  manifest.push(item);
  console.log(source + ": " + item.sourceBytes + " -> " + item.bytes);
}
writeFileSync(path.join(root, "src/lib/optimized-artwork.json"), JSON.stringify(manifest, null, 2) + "\n");
