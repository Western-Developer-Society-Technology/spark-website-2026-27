import { ArtworkImage, BlueCloudGroup, BlueCloudImage } from "@/components/ui/Artwork";
import AsciiArt from "@/components/ui/AsciiArt";
import artwork from "./artwork";
import nativeArtwork from "./native-artwork";
import { SHOOTING_STARS } from "./shooting-stars";
import styles from "./LastYear.module.css";

export default function LastYear() {
  return (
    <>
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
          <div className={styles.peachTrail} data-node-id="116:185">
            <div className={styles.peachTrailRotation}>
              <div className={styles.trailShape} data-name="ASCII Frame">
                <AsciiArt nodeId="116:186" />
              </div>
            </div>
          </div>
          <div className={styles.peachStar} data-node-id="116:187">
            <ArtworkImage absolute src={artwork.imgGroup1358} />
          </div>
        </div>
        <div className={styles.peachCloudBase} data-node-id="116:191" data-name="Cloud 1">
          <ArtworkImage src={artwork.imgCloud1} />
        </div>
        <div className={styles.smallCloudAccent} data-node-id="133:36">
          <div className={styles.flipped}>
            <div className={styles.smallCloudAccentShape}>
              <div className={styles.smallCloudAccentPaintBounds}>
                <ArtworkImage src={artwork.imgVector4} />
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.shootingStar} ${styles.blueShootingStar}`} data-node-id="116:201" data-name="Shooting star 3">
          <div className={styles.blueTrail} data-node-id="116:202">
            <div className={styles.blueTrailRotation}>
              <div className={styles.trailShape} data-name="ASCII Frame">
                <AsciiArt nodeId="116:203" />
              </div>
            </div>
          </div>
          <div className={styles.blueStar} data-node-id="116:204">
            <div className={styles.blueStarRotation}>
              <div className={styles.blueStarShape}>
                <ArtworkImage absolute src={artwork.imgGroup1359} />
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.shootingStar} ${styles.yellowShootingStar}`} data-node-id="116:208" data-name="Shooting star 2">
          <div className={styles.yellowTrail} data-node-id="116:209">
            <div className={styles.yellowTrailRotation}>
              <div className={styles.trailShape} data-name="ASCII Frame">
                <AsciiArt nodeId="116:210" />
              </div>
            </div>
          </div>
          <div className={styles.yellowStar} data-node-id="116:211">
            <div className={styles.yellowStarRotation}>
              <div className={styles.yellowStarShape}>
                <ArtworkImage absolute src={artwork.imgGroup1360} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.topRightCloud} data-node-id="116:223" data-name="Cloud 2">
          <ArtworkImage src={artwork.imgCloud2} />
        </div>
        <div className={styles.blueCloudGroup} data-node-id="116:215" data-name="Cloud 2">
          <div className={styles.blueCloudBase} data-node-id="116:216" data-name="Cloud">
            <div className={styles.blueCloudBasePaintBounds}>
              <ArtworkImage src={artwork.imgCloud} />
            </div>
          </div>
          <BlueCloudGroup nodeId="116:218" cloud={nativeArtwork["116:218"]} />
        </div>
        <div className={`${styles.shootingStar} ${styles.pinkShootingStar}`} data-node-id="116:231" data-name="Shooting star 4">
          <div className={styles.pinkTrail} data-node-id="116:232">
            <div className={styles.pinkTrailRotation}>
              <div className={styles.trailShape} data-name="ASCII Frame">
                <AsciiArt nodeId="116:233" />
              </div>
            </div>
          </div>
          <div className={styles.pinkStar} data-node-id="116:234">
            <div className={styles.pinkStarRotation}>
              <div className={styles.pinkStarShape}>
                <ArtworkImage absolute src={artwork.imgGroup1361} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.pinkCloudGroup} data-node-id="116:238" data-name="Cloud 4">
          <div className={styles.pinkCloudBase} data-node-id="116:239">
            <div className={styles.flipped}>
              <div className={styles.pinkCloudBaseShape} data-name="Cloud 4">
                <div className={styles.pinkCloudBasePaintBounds}>
                  <ArtworkImage src={artwork.imgCloud13} />
                </div>
              </div>
            </div>
          </div>
          <BlueCloudGroup nodeId="116:241" cloud={nativeArtwork["116:241"]} />
        </div>
        <div className={styles.lastYearGroup} data-node-id="116:246" data-name="last year">
          <div className={styles.lastYearGroup} data-node-id="116:247" data-name="cloud">
            <div className={styles.lastYearGroup} data-node-id="116:248" data-name="Cloud 4">
              <div className={styles.lastYearCloudBase} data-node-id="116:249">
                <div className={styles.flipped}>
                  <div className={styles.lastYearCloudBaseShape} data-name="Cloud 4">
                    <div className={styles.lastYearCloudBasePaintBounds}>
                      <ArtworkImage src={artwork.imgCloud16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.lastYearGroup} data-node-id="116:251" data-name="Mask group">
              <div className={styles.lastYearCloudMaskFrame} data-node-id="116:255">
                <div className={styles.flipped}>
                  <div className={styles.lastYearCloudMaskFrameMask} style={{ maskImage: `url("${artwork.imgCloud17}")` }} data-name="Cloud 4">
                    <div className={styles.lastYearCloudMaskFramePaintBounds}>
                      <ArtworkImage src={artwork.imgCloud18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    </>
  );
}
