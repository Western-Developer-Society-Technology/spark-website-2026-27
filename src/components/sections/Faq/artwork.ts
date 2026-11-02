import type { BlueCloud } from "@/components/ui/Artwork";

// Static SVG filters are baked at 2× into lossless WebP to avoid raster work during scroll.

/** Figma px; moves blue layer down so more white cloud shows above. */
const faqCloudBlueOffset = 45;

type FaqCloudLayer = {
  white: string;
  blueNodeId: string;
  blue: BlueCloud;
};

function faqBlueCloud(
  src: string,
  left: number,
  top: number,
  width: number,
  height: number,
  transform: string,
  paintBounds: BlueCloud["paintBounds"],
  blueTopOffset = faqCloudBlueOffset,
): BlueCloud {
  return {
    src,
    left,
    top: top + blueTopOffset,
    width,
    height,
    transform,
    paintBounds,
  };
}

export const faqClouds = {
  left: {
    white: "/images/figma/rendered/cloud-19.webp",
    blueNodeId: "116:127",
    blue: faqBlueCloud(
      "/images/figma/faq-left-cloud-noise-native.webp",
      -246,
      4958,
      854.5458374023438,
      377.1863708496094,
      "matrix(1, 0, 0, 1, 0, 0)",
      {
        left: -48.62109375,
        top: -32,
        width: 941.66015625,
        height: 455.6551208496094,
      },
    ),
  },
  right: {
    white: "/images/figma/rendered/cloud-22.webp",
    blueNodeId: "116:135",
    blue: faqBlueCloud(
      "/images/figma/faq-right-cloud-noise-native.webp",
      852,
      4928,
      854.5458374023438,
      412.1863708496094,
      "matrix(1, 0, 0, 1, 0, 0)",
      {
        left: -52.5625,
        top: -26.8037109375,
        width: 942.7109375,
        height: 485.62933349609375,
      },
    ),
  },
  middle: {
    white: "/images/figma/rendered/cloud-25.webp",
    blueNodeId: "116:143",
    blue: faqBlueCloud(
      "/images/figma/faq-middle-cloud-noise-native.webp",
      1139,
      4940,
      814.8455810546875,
      377.1863708496094,
      "matrix(-1, 0, 0, 1, 0, 0)",
      {
        left: -49.3046875,
        top: -32,
        width: 896.6171875,
        height: 456.44586181640625,
      },
    ),
  },
  wide: {
    white: "/images/figma/rendered/cloud-28.webp",
    blueNodeId: "116:151",
    blue: faqBlueCloud(
      "/images/figma/faq-wide-cloud-noise-native.webp",
      -637,
      4996,
      2502.102294921875,
      385,
      "matrix(1, 0, 0, 1, 0, 0)",
      {
        left: -50.359375,
        top: -30.839927673339844,
        width: 2552.461669921875,
        height: 465.0265808105469,
      },
    ),
  },
  front: {
    white: "/images/figma/rendered/cloud-31.webp",
    blueNodeId: "116:178",
    blue: faqBlueCloud(
      "/images/figma/faq-front-cloud-noise-native.webp",
      1912,
      5558,
      2502.102294921875,
      424,
      "matrix(-1, 0, 0, -1, 0, 0)",
      {
        left: -52.6796875,
        top: -25.04959487915039,
        width: 2554.781982421875,
        height: 498.8376159667969,
      },
      80,
    ),
  },
} as const satisfies Record<string, FaqCloudLayer>;

const artwork = {
  imgEllipse5: "/images/figma/rendered/ellipse-1.webp",
  imgEllipse6: "/images/figma/rendered/ellipse-6.webp",
  imgVector11: "/images/figma/vector-11.svg",
  imgLine2: "/images/figma/line-2.svg",
  imgLine3: "/images/figma/line-3.svg",
  imgGroup1363: "/images/figma/rendered/group-1363.webp",
  imgVector12: "/images/figma/vector-12.svg",
} as const;

export default artwork;
