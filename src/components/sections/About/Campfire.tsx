"use client";

import { ArtworkImage } from "@/components/ui/Artwork";
import AsciiArt from "@/components/ui/AsciiArt";
import artwork from "./artwork";
import styles from "./Campfire.module.css";

export default function Campfire() {
  return (
    <div className={styles.campfireGroup} data-node-id="121:63">
      <div className={styles.campfireLeftCharacter} data-node-id="121:45">
        <div className={styles.campfireLeftCharacterRotation}>
          <div className={styles.campfireLeftCharacterShape}>
            <ArtworkImage absolute src={artwork.imgGroup1366} />
          </div>
        </div>
      </div>
      <div className={styles.campfireWood} data-node-id="116:261">
        <ArtworkImage absolute src={artwork.campfireWood} />
      </div>
      {/* The original dense flames extend over the wood with an uneven underside. */}
      <div className={styles.campfireFlames}>
        <div className={styles.campfireLargeFlame} data-node-id="121:54" data-name="ASCII Frame">
          <AsciiArt nodeId="121:55" />
        </div>
      </div>
      <div className={styles.campfireRightCharacter} data-node-id="121:41">
        <div className={styles.campfireRightCharacterRotation}>
          <div className={styles.campfireRightCharacterShape}>
            <ArtworkImage absolute src={artwork.imgGroup1365} />
          </div>
        </div>
      </div>
      <div className={styles.campfireFrontCharacter} data-node-id="121:50">
        <div className={styles.campfireFrontCharacterRotation}>
          <div className={styles.campfireFrontCharacterShape}>
            <ArtworkImage absolute src={artwork.imgGroup1367} />
          </div>
        </div>
      </div>
    </div>
  );
}
