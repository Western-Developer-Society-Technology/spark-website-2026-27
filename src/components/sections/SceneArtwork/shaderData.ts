import type { Shader } from "@/lib/custom-effect-runtime/types";
import { setup as cloudSetup, render as cloudRender, manifest as cloudManifest } from "@/lib/custom-effects/CodeComponentId_931ea9a684b2223e90e1a79eb5bc8615d5480882_dcfc1b9b43ac1499c3b180bae32a0c7ff16b4503";
import { setup as rockSetup, render as rockRender, manifest as rockManifest } from "@/lib/custom-effects/CodeComponentId_19fcf474c0fadc13b44b29a44a7aefe445af8ca6_eb3123438ee10f6ff035d7bbb1a9d32932dd9c4c";

// Exact custom-effect parameters returned by Figma, including original precision.
export const cloudShader = {
  setup: cloudSetup,
  render: cloudRender,
  params: {
    seed: 7,
    paintTexture: 0.2199999988079071,
    cloudScale: 1,
    coverage: 0.5600000023841858,
    edgeSoftness: 0.6399999856948853,
    opacity: 0.7799999713897705,
    shadowColor: {
      r: 0.18000000715255737,
      g: 0.33000001311302185,
      b: 0.3700000047683716,
      a: 1,
    },
    cloudColor: {
      r: 0.4000000059604645,
      g: 0.6100000143051147,
      b: 0.6200000047683716,
      a: 1,
    },
    fadeWidth: 18,
    brushDirection: -8,
    pigmentVariation: 0.3799999952316284,
    cloudPosition: {
      x: 50,
      y: 50,
    },
    brushStretch: 1.350000023841858,
  },
  manifest: cloudManifest,
} satisfies Shader;

export const farMountainShader = {
  setup: rockSetup,
  render: rockRender,
  params: {
    shadowColor: {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    },
    highlightColor: {
      r: 0.07370241731405258,
      g: 0.07928936183452606,
      b: 0.07928936183452606,
      a: 1,
    },
    paintGrain: 0.23999999463558197,
    brushDirection: 8,
    baseColor: {
      r: 0.058984797447919846,
      g: 0.06431997567415237,
      b: 0.06965519487857819,
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

export const middleMountainShader = {
  setup: rockSetup,
  render: rockRender,
  params: {
    shadowColor: {
      r: 0.039758674800395966,
      g: 0.046434350311756134,
      b: 0.05310997739434242,
      a: 1,
    },
    highlightColor: {
      r: 0.15171875059604645,
      g: 0.16584660112857819,
      b: 0.16584660112857819,
      a: 1,
    },
    paintGrain: 0.23999999463558197,
    brushDirection: 8,
    baseColor: {
      r: 0.0682002529501915,
      g: 0.07367905974388123,
      b: 0.07915790379047394,
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

export const nearMountainShader = {
  setup: rockSetup,
  render: rockRender,
  params: {
    shadowColor: {
      r: 0.05398833006620407,
      g: 0.06226309761404991,
      b: 0.07053785771131516,
      a: 1,
    },
    highlightColor: {
      r: 0.15369591116905212,
      g: 0.15369591116905212,
      b: 0.15369591116905212,
      a: 1,
    },
    paintGrain: 0.23999999463558197,
    brushDirection: 8,
    baseColor: {
      r: 0.0845598429441452,
      g: 0.09177468717098236,
      b: 0.09898963570594788,
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
