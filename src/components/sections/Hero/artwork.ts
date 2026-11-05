// Static SVG filters are baked at 2× into lossless WebP to avoid raster work during scroll.
export { default as heroImages } from "./image-variants.json";
const artwork = {
  "imgEllipse1": "/images/figma/rendered/ellipse-1.webp",
  "imgEllipse2": "/images/figma/rendered/ellipse-2.webp",
  "imgEllipse4": "/images/figma/rendered/ellipse-4.webp",
  "imgEllipse3": "/images/figma/rendered/ellipse-3.webp",
  "glare": "/images/figma/rendered/group-1352.webp",
  "sparkcharacter": "/images/figma/rendered/sparkcharacter.webp"
} as const;

export default artwork;
