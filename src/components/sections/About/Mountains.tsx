import { ArtworkImage } from "@/components/ui/Artwork";
import AboutStarsAscii from "./AboutStarsAscii";
import artwork from "./artwork";
import styles from "./Mountains.module.css";

export default function Mountains() {
  return (
    <div className={styles.mountains}>
      <div className={styles.farMountain} data-node-id="112:3">
        <ArtworkImage absolute src={artwork.mountainFar} />
      </div>
      <div className={styles.smallMountainStar} data-node-id="116:102">
        <div className={styles.smallMountainStarShape}>
          <div className={styles.smallMountainStarPaintBounds}>
            <ArtworkImage className={styles.mountainStarGradient} src={artwork.mountainStarGradient} />
          </div>
        </div>
        <AboutStarsAscii nodeId="116:102" className={styles.smallMountainStarAscii} />
      </div>
      <div className={styles.middleMountain} data-node-id="112:49">
        <ArtworkImage absolute src={artwork.mountainMiddle} />
      </div>
      <div className={styles.largeMountainStar} data-node-id="116:87">
        <div className={styles.largeMountainStarShape}>
          <div className={styles.largeMountainStarPaintBounds}>
            <ArtworkImage className={styles.mountainStarGradient} src={artwork.mountainStarGradient} />
          </div>
        </div>
        <AboutStarsAscii nodeId="116:87" className={styles.largeMountainStarAscii} />
      </div>
      <div className={styles.leftMountainStar} data-node-id="116:96">
        <div className={styles.leftMountainStarShape}>
          <div className={styles.leftMountainStarPaintBounds}>
            <ArtworkImage className={styles.mountainStarGradient} src={artwork.mountainStarGradient} />
          </div>
        </div>
        <AboutStarsAscii nodeId="116:96" className={styles.leftMountainStarAscii} />
      </div>
      <div className={styles.nearMountain} data-node-id="112:50">
        <ArtworkImage absolute src={artwork.mountainNear} />
      </div>
      <div className={styles.mountainForeground} data-node-id="112:51">
        <div className={styles.mountainForegroundPaintBounds}>
          <ArtworkImage src={artwork.mountain3Foreground} />
        </div>
      </div>
    </div>
  );
}
