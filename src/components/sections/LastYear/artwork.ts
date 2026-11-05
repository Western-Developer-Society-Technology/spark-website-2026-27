// Static SVG filters are baked at 2× into lossless WebP to avoid raster work during scroll.
const artwork = {
  //orange shooting star
  "orangeStar": "/images/optimized/figma/rendered/orangeStar.webp",
  // cloud 1
  "cloud1": "/images/optimized/figma/rendered/cloud-1.webp",
  // cloud 2
  "cloud2": "/images/optimized/figma/rendered/cloud-2.webp",
  // cloud 5
  "cloud5": "/images/figma/rendered/cloud-5.webp",
  //blue shooting star
  "blueStar": "/images/optimized/figma/rendered/blueStar.webp",
  // yellow shooting star 
  "yellowStar": "/images/optimized/figma/rendered/yellowStar.webp",
  // cloud 3
  "cloud3": "/images/optimized/figma/rendered/cloud-3.webp",
  // red shooting star 
  "redStar": "/images/optimized/figma/rendered/redStar.webp",
  // cloud 4
  "cloud4": "/images/optimized/figma/rendered/cloud-4.webp",
  // last year label cloud (text composed in CSS)
  "lastYearCloud": "/images/optimized/figma/rendered/lastYearCloud.webp",
} as const;

export default artwork;
