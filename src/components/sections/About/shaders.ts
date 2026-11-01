import type { Shader } from "@/lib/custom-effect-runtime/types";
import { setup as rockSetup, render as rockRender, manifest as rockManifest } from "@/lib/custom-effects/CodeComponentId_19fcf474c0fadc13b44b29a44a7aefe445af8ca6_eb3123438ee10f6ff035d7bbb1a9d32932dd9c4c";

/** Campfire log wood grain (Figma rock custom effect). */
export const campfireLogShader = {
  setup: rockSetup,
  render: rockRender,
  params: {
    shadowColor: {
      r: 0.21743538975715637,
      g: 0.1295149177312851,
      b: 0.08429868519306183,
      a: 1,
    },
    highlightColor: {
      r: 0.6373385190963745,
      g: 0.4571855068206787,
      b: 0.364535391330719,
      a: 1,
    },
    paintGrain: 0.23999999463558197,
    brushDirection: -64,
    baseColor: {
      r: 0.35686275362968445,
      g: 0.21960784494876862,
      b: 0.14901961386203766,
      a: 1,
    },
    textureScale: 1,
    brushRoughness: 0.5,
    seed: 17,
    contrast: 1,
    rockLayering: 4,
  },
  manifest: rockManifest,
} satisfies Shader;
