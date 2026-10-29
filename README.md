# Spark website 2026–27

Next.js App Router, React, TypeScript, and CSS Modules, following the [WDS team repository](https://github.com/Western-Developer-Society-Technology/wds-website-2026-27/tree/9ee8c387a3973234809f9b544c25fe28fb1abcf5).

## Development

Use Node.js 22.13+ LTS and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`.

- `npm run check`: ESLint and production build, including strict TypeScript checks.
- `npm run build`: production build.
- `npm start`: serve the production build.

## Source layout

- `src/app`: page composition, metadata, and global styles.
- `src/components/sections`: text, controls, artwork, and scene motion.
- `src/components/ui/AsciiArt`: character animation and canvas effects.
- `src/lib/ascii-art.ts`: supplied ASCII artwork and measurements.
- `src/lib/custom-effects`: original Figma shader modules and formulas.
- `src/lib/custom-effect-runtime`: static, single-pass WebGPU integration.
- `public/images/figma`: referenced artwork, masks, and stroke overlays.
- `public/fonts`: local fonts and their licenses.

## Design and behavior

The source is [Figma frame 111:2](https://www.figma.com/design/5GAyrAwARCYIyJ4EWMQNWC/Spark-Hackathon-Site-26-27--Copy-?node-id=111-2&m=dev), measuring **1512 × 7709**. The shared `--u` coordinate unit scales this composition proportionally; no separate mobile frame was supplied. Artwork order, transforms, masks, and paint bounds retain the Figma structure. Native cloud exports use lossless WebP because the SVG exports omit their grain effects.

`Scene/hero-motion.ts` preserves the four-second load timing from frame `6:30`, mapped onto the selected composition without the extra orbit curves. The background stays black, and mountains appear after scrolling. `Scene/water-motion.ts` controls boat travel, bobbing, and the floating star's balance and recovery sequence. ASCII characters animate in place, with shooting trails and fire crackles. Motion respects reduced-motion preferences and pauses offscreen or when the tab is hidden.

The two authored shaders remain unchanged. Their static fills require WebGPU; the original artwork remains as the fallback. Animated wrappers use local artwork bounds to limit graphics memory. Duplicate sponsor images are intentional: their partially transparent pixels combine to match the draft.

FAQ answers use **“Coming soon.”** The **Apply now** button intentionally has no action. Sponsor and footer content remain placeholders from the unfinished draft.

Known rendering limit: abrupt, scripted full-viewport scroll jumps can cause a one-frame paint delay in Chrome. Continuous Retina scrolling has been checked separately. Browser antialiasing and procedural rendering prevent a zero-difference Figma pixel claim.

Local AI instructions, settings, environment files, and build output are excluded by `.gitignore`.
