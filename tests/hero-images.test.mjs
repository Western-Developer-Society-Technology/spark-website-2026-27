import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync(new URL("../src/components/sections/Hero/image-variants.json", import.meta.url), "utf8"));

function image(url) {
  const bytes = readFileSync(new URL(`../public${url}`, import.meta.url));
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  let size;
  let lossless = false;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const kind = bytes.toString("ascii", offset, offset + 4);
    const length = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (kind === "VP8X") size = { width: 1 + bytes.readUIntLE(data + 4, 3), height: 1 + bytes.readUIntLE(data + 7, 3) };
    if (kind === "VP8L") {
      lossless = true;
      const bits = bytes.readUInt32LE(data + 1);
      size ??= { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
    }
    offset += 8 + length + length % 2;
  }
  assert.ok(size && lossless, `${url} must be lossless WebP`);
  return { ...size, bytes: bytes.length };
}

test("all five hero layers retain an original-sized candidate and their source fallback", () => {
  const originals = { imgEllipse1: "ellipse-1", imgEllipse2: "ellipse-2", imgEllipse3: "ellipse-3", imgEllipse4: "ellipse-4", glare: "group-1352" };
  assert.deepEqual(Object.keys(manifest).sort(), Object.keys(originals).sort());
  for (const [key, name] of Object.entries(originals)) {
    const src = `/images/figma/rendered/${name}.webp`;
    const original = image(src);
    const [url, descriptor] = manifest[key].srcSet.split(", ").at(-1).split(" ");
    assert.equal(descriptor, `${original.width}w`);
    assert.equal(image(url).width, original.width);
    assert.equal(image(url).height, original.height);
  }
});

test("responsive descriptors match real pixels, aspect ratios and smaller lossless files", () => {
  for (const { srcSet } of Object.values(manifest)) {
    const entries = srcSet.split(", ").map((entry) => {
      const [url, descriptor] = entry.split(" ");
      const data = image(url);
      assert.equal(descriptor, `${data.width}w`);
      return data;
    });
    const original = entries.at(-1);
    for (let index = 0; index < entries.length - 1; index++) {
      const variant = entries[index];
      assert.ok(variant.width < entries[index + 1].width);
      assert.ok(variant.bytes < original.bytes, "a responsive choice must not increase download size");
      assert.ok(Math.abs(variant.height - original.height * variant.width / original.width) <= 1);
    }
  }
});
