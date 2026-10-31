"use client";

import { ArtworkImage } from "@/components/ui/Artwork";
import ArtworkShader from "@/components/ui/Artwork/ArtworkShader";
import artwork from "./artwork";
import { cloudShader, farMountainShader, middleMountainShader, nearMountainShader } from "./shaders";
import styles from "./Mountains.module.css";

export default function Mountains() {
  return (
    <div className={styles.mountains}>
      <div className={styles.farMountain} data-node-id="112:3">
        <div className={styles.farMountainPaintBounds}>
          <ArtworkImage absolute src={artwork.imgVector15} />
        </div>
        {/* Native vector bounds preserve shader UVs; opaque fills cover exported interior shadows. */}
        <ArtworkShader mask={artwork.farMountainMask} shader={cloudShader} />
        <ArtworkShader mask={artwork.farMountainMask} shader={farMountainShader} />
        <ArtworkImage absolute src={artwork.farMountainStroke} />
      </div>
      <div className={styles.smallMountainStar} data-node-id="116:102">
        <div className={styles.smallMountainStarRotation}>
          <div className={styles.smallMountainStarShape}>
            <div className={styles.smallMountainStarPaintBounds}>
              <ArtworkImage src={artwork.imgGroup1357} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.middleMountain} data-node-id="112:49">
        <div className={styles.middleMountainPaintBounds}>
          <ArtworkImage absolute src={artwork.imgVector16} />
        </div>
        <ArtworkShader mask={artwork.middleMountainMask} shader={cloudShader} />
        <ArtworkShader mask={artwork.middleMountainMask} shader={middleMountainShader} />
        <ArtworkImage absolute src={artwork.middleMountainStroke} />
      </div>
      <div className={styles.largeMountainStar} data-node-id="116:87">
        <div className={styles.largeMountainStarRotation}>
          <div className={styles.largeMountainStarShape}>
            <div className={styles.largeMountainStarPaintBounds}>
              <ArtworkImage src={artwork.imgGroup1355} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.leftMountainStar} data-node-id="116:96">
        <div className={styles.largeMountainStarRotation}>
          <div className={styles.leftMountainStarShape}>
            <div className={styles.leftMountainStarPaintBounds}>
              <ArtworkImage src={artwork.imgGroup1356} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.nearMountain} data-node-id="112:50">
        <div className={styles.nearMountainPaintBounds}>
          <ArtworkImage absolute src={artwork.imgVector17} />
        </div>
        <ArtworkShader mask={artwork.nearMountainMask} shader={cloudShader} />
        <ArtworkShader mask={artwork.nearMountainMask} shader={nearMountainShader} />
        <ArtworkImage absolute src={artwork.nearMountainStroke} />
      </div>
      <div className={styles.mountainForeground} data-node-id="112:51">
        <div className={styles.mountainForegroundPaintBounds}>
          <ArtworkImage src={artwork.imgVector18} />
        </div>
      </div>
    </div>
  );
}
