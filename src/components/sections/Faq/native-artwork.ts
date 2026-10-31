import type { NativeArtwork } from "@/components/ui/Artwork";

// Exact local render bounds and transforms from the Figma native-effect exports.
// Lossless WebP retains every decoded RGBA channel, including fully transparent pixels.
const nativeArtwork = {
  "116:127": {
    "src": "/images/figma/faq-left-cloud-noise-native.webp",
    "left": -246,
    "top": 5020,
    "width": 854.5458374023438,
    "height": 377.1863708496094,
    "transform": "matrix(1, 0, 0, 1, 0, 0)",
    "paintBounds": {
      "left": -48.62109375,
      "top": -32,
      "width": 941.66015625,
      "height": 455.6551208496094
    }
  },
  "116:135": {
    "src": "/images/figma/faq-right-cloud-noise-native.webp",
    "left": 852,
    "top": 4990,
    "width": 854.5458374023438,
    "height": 412.1863708496094,
    "transform": "matrix(1, 0, 0, 1, 0, 0)",
    "paintBounds": {
      "left": -52.5625,
      "top": -26.8037109375,
      "width": 942.7109375,
      "height": 485.62933349609375
    }
  },
  "116:143": {
    "src": "/images/figma/faq-middle-cloud-noise-native.webp",
    "left": 1139,
    "top": 5002,
    "width": 814.8455810546875,
    "height": 377.1863708496094,
    "transform": "matrix(-1, 0, 0, 1, 0, 0)",
    "paintBounds": {
      "left": -49.3046875,
      "top": -32,
      "width": 896.6171875,
      "height": 456.44586181640625
    }
  },
  "116:151": {
    "src": "/images/figma/faq-wide-cloud-noise-native.webp",
    "left": -637,
    "top": 5058,
    "width": 2502.102294921875,
    "height": 385,
    "transform": "matrix(1, 0, 0, 1, 0, 0)",
    "paintBounds": {
      "left": -50.359375,
      "top": -30.839927673339844,
      "width": 2552.461669921875,
      "height": 465.0265808105469
    }
  },
  "116:178": {
    "src": "/images/figma/faq-front-cloud-noise-native.webp",
    "left": 1912,
    "top": 5620,
    "width": 2502.102294921875,
    "height": 424,
    "transform": "matrix(-1, 0, 0, -1, 0, 0)",
    "paintBounds": {
      "left": -52.6796875,
      "top": -25.04959487915039,
      "width": 2554.781982421875,
      "height": 498.8376159667969
    }
  }
} as const satisfies Record<string, NativeArtwork>;

export default nativeArtwork;
