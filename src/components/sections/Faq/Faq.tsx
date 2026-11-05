import { ArtworkImage, BlueCloudGroup } from "@/components/ui/Artwork";
import artwork, { faqClouds } from "./artwork";
import FaqPanel from "./FaqPanel";
import { Boat, FloatingStar, StarSplashes } from "./Water";
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
      </div>
      <FaqPanel />
      <div className={styles.faqSceneryLayer}>
        <div className={styles.waterMotionRegion} data-motion-region="water" aria-hidden="true" />
        <div className={styles.faqScene} data-node-id="133:30">
          <div className={styles.faqGround} data-node-id="116:123" />
          <div className={styles.faqLeftCloud} data-node-id="116:124" data-name="Cloud 2">
            <div className={styles.faqLeftCloudBase} data-node-id="116:125" data-name="Cloud">
              <div className={styles.faqLeftCloudBasePaintBounds}>
                <ArtworkImage src={faqClouds.left.white} />
              </div>
            </div>
            <BlueCloudGroup nodeId={faqClouds.left.blueNodeId} cloud={faqClouds.left.blue} />
          </div>
          <div className={styles.faqRightCloud} data-node-id="116:132" data-name="Cloud 4">
            <div className={styles.faqRightCloudBase} data-node-id="116:133" data-name="Cloud">
              <div className={styles.faqRightCloudBasePaintBounds}>
                <ArtworkImage src={faqClouds.right.white} />
              </div>
            </div>
            <BlueCloudGroup nodeId={faqClouds.right.blueNodeId} cloud={faqClouds.right.blue} />
          </div>
          <div className={styles.faqMiddleCloud} data-node-id="116:140" data-name="Cloud 5">
            <div className={styles.faqMiddleCloudBase} data-node-id="116:141">
              <div className={styles.flipped}>
                <div className={styles.faqMiddleCloudBaseShape} data-name="Cloud">
                  <div className={styles.faqMiddleCloudBasePaintBounds}>
                    <ArtworkImage src={faqClouds.middle.white} />
                  </div>
                </div>
              </div>
            </div>
            <BlueCloudGroup nodeId={faqClouds.middle.blueNodeId} cloud={faqClouds.middle.blue} />
          </div>
          <div className={styles.faqWideCloud} data-node-id="116:148" data-name="Cloud 3">
            <div className={styles.faqWideCloudBase} data-node-id="116:149" data-name="Cloud">
              <div className={styles.faqWideCloudBasePaintBounds}>
                <ArtworkImage src={faqClouds.wide.white} />
              </div>
            </div>
            <BlueCloudGroup nodeId={faqClouds.wide.blueNodeId} cloud={faqClouds.wide.blue} />
          </div>
          <Boat />
          <FloatingStar />
          <div className={styles.faqFrontCloud} data-node-id="116:175" data-name="Cloud 7">
            <div className={styles.faqFrontCloudBase} data-node-id="116:176">
              <div className={styles.faqFrontCloudBaseRotation}>
                <div className={styles.faqFrontCloudBaseShape} data-name="Cloud">
                  <div className={styles.faqFrontCloudBasePaintBounds}>
                    <ArtworkImage src={faqClouds.front.white} />
                  </div>
                </div>
              </div>
            </div>
            <BlueCloudGroup nodeId={faqClouds.front.blueNodeId} cloud={faqClouds.front.blue} />
          </div>
          <StarSplashes />
        </div>
      </div>
    </div>
  );
}
