import { ArtworkImage } from "@/components/ui/Artwork";
import AsciiArt from "@/components/ui/AsciiArt";
import artwork from "./artwork";
import styles from "./Water.module.css";

// Selectors in water-motion.ts animate the data-animation wrappers.
export function Boat() {
  return (
    <div className={styles.boatDrift} data-animation="boat-drift">
      <div className={styles.boatGroup} data-node-id="116:156" data-animation="boat">
        <div className={styles.boatHull} data-node-id="116:157">
          <div className={styles.boatHullRotation}>
            <div className={styles.boatHullShape}>
              <div className={styles.boatHullPaintBounds}>
                <ArtworkImage src={artwork.imgVector11} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.orangeSparklerGroup} data-node-id="116:158">
          <div className={styles.orangeSparklerStem} data-node-id="116:159">
            <div className={styles.orangeSparklerStemRotation}>
              <div className={styles.orangeSparklerStemShape}>
                <div className={styles.orangeSparklerStemPaintBounds}>
                  <ArtworkImage src={artwork.imgLine2} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.orangeSparkler} data-node-id="116:160">
            <div className={styles.orangeSparklerRotation}>
              <div className={styles.orangeSparklerShape} data-name="ASCII Frame">
                <AsciiArt nodeId="116:161" />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.purpleSparklerGroup} data-node-id="116:162">
          <div className={styles.purpleSparklerStem} data-node-id="116:163">
            <div className={styles.purpleSparklerStemRotation}>
              <div className={styles.purpleSparklerStemShape}>
                <div className={styles.purpleSparklerStemPaintBounds}>
                  <ArtworkImage src={artwork.imgLine3} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.purpleSparkler} data-node-id="116:164">
            <div className={styles.purpleSparklerRotation}>
              <div className={styles.purpleSparklerShape} data-name="ASCII Frame">
                <AsciiArt nodeId="116:165" />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.boatCharacter} data-node-id="116:166">
          <div className={styles.boatCharacterRotation}>
            <div className={styles.boatCharacterShape}>
              <ArtworkImage absolute src={artwork.imgGroup1363} />
            </div>
          </div>
        </div>
        <div className={styles.boatOar} data-node-id="116:170">
          <div className={styles.boatHullRotation}>
            <div className={styles.boatOarShape}>
              <div className={styles.boatOarPaintBounds}>
                <ArtworkImage src={artwork.imgVector12} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FloatingStar() {
  return (
    <div className={styles.floatingYellowStarWaterViewport}>
      <div className={styles.floatingYellowStar} data-node-id="116:171" data-animation="yellow-star">
        <div className={styles.floatingYellowStarBody} data-animation="yellow-star-balance">
          <div className={styles.floatingYellowStarRotation}>
            <div className={styles.boatCharacterShape}>
              <ArtworkImage absolute src={artwork.imgGroup1364} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
