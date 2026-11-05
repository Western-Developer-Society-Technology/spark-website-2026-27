// Static SVG filters are baked at 2× into lossless WebP to avoid raster work during scroll.
const artwork = {
  //orange shooting star
  "orangeStar": "/images/figma/rendered/orangeStar.png",
  // cloud 1
  "cloud1": "/images/figma/rendered/cloud-1.png",
  // cloud 2
  "cloud2": "/images/figma/rendered/cloud-2.png",
  // cloud 5
  "cloud5": "/images/figma/rendered/cloud-5.webp",
  //blue shooting star
  "blueStar": "/images/figma/rendered/blueStar.png",
  // yellow shooting star 
  "yellowStar": "/images/figma/rendered/yellowStar.png",
  // cloud 3
  "cloud3": "/images/figma/rendered/cloud-3.png",
  // red shooting star 
  "redStar": "/images/figma/rendered/redStar.png",
  // cloud 4
  "cloud4": "/images/figma/rendered/cloud-4.png",
  // last year label cloud (text composed in CSS)
  "lastYearCloud": "/images/figma/rendered/lastYearCloud.png",
} as const;

export default artwork;
