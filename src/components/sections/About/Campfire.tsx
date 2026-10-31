"use client";

import { ArtworkImage } from "@/components/ui/Artwork";
import ArtworkShader from "@/components/ui/Artwork/ArtworkShader";
import AsciiArt from "@/components/ui/AsciiArt";
import artwork from "./artwork";
import { campfireLogShader } from "./shaders";
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
      <div className={styles.campfireLeftLog} data-node-id="116:261">
        <ArtworkShader mask={artwork.campfireLeftLogMask} shader={campfireLogShader} />
        <div className={styles.campfireLeftLogPaintBounds}>
          <ArtworkImage absolute src={artwork.imgVector19} />
        </div>
      </div>
      <div className={styles.campfireRightLog} data-node-id="121:40">
        <div className={styles.flipped}>
          <div className={styles.campfireRightLogShape}>
            <ArtworkShader mask={artwork.campfireRightLogMask} shader={campfireLogShader} />
            <div className={styles.campfireLeftLogPaintBounds}>
              <ArtworkImage absolute src={artwork.imgVector20} />
            </div>
          </div>
        </div>
      </div>
      {/* The original dense flames extend over the wood with an uneven underside. */}
      <div className={styles.campfireFlames}>
        <div className={styles.campfireSmallFlame} data-node-id="121:74" data-name="ASCII Frame">
          <AsciiArt nodeId="121:75" />
        </div>
        <div className={styles.campfireLargeFlame} data-node-id="121:54" data-name="ASCII Frame">
          <AsciiArt nodeId="121:55" />
        </div>
        <div className={styles.campfireLargeFlame} data-node-id="121:57" data-name="ASCII Frame">
          <AsciiArt nodeId="121:58" />
        </div>
        <div className={styles.campfireSmallFlame} data-node-id="121:61" data-name="ASCII Frame">
          <AsciiArt nodeId="121:62" />
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
