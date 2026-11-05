import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const manifest = JSON.parse(readFileSync(new URL("../src/lib/optimized-artwork.json", import.meta.url), "utf8"));

test("optimized delivery copies preserve original dimensions, alpha and every visible RGB channel", async () => {
  assert.ok(manifest.length > 0);
  for (const item of manifest) {
    const source = readFileSync(new URL(`../public${item.source}`, import.meta.url));
    const target = readFileSync(new URL(`../public${item.target}`, import.meta.url));
    assert.equal(createHash("sha256").update(source).digest("hex"), item.sourceSha256);
    assert.ok(target.length < source.length, item.source);
    assert.equal((await sharp(target).metadata()).format, "webp");
    const a = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(target).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(a.info.width, b.info.width);
    assert.equal(a.info.height, b.info.height);
    assert.equal(a.info.width, item.width);
    assert.equal(a.info.height, item.height);
    for (let i = 0; i < a.data.length; i += 4) {
      if (a.data[i + 3] !== b.data[i + 3] || (a.data[i + 3] > 0 &&
        (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]))) {
        assert.fail(`${item.source}: visible pixel ${i / 4} changed`);
      }
    }
  }
});
