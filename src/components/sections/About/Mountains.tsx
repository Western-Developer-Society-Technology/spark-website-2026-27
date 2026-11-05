import { ArtworkImage } from "@/components/ui/Artwork";
import AboutStarsAscii from "./AboutStarsAscii";
import artwork from "./artwork";
import styles from "./Mountains.module.css";

export default function Mountains() {
  return (
    <div className={styles.mountains}>
      <div className={styles.farMountain} data-node-id="112:3">
        <ArtworkImage fetchPriority="low" absolute src={artwork.mountainFar} />
      </div>
      <div className={styles.smallMountainStar} data-node-id="116:102">
        <div className={styles.smallMountainStarRotation}>
          <div className={styles.smallMountainStarShape}>
            <div className={styles.smallMountainStarPaintBounds}>
              <ArtworkImage fetchPriority="low" src={artwork.imgGroup1357} />
            </div>
          </div>
        </div>
        <AboutStarsAscii nodeId="116:102" className={styles.smallMountainStarAscii} />
      </div>
      <div className={styles.middleMountain} data-node-id="112:49">
        <ArtworkImage fetchPriority="low" absolute src={artwork.mountainMiddle} />
      </div>
      <div className={styles.largeMountainStar} data-node-id="116:87">
        <div className={styles.largeMountainStarRotation}>
          <div className={styles.largeMountainStarShape}>
            <div className={styles.largeMountainStarPaintBounds}>
              <ArtworkImage fetchPriority="low" src={artwork.imgGroup1355} />
            </div>
          </div>
        </div>
        <AboutStarsAscii nodeId="116:87" className={styles.largeMountainStarAscii} />
      </div>
      <div className={styles.leftMountainStar} data-node-id="116:96">
        <div className={styles.largeMountainStarRotation}>
          <div className={styles.leftMountainStarShape}>
            <div className={styles.leftMountainStarPaintBounds}>
              <ArtworkImage fetchPriority="low" src={artwork.imgGroup1356} />
            </div>
          </div>
        </div>
        <AboutStarsAscii nodeId="116:96" className={styles.leftMountainStarAscii} />
      </div>
      <div className={styles.nearMountain} data-node-id="112:50">
        <ArtworkImage fetchPriority="low" absolute src={artwork.mountainNear} />
      </div>
      <div className={styles.mountainForeground} data-node-id="112:51">
        <div className={styles.mountainForegroundPaintBounds}>
          <ArtworkImage fetchPriority="low" src={artwork.mountain3Foreground} />
        </div>
      </div>
    </div>
  );
}
