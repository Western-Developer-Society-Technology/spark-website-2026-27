import type { BlueCloud } from "@/components/ui/Artwork";

// Exact local render bounds and transforms from the Figma native-effect exports.
// Lossless WebP retains every decoded RGBA channel, including fully transparent pixels.
const nativeArtwork = {
  "133:2": {
    "src": "/images/figma/tall-left-cloud-native.png",
    "left": -21,
    "top": 2291,
    "width": 1151,
    "height": 1935,
    "transform": "matrix(1, 0, 0, 1, 0, 0)",
    "paintBounds": {
      "left": -188.611328125,
      "top": -174.23080444335938,
      "width": 1521.578125,
      "height": 2287.06103515625
    }
  },
  "133:8": {
    "src": "/images/figma/upper-right-cloud-native.png",
    "left": 1525,
    "top": 2310,
    "width": 928,
    "height": 841,
    "transform": "matrix(-1, 0, 0, 1, 0, 0)",
    "paintBounds": {
      "left": -251.53125,
      "top": -240.8671112060547,
      "width": 1425.6015625,
      "height": 1315.6162109375
    }
  },
  "133:24": {
    "src": "/images/figma/lower-right-cloud-native.png",
    "left": 1647,
    "top": 3230,
    "width": 1096,
    "height": 1597,
    "transform": "matrix(-1, 0, 0, 1, 0, 0)",
    "paintBounds": {
      "left": -250.59765625,
      "top": -234.14617919921875,
      "width": 1593.02734375,
      "height": 2066.181396484375
    }
  },
  "134:58": {
    "src": "/images/figma/lower-left-cloud-native.png",
    "left": -76,
    "top": 3853,
    "width": 960.99951171875,
    "height": 1004.0000610351562,
    "transform": "matrix(1, 0, 0, 1, 0, 0)",
    "paintBounds": {
      "left": -251.25,
      "top": -231.45948791503906,
      "width": 1455.68359375,
      "height": 1471.697998046875
    }
  },
  "133:31": {
    "src": "/images/figma/middle-left-cloud-native.png",
    "left": -104,
    "top": 2814,
    "width": 960.99951171875,
    "height": 940.9999389648438,
    "transform": "matrix(1, 0, 0, 1, 0, 0)",
    "paintBounds": {
      "left": -251.4453125,
      "top": -232.7565155029297,
      "width": 1454.9140625,
      "height": 1408.765625
    }
  }
} as const satisfies Record<string, BlueCloud>;

export default nativeArtwork;
