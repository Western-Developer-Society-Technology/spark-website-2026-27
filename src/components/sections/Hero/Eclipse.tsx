import type { ReactNode } from "react";
import { ArtworkImage } from "@/components/ui/Artwork";
import artwork from "./artwork";
import styles from "./Eclipse.module.css";

/** `children` (the wordmark) rises between the halo and the outer ring. */
export default function Eclipse({ children }: { children: ReactNode }) {
  return (
    <div className={styles.eclipseGroup} data-node-id="111:94">
      <div className={styles.eclipseHalo} data-node-id="111:95">
        <div className={styles.eclipseHaloPaintBounds}>
          <ArtworkImage src={artwork.imgEllipse1} />
        </div>
      </div>
      {children}
      <div className={styles.eclipseOuterRing} data-node-id="111:97">
        <div className={styles.eclipseOuterRingPaintBounds}>
          <ArtworkImage src={artwork.imgEllipse2} />
        </div>
      </div>
      <div className={styles.eclipseInnerGlow} data-node-id="111:98">
        <div className={styles.eclipseInnerGlowPaintBounds}>
          <ArtworkImage src={artwork.imgEllipse4} />
        </div>
      </div>
      <div className={styles.eclipseCore} data-node-id="111:99">
        <div className={styles.eclipseCorePaintBounds}>
          <ArtworkImage src={artwork.imgEllipse3} />
        </div>
      </div>
      <div className={styles.eclipseStar} data-node-id="111:100">
        <ArtworkImage absolute src={artwork.imgGroup1352} />
      </div>
    </div>
  );
}
