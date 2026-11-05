import { ArtworkImage, BlueCloudGroup, BlueCloudImage } from "@/components/ui/Artwork";
import artwork from "./artwork";
import nativeArtwork from "./native-artwork";
import { SHOOTING_STARS } from "./shooting-stars";
import ShootingStarTrailAscii from "./ShootingStarTrailAscii";
import { SHOOTING_STAR_TRAIL_COLORS } from "./trail-colors";
import ShootingStarBadge from "./ShootingStarBadge";
import { STAR_BADGE_CONFIG } from "./shooting-star-badges";
import styles from "./LastYear.module.css";

export default function LastYear() {
  return (
    <div className={styles.lastYearStage}>
      <div className={styles.lastYearScene}>
      <div
        className={styles.cloudBackground}
        data-node-id="133:18"
        style={{ backgroundImage: "linear-gradient(-5.684341886080802e-14deg, rgb(10, 10, 10) 0%, rgb(33, 15, 6) 15.865%, rgb(33, 15, 6) 83.654%, rgb(18, 19, 21) 100%)" }}
      />
      <div className={styles.cloudSection} data-node-id="116:183" data-name="cloud section">
        <div className={styles.tallLeftCloud} data-node-id="133:2" data-name="Cloud 8">
          <BlueCloudImage cloud={nativeArtwork["133:2"]} />
        </div>
        <div className={styles.upperRightCloud} data-node-id="133:8">
          <div className={styles.flipped}>
            <div className={styles.upperRightCloudShape} data-name="Cloud 9">
              <BlueCloudImage cloud={nativeArtwork["133:8"]} />
            </div>
          </div>
        </div>
        <div className={styles.lowerRightCloud} data-node-id="133:24">
          <div className={styles.flipped}>
            <div className={styles.lowerRightCloudShape} data-name="Cloud 9">
              <BlueCloudImage cloud={nativeArtwork["133:24"]} />
            </div>
          </div>
        </div>
        <div className={styles.lowerLeftCloud} data-node-id="134:58" data-name="Cloud 11">
          <BlueCloudImage cloud={nativeArtwork["134:58"]} />
        </div>
        <div className={styles.middleLeftCloud} data-node-id="133:31" data-name="Cloud 10">
          <BlueCloudImage cloud={nativeArtwork["133:31"]} />
        </div>
        <div className={styles.lastYearBand}>
          {SHOOTING_STARS.map((star) => (
            <div
              key={star.id}
              className={styles.starTrigger}
              data-star-trigger={star.id}
              aria-hidden="true"
              style={{
                left: `calc(${star.left} * var(--u))`,
                top: `calc(${star.top} * var(--u))`,
                width: `calc(${star.width} * var(--u))`,
                height: `calc(${star.height} * var(--u))`,
              }}
            />
          ))}
        <div className={`${styles.shootingStar} ${styles.peachShootingStar}`} data-node-id="116:184" data-name="Shooting star 1">
          <ShootingStarTrailAscii color={SHOOTING_STAR_TRAIL_COLORS.peach} starId="peach" />
          <div className={styles.peachStar} data-node-id="116:187" data-star-head>
            <ShootingStarBadge src={artwork.orangeStar} config={STAR_BADGE_CONFIG.peach} />
          </div>
        </div>
        <div className={styles.peachCloudBase} data-node-id="116:191" data-name="Cloud 1">
          <ArtworkImage src={artwork.cloud1} />
        </div>
        <div className={styles.smallCloudAccent} data-node-id="133:36">
          <div className={styles.flipped}>
            <div className={styles.smallCloudAccentShape}>
              <div className={styles.smallCloudAccentPaintBounds}>
                <ArtworkImage src={artwork.cloud5} />
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.shootingStar} ${styles.blueShootingStar}`} data-node-id="116:201" data-name="Shooting star 3">
          <ShootingStarTrailAscii color={SHOOTING_STAR_TRAIL_COLORS.blue} starId="blue" />
          <div className={styles.blueStar} data-node-id="116:204" data-star-head>
            <div className={styles.blueStarRotation}>
              <div className={styles.blueStarShape}>
                <ShootingStarBadge src={artwork.blueStar} config={STAR_BADGE_CONFIG.blue} />
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.shootingStar} ${styles.yellowShootingStar}`} data-node-id="116:208" data-name="Shooting star 2">
          <ShootingStarTrailAscii color={SHOOTING_STAR_TRAIL_COLORS.yellow} starId="yellow" />
          <div className={styles.yellowStar} data-node-id="116:211" data-star-head>
            <div className={styles.yellowStarRotation}>
              <div className={styles.yellowStarShape}>
                <ShootingStarBadge src={artwork.yellowStar} config={STAR_BADGE_CONFIG.yellow} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.topRightCloud} data-node-id="116:223" data-name="Cloud 2">
          <ArtworkImage src={artwork.cloud2} />
        </div>
        <div className={styles.blueCloudBase} data-node-id="116:215" data-name="Cloud 3">
        <ArtworkImage src={artwork.cloud3} />
        </div>
        <div className={`${styles.shootingStar} ${styles.pinkShootingStar}`} data-node-id="116:231" data-name="Shooting star 4">
          <ShootingStarTrailAscii color={SHOOTING_STAR_TRAIL_COLORS.pink} starId="pink" />
          <div className={styles.pinkStar} data-node-id="116:234" data-star-head>
            <div className={styles.pinkStarRotation}>
              <div className={styles.pinkStarShape}>
                <ShootingStarBadge src={artwork.redStar} config={STAR_BADGE_CONFIG.pink} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.pinkCloudBase} data-node-id="116:238" data-name="Cloud 4">
          <ArtworkImage src={artwork.cloud4} />
        </div>
        <div className={styles.lastYearLabel} data-node-id="116:246" data-name="last year">
          <ArtworkImage src={artwork.lastYearCloud} />
          <section aria-label="Last year at Spark" className={styles.lastYear}>
            <h2 data-node-id="116:257">Last year...</h2>
            <ul className={styles.srOnly}>
              <li>110+ hackers</li>
              <li>25+ projects</li>
              <li>36 hours</li>
              <li>$1k+ in prizes</li>
            </ul>
          </section>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
