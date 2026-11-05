import { useId } from "react";
import { ArtworkImage } from "@/components/ui/Artwork";
import AsciiArt from "@/components/ui/AsciiArt";
import artwork from "./artwork";
import StarCharacter from "./StarCharacter";
import { SPLASH_DROPLETS } from "./water-splashes";
import { SPLASH_ART, SPLASH_CELLS, SPLASH_COLORS, splashGlyph } from "./water-splash-art";
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
                <ArtworkImage loading="lazy" src={artwork.imgVector11} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.orangeSparklerGroup} data-node-id="116:158">
          <div className={styles.orangeSparklerStem} data-node-id="116:159">
            <div className={styles.orangeSparklerStemRotation}>
              <div className={styles.orangeSparklerStemShape}>
                <div className={styles.orangeSparklerStemPaintBounds}>
                  <ArtworkImage loading="lazy" src={artwork.imgLine2} />
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
                  <ArtworkImage loading="lazy" src={artwork.imgLine3} />
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
              <ArtworkImage loading="lazy" absolute src={artwork.sparkcharacter} />
            </div>  
          </div>
        </div>
        <div className={styles.boatOar} data-node-id="116:170">
          <div className={styles.boatHullRotation}>
            <div className={styles.boatOarShape}>
              <div className={styles.boatOarPaintBounds}>
                <ArtworkImage loading="lazy" src={artwork.imgVector12} />
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
              <StarCharacter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StarSplashes() {
  const splashId = useId();
  return (
    <div className={styles.splashViewport}>
      <div className={styles.starSplashes} aria-hidden="true">
        {SPLASH_DROPLETS.map((droplet) => (
          <span
            key={droplet.id}
            className={styles.splashDroplet}
            data-animation={`water-splash-${droplet.id}`}
            style={{
              left: `calc(${droplet.x} * var(--u))`,
              top: `calc(${droplet.y} * var(--u))`,
              width: `calc(${droplet.height * SPLASH_ART.aspect} * var(--u))`,
              height: `calc(${droplet.height} * var(--u))`,
            }}
          >
            <svg
              className={styles.splashArt}
              viewBox={`0 0 ${SPLASH_ART.width} ${SPLASH_ART.height}`}
              preserveAspectRatio="none"
              focusable="false"
              style={{ transform: droplet.mirror ? "scaleX(-1)" : undefined }}
            >
              <defs>
                <radialGradient
                  id={`${splashId}-${droplet.id}-water`}
                  gradientUnits="userSpaceOnUse"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientTransform={`translate(${SPLASH_ART.width / 2} ${SPLASH_ART.height / 2}) scale(${SPLASH_ART.width / 2} ${SPLASH_ART.height / 2})`}
                  colorInterpolation="sRGB"
                >
                  <stop offset="0" stopColor={SPLASH_COLORS.center} />
                  <stop offset="0.45" stopColor={SPLASH_COLORS.center} />
                  <stop offset="1" stopColor={SPLASH_COLORS.edge} />
                </radialGradient>
              </defs>
              <g fill={`url(#${splashId}-${droplet.id}-water)`}>
                {Array.from({ length: SPLASH_ART.rows }, (_, index) => (
                  <text
                    key={index}
                    className={styles.splashRow}
                    data-splash-row=""
                    x="0"
                    y={index * SPLASH_ART.lineHeight + SPLASH_ART.baseline}
                    fontSize={SPLASH_ART.fontSize}
                    xmlSpace="preserve"
                  >
                    {SPLASH_CELLS.filter((cell) => cell.row === index).map((cell) => (
                      <tspan
                        key={cell.column}
                        data-splash-cell=""
                        x={cell.column * SPLASH_ART.width / SPLASH_ART.columns}
                      >
                        {splashGlyph(cell, droplet.variant, 0)}
                      </tspan>
                    ))}
                  </text>
                ))}
              </g>
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
