import { ArtworkImage } from "@/components/ui/Artwork";
import artwork, { heroImages } from "./artwork";
import styles from "./Eclipse.module.css";

export default function Eclipse() {
  return (
    <div className={styles.eclipseGroup} data-node-id="111:94">
      <div className={styles.eclipseHalo} data-node-id="111:95">
        <div className={styles.eclipseHaloPaintBounds}>
          <ArtworkImage src={artwork.imgEllipse1} {...heroImages.imgEllipse1} loading="eager" fetchPriority="high" />
        </div>
      </div>
      <div className={styles.eclipseOuterRing} data-node-id="111:97">
        <div className={styles.eclipseOuterRingPaintBounds}>
          <ArtworkImage src={artwork.imgEllipse2} {...heroImages.imgEllipse2} loading="eager" fetchPriority="low" />
        </div>
      </div>
      <div className={styles.eclipseInnerGlow} data-node-id="111:98">
        <div className={styles.eclipseInnerGlowPaintBounds}>
          <ArtworkImage src={artwork.imgEllipse4} {...heroImages.imgEllipse4} loading="eager" fetchPriority="low" />
        </div>
      </div>
      <div className={styles.eclipseCore} data-node-id="111:99">
        <div className={styles.eclipseCorePaintBounds}>
          <ArtworkImage src={artwork.imgEllipse3} {...heroImages.imgEllipse3} loading="eager" fetchPriority="low" />
        </div>
      </div>
      <div className={styles.eclipseStar} data-node-id="111:100">
        <ArtworkImage absolute src={artwork.glare} {...heroImages.glare} loading="eager" fetchPriority="low" />
      </div>
    </div>
  );
}
