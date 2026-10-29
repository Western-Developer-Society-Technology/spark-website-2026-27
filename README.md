# Spark website 2026–27

Local implementation of the [selected Figma draft, frame 111:2](https://www.figma.com/design/5GAyrAwARCYIyJ4EWMQNWC/Spark-Hackathon-Site-26-27--Copy-?node-id=111-2&m=dev).

## Development

Use Node.js 22.13+ or a supported newer LTS version and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. `npm run check` runs ESLint and the production build, including TypeScript checks. `npm start` serves the production build.

## Stack and organization

The implementation follows [the WDS reference repository](https://github.com/Western-Developer-Society-Technology/wds-website-2026-27/tree/9ee8c387a3973234809f9b544c25fe28fb1abcf5): Next.js App Router, React, CSS Modules, and npm. Application code uses TypeScript/TSX, as requested. There is no Tailwind dependency.

- `src/app/page.tsx` composes the page sections.
- `src/components/sections/SceneArtwork` preserves the original artwork hierarchy, local assets, masks, rotations, and paint order.
- `src/components/sections/Scene` defines the shared coordinate unit and animation lifecycle.
- `src/components/sections/Hero`, `About`, and `Faq` contain the text and interactive controls.
- `src/components/ui/AsciiArt` renders live ASCII and its canvas overlays. `src/lib/ascii-art.ts` preserves the supplied character data.
- `public/images/figma` contains the original exported artwork. `public/fonts` contains the locally served variable fonts and their OFL licenses.

All application components, artwork metadata, animation code, and shader integration use TypeScript with `strict: true` and `allowJs: false`. The Figma-supplied WebGPU runtime under `src/lib/custom-effect-runtime` has only its imports adapted to resolve directly to the TypeScript files; JavaScript bridge files are no longer needed. The two authored shader modules under `src/lib/custom-effects` and their formulas remain unchanged. Scoped ESLint exceptions preserve the supplied runtime's DOM canvas synchronization.

Local AI instructions, agent settings, conversation state, and generated build files are excluded by `.gitignore`.

## Design source and behavior

The source frame measures **1512 × 7709**. All artwork uses that coordinate system through `--u: calc(100cqw / 1512)`. No mobile frame was supplied, so smaller screens proportionally scale the same composition. A separately designed mobile layout can be added when it exists.

The Eternalo wordmark is an exact SVG export of text node `111:96`; its rendered glyph bounds are positioned within the original text box. The irregular FAQ panel is an exact SVG export of node `116:112`. Additional mountain and campfire-log masks and mountain stroke overlays use the original Figma vector paths, preserving the native geometry and shader coordinate bounds.

Figma's SVG exports omit native noise effects on thirteen cloud and water layers. Those individual layers use transparent native exports, converted to lossless WebP with identical decoded RGBA pixels. Their original transforms and paint bounds are recorded in `nativeArtworkAssets.ts`. Superseded SVGs have been removed. All artwork is served locally; runtime code does not reference expiring Figma asset URLs.

The four-second hero motion is translated from the existing motion reference, frame `6:30`, onto the corresponding layers in `111:2`. Its timing and easing come from Figma. On-canvas notes also request cursor-reactive ASCII, radiating trails, rising ASCII fire, sparkling sparklers, a rowing boat, and a yellow star that shakes and dips below the water. Those notes do not supply exact keyframes or durations: the boat's 16-second loop, the star's eight-second loop, and procedural ASCII animation rates are explicit implementation settings in `Scene.tsx` and `AsciiArt/index.tsx`. These can be tuned by the design team.

Motion respects `prefers-reduced-motion`, pauses while the tab is hidden, and stops for artwork outside the viewport. Decorative SVG artwork remains visible without WebGPU; procedural mountain and log fills require WebGPU. No HTML-in-Canvas API is required by the rendered `ShaderFill` components.

FAQ answers and the application action use the approved **“Coming soon.”** placeholders. Only one FAQ answer can be open, across both columns. Sponsor logos and `Team/footer` remain exactly as present in the unfinished draft; they are not confirmed event content.

## Verification and review notes

ESLint, strict TypeScript checking, and the production build pass. All 24 browser checks pass against the production server at 1512px and 390px widths, covering asset loading, FAQ exclusivity, keyboard activation, application feedback, cursor interaction, hero and water motion, offscreen pausing, and reduced-motion cleanup. All 106 compared rendered node bounds match Figma within 0.018 CSS pixels of browser rounding.

A local full-resolution **1512 × 7709** comparison against the Figma export caught and corrected shader masks, centered strokes, and missing native grain, alongside the wordmark export bounds and hand-drawn FAQ outline. Browser text antialiasing, procedural rendering, and the annotated animations prevent a zero-difference pixel claim.

The cleanup audit retains every referenced artwork asset, font, ASCII layer, CSS Module selector, and supplied shader. Identical sponsor image elements are intentional: their source contains partially transparent pixels, so overlapping copies change the rendered opacity. Obsolete JavaScript bridges and unused ASCII mode aliases have been removed.

The WDS reference pins Next.js `16.3.5`; that version is retained here. `npm audit` currently reports advisories against that pinned package and proposes `16.4.3`. Review that version update before deployment. No deployment, commit, or push has been performed.
