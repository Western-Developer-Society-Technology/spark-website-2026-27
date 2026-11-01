import { ArtworkImage, NativeGroup } from "@/components/ui/Artwork";
import artwork from "./artwork";
import FaqPanel from "./FaqPanel";
import nativeArtwork from "./native-artwork";
import { Boat, FloatingStar } from "./Water";
import styles from "./Faq.module.css";

export default function Faq() {
  return (
    <div className={styles.faqStage}>
      <div className={styles.faqSceneryLayer}>
        <div className={styles.faqBackdrop} data-node-id="116:109" />
        <div className={styles.faqHalo} data-node-id="116:110">
          <div className={styles.faqHaloRotation}>
            <div className={styles.faqHaloShape}>
              <div className={styles.faqHaloPaintBounds}>
                <ArtworkImage src={artwork.imgEllipse5} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.faqGlow} data-node-id="116:111">
          <div className={styles.faqGlowPaintBounds}>
            <ArtworkImage src={artwork.imgEllipse6} />
          </div>
        </div>
      </div>
      <FaqPanel />
      <div className={styles.faqSceneryLayer}>
        <div className={styles.waterMotionRegion} data-motion-region="water" aria-hidden="true" />
        <div className={styles.faqScene} data-node-id="133:30">
          <div className={styles.faqGround} data-node-id="116:123" />
          <div className={styles.faqLeftCloud} data-node-id="116:124" data-name="Cloud 2">
            <div className={styles.faqLeftCloudBase} data-node-id="116:125" data-name="Cloud">
              <div className={styles.faqLeftCloudBasePaintBounds}>
                <ArtworkImage src={artwork.imgCloud19} />
              </div>
            </div>
            <NativeGroup nodeId="116:127" artwork={nativeArtwork["116:127"]} />
          </div>
          <div className={styles.faqRightCloud} data-node-id="116:132" data-name="Cloud 4">
            <div className={styles.faqRightCloudBase} data-node-id="116:133" data-name="Cloud">
              <div className={styles.faqRightCloudBasePaintBounds}>
                <ArtworkImage src={artwork.imgCloud22} />
              </div>
            </div>
            <NativeGroup nodeId="116:135" artwork={nativeArtwork["116:135"]} />
          </div>
          <div className={styles.faqMiddleCloud} data-node-id="116:140" data-name="Cloud 5">
            <div className={styles.faqMiddleCloudBase} data-node-id="116:141">
              <div className={styles.flipped}>
                <div className={styles.faqMiddleCloudBaseShape} data-name="Cloud">
                  <div className={styles.faqMiddleCloudBasePaintBounds}>
                    <ArtworkImage src={artwork.imgCloud25} />
                  </div>
                </div>
              </div>
            </div>
            <NativeGroup nodeId="116:143" artwork={nativeArtwork["116:143"]} />
          </div>
          <div className={styles.faqWideCloud} data-node-id="116:148" data-name="Cloud 3">
            <div className={styles.faqWideCloudBase} data-node-id="116:149" data-name="Cloud">
              <div className={styles.faqWideCloudBasePaintBounds}>
                <ArtworkImage src={artwork.imgCloud28} />
              </div>
            </div>
            <NativeGroup nodeId="116:151" artwork={nativeArtwork["116:151"]} />
          </div>
          <Boat />
          <FloatingStar />
          <div className={styles.faqFrontCloud} data-node-id="116:175" data-name="Cloud 7">
            <div className={styles.faqFrontCloudBase} data-node-id="116:176">
              <div className={styles.faqFrontCloudBaseRotation}>
                <div className={styles.faqFrontCloudBaseShape} data-name="Cloud">
                  <div className={styles.faqFrontCloudBasePaintBounds}>
                    <ArtworkImage src={artwork.imgCloud31} />
                  </div>
                </div>
              </div>
            </div>
            <NativeGroup nodeId="116:178" artwork={nativeArtwork["116:178"]} />
          </div>
        </div>
      </div>
    </div>
  );
}
