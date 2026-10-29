"use client";

import type { ReactNode } from "react";
/* eslint-disable @next/next/no-img-element -- Figma artwork keeps its original SVG bounds. */
import { ShaderFill } from "@/lib/custom-effect-runtime";
import artwork from "./artworkAssets";
import nativeArtwork from "./nativeArtworkAssets";
import {
  cloudShader,
  farMountainShader,
  middleMountainShader,
  nearMountainShader,
  campfireLogShader,
} from "./shaderData";
import styles from "./SceneArtwork.module.css";

type ShootingTrails = Partial<Record<"116:185" | "116:202" | "116:209" | "116:232", ReactNode>>;
type Sparklers = Partial<Record<"116:160" | "116:164", ReactNode>>;
type Campfire = Partial<Record<"121:54" | "121:57" | "121:61" | "121:74", ReactNode>>;

type SceneArtworkProps = {
  wordmark: ReactNode;
  heroAscii: ReactNode;
  heroContent: ReactNode;
  aboutContent: ReactNode;
  sectionContent: ReactNode;
  lastYearHeading: ReactNode;
  faqPanel: ReactNode;
  shootingTrails?: ShootingTrails;
  campfire?: Campfire;
  sparklers?: Sparklers;
};

type NativeArtworkId = keyof typeof nativeArtwork;

function NativeImage({ nodeId }: { nodeId: NativeArtworkId }) {
  const { src, paintBounds } = nativeArtwork[nodeId];
  return (
    <img
      alt=""
      className={styles.nativeImage}
      src={src}
      style={{
        left: `calc(${paintBounds.left} * var(--u))`,
        top: `calc(${paintBounds.top} * var(--u))`,
        width: `calc(${paintBounds.width} * var(--u))`,
        height: `calc(${paintBounds.height} * var(--u))`,
      }}
    />
  );
}

function NativeGroup({ nodeId }: { nodeId: NativeArtworkId }) {
  const { left, top, width, height, transform } = nativeArtwork[nodeId];
  return (
    <div
      className={styles.nativeGroup}
      data-node-id={nodeId}
      data-name="Mask group"
      style={{
        left: `calc(${left} * var(--u))`,
        top: `calc(${top} * var(--u))`,
        width: `calc(${width} * var(--u))`,
        height: `calc(${height} * var(--u))`,
        transform,
      }}
    >
      <NativeImage nodeId={nodeId} />
    </div>
  );
}

function EclipseArtwork({ wordmark }: Pick<SceneArtworkProps, "wordmark">) {
  return (
    <div className={styles.eclipseGroup} data-node-id="111:94">
      <div className={styles.eclipseHalo} data-node-id="111:95">
        <div className={styles.eclipseHaloPaintBounds}>
          <img alt="" className={styles.image} src={artwork.imgEllipse1} />
        </div>
      </div>
      {wordmark}
      <div className={styles.eclipseOuterRing} data-node-id="111:97">
        <div className={styles.eclipseOuterRingPaintBounds}>
          <img alt="" className={styles.image} src={artwork.imgEllipse2} />
        </div>
      </div>
      <div className={styles.eclipseInnerGlow} data-node-id="111:98">
        <div className={styles.eclipseInnerGlowPaintBounds}>
          <img alt="" className={styles.image} src={artwork.imgEllipse4} />
        </div>
      </div>
      <div className={styles.eclipseCore} data-node-id="111:99">
        <div className={styles.eclipseCorePaintBounds}>
          <img alt="" className={styles.image} src={artwork.imgEllipse3} />
        </div>
      </div>
      <div className={styles.eclipseStar} data-node-id="111:100">
        <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1352} />
      </div>
    </div>
  );
}

function MountainArtwork() {
  return (
    <>
      <div className={styles.farMountain} data-node-id="112:3">
        <div className={styles.farMountainPaintBounds}>
          <img alt="" className={styles.absoluteImage} src={artwork.imgVector15} />
        </div>
        {/* Native vector bounds preserve shader UVs; opaque fills cover exported interior shadows. */}
        <ShaderFill className={styles.shader} mask={`url("${artwork.farMountainMask}")`} shader={cloudShader} />
        <ShaderFill className={styles.shader} mask={`url("${artwork.farMountainMask}")`} shader={farMountainShader} />
        <img alt="" className={styles.absoluteImage} src={artwork.farMountainStroke} />
      </div>
      <div className={styles.smallMountainStar} data-node-id="116:102">
        <div className={styles.smallMountainStarRotation}>
          <div className={styles.smallMountainStarShape}>
            <div className={styles.smallMountainStarPaintBounds}>
              <img alt="" className={styles.image} src={artwork.imgGroup1357} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.middleMountain} data-node-id="112:49">
        <div className={styles.middleMountainPaintBounds}>
          <img alt="" className={styles.absoluteImage} src={artwork.imgVector16} />
        </div>
        <ShaderFill className={styles.shader} mask={`url("${artwork.middleMountainMask}")`} shader={cloudShader} />
        <ShaderFill className={styles.shader} mask={`url("${artwork.middleMountainMask}")`} shader={middleMountainShader} />
        <img alt="" className={styles.absoluteImage} src={artwork.middleMountainStroke} />
      </div>
      <div className={styles.largeMountainStar} data-node-id="116:87">
        <div className={styles.largeMountainStarRotation}>
          <div className={styles.largeMountainStarShape}>
            <div className={styles.largeMountainStarPaintBounds}>
              <img alt="" className={styles.image} src={artwork.imgGroup1355} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.leftMountainStar} data-node-id="116:96">
        <div className={styles.largeMountainStarRotation}>
          <div className={styles.leftMountainStarShape}>
            <div className={styles.leftMountainStarPaintBounds}>
              <img alt="" className={styles.image} src={artwork.imgGroup1356} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.nearMountain} data-node-id="112:50">
        <div className={styles.nearMountainPaintBounds}>
          <img alt="" className={styles.absoluteImage} src={artwork.imgVector17} />
        </div>
        <ShaderFill className={styles.shader} mask={`url("${artwork.nearMountainMask}")`} shader={cloudShader} />
        <ShaderFill className={styles.shader} mask={`url("${artwork.nearMountainMask}")`} shader={nearMountainShader} />
        <img alt="" className={styles.absoluteImage} src={artwork.nearMountainStroke} />
      </div>
      <div className={styles.mountainForeground} data-node-id="112:51">
        <div className={styles.mountainForegroundPaintBounds}>
          <img alt="" className={styles.image} src={artwork.imgVector18} />
        </div>
      </div>
    </>
  );
}

function CloudArtwork({ shootingTrails, lastYearHeading }: {
  shootingTrails: ShootingTrails;
  lastYearHeading: ReactNode;
}) {
  return (
    <div className={styles.cloudSection} data-node-id="116:183" data-name="cloud section">
      <div className={styles.cloudBackground} data-node-id="133:18" style={{ backgroundImage: "linear-gradient(-5.684341886080802e-14deg, rgb(10, 10, 10) 0%, rgb(33, 15, 6) 15.865%, rgb(33, 15, 6) 83.654%, rgb(18, 19, 21) 100%)" }} />
      <div className={styles.tallLeftCloud} data-node-id="133:2" data-name="Cloud 8">
        <NativeImage nodeId="133:2" />
      </div>
      <div className={styles.upperRightCloud} data-node-id="133:8">
        <div className={styles.upperRightCloudRotation}>
          <div className={styles.upperRightCloudShape} data-name="Cloud 9">
            <NativeImage nodeId="133:8" />
          </div>
        </div>
      </div>
      <div className={styles.lowerRightCloud} data-node-id="133:24">
        <div className={styles.upperRightCloudRotation}>
          <div className={styles.lowerRightCloudShape} data-name="Cloud 9">
            <NativeImage nodeId="133:24" />
          </div>
        </div>
      </div>
      <div className={styles.lowerLeftCloud} data-node-id="134:58" data-name="Cloud 11">
        <NativeImage nodeId="134:58" />
      </div>
      <div className={styles.middleLeftCloud} data-node-id="133:31" data-name="Cloud 10">
        <NativeImage nodeId="133:31" />
      </div>
      <div className={styles.peachShootingStar} data-node-id="116:184" data-name="Shooting star 1">
        <div className={styles.peachTrail} data-node-id="116:185">
          <div className={styles.peachTrailRotation}>
            <div className={styles.peachTrailShape} data-name="ASCII Frame">
              {shootingTrails["116:185"]}
            </div>
          </div>
        </div>
        <div className={styles.peachStar} data-node-id="116:187">
          <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1358} />
        </div>
      </div>
      <div className={styles.peachCloudBase} data-node-id="116:191" data-name="Cloud 1">
        <div className={styles.peachCloudBasePaintBounds}>
          <img alt="" className={styles.image} src={artwork.imgCloud1} />
        </div>
      </div>
      <div className={styles.peachCloudBase} data-node-id="116:196" data-name="Cloud 3">
        <NativeImage nodeId="116:196" />
      </div>
      <div className={styles.smallCloudAccent} data-node-id="133:36">
        <div className={styles.upperRightCloudRotation}>
          <div className={styles.smallCloudAccentShape}>
            <div className={styles.smallCloudAccentPaintBounds}>
              <img alt="" className={styles.image} src={artwork.imgVector4} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.blueShootingStar} data-node-id="116:201" data-name="Shooting star 3">
        <div className={styles.blueTrail} data-node-id="116:202">
          <div className={styles.blueTrailRotation}>
            <div className={styles.peachTrailShape} data-name="ASCII Frame">
              {shootingTrails["116:202"]}
            </div>
          </div>
        </div>
        <div className={styles.blueStar} data-node-id="116:204">
          <div className={styles.blueStarRotation}>
            <div className={styles.blueStarShape}>
              <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1359} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.yellowShootingStar} data-node-id="116:208" data-name="Shooting star 2">
        <div className={styles.yellowTrail} data-node-id="116:209">
          <div className={styles.yellowTrailRotation}>
            <div className={styles.peachTrailShape} data-name="ASCII Frame">
              {shootingTrails["116:209"]}
            </div>
          </div>
        </div>
        <div className={styles.yellowStar} data-node-id="116:211">
          <div className={styles.yellowStarRotation}>
            <div className={styles.yellowStarShape}>
              <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1360} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.blueCloudGroup} data-node-id="116:215" data-name="Cloud 2">
        <div className={styles.blueCloudBase} data-node-id="116:216" data-name="Cloud">
          <div className={styles.blueCloudBasePaintBounds}>
            <img alt="" className={styles.image} src={artwork.imgCloud} />
          </div>
        </div>
        <NativeGroup nodeId="116:218" />
      </div>
      <div className={styles.yellowCloudGroup} data-node-id="116:223" data-name="Cloud 3">
        <div className={styles.yellowCloudBase} data-node-id="116:224">
          <div className={styles.upperRightCloudRotation}>
            <div className={styles.yellowCloudBaseShape} data-name="Cloud 4">
              <div className={styles.yellowCloudBasePaintBounds}>
                <img alt="" className={styles.image} src={artwork.imgCloud5} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.yellowCloudGroup} data-node-id="116:226" data-name="Mask group">
          <div className={styles.yellowCloudMaskFrame} data-node-id="116:229">
            <div className={styles.upperRightCloudRotation}>
              <div className={styles.yellowCloudMaskFrameMask} style={{ maskImage: `url("${artwork.imgCloud6}")` }} data-name="Cloud 5">
                <div className={styles.yellowCloudMaskFramePaintBounds}>
                  <img alt="" className={styles.image} src={artwork.imgCloud7} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.pinkShootingStar} data-node-id="116:231" data-name="Shooting star 4">
        <div className={styles.pinkTrail} data-node-id="116:232">
          <div className={styles.pinkTrailRotation}>
            <div className={styles.peachTrailShape} data-name="ASCII Frame">
              {shootingTrails["116:232"]}
            </div>
          </div>
        </div>
        <div className={styles.pinkStar} data-node-id="116:234">
          <div className={styles.pinkStarRotation}>
            <div className={styles.pinkStarShape}>
              <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1361} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.pinkCloudGroup} data-node-id="116:238" data-name="Cloud 4">
        <div className={styles.pinkCloudBase} data-node-id="116:239">
          <div className={styles.upperRightCloudRotation}>
            <div className={styles.pinkCloudBaseShape} data-name="Cloud 4">
              <div className={styles.pinkCloudBasePaintBounds}>
                <img alt="" className={styles.image} src={artwork.imgCloud13} />
              </div>
            </div>
          </div>
        </div>
        <NativeGroup nodeId="116:241" />
      </div>
      <div className={styles.lastYearGroup} data-node-id="116:246" data-name="last year">
        <div className={styles.lastYearGroup} data-node-id="116:247" data-name="cloud">
          <div className={styles.lastYearGroup} data-node-id="116:248" data-name="Cloud 4">
            <div className={styles.lastYearCloudBase} data-node-id="116:249">
              <div className={styles.upperRightCloudRotation}>
                <div className={styles.lastYearCloudBaseShape} data-name="Cloud 4">
                  <div className={styles.lastYearCloudBasePaintBounds}>
                    <img alt="" className={styles.image} src={artwork.imgCloud16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.lastYearGroup} data-node-id="116:251" data-name="Mask group">
            <div className={styles.lastYearCloudMaskFrame} data-node-id="116:255">
              <div className={styles.upperRightCloudRotation}>
                <div className={styles.lastYearCloudMaskFrameMask} style={{ maskImage: `url("${artwork.imgCloud17}")` }} data-name="Cloud 4">
                  <div className={styles.lastYearCloudMaskFramePaintBounds}>
                    <img alt="" className={styles.image} src={artwork.imgCloud18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {lastYearHeading}
    </div>
  );
}

function FaqArtwork({ faqPanel, sparklers }: {
  faqPanel: ReactNode;
  sparklers: Sparklers;
}) {
  return (
    <div className={styles.faqScene} data-node-id="133:30">
      <div className={styles.faqBackdrop} data-node-id="116:109" />
      <div className={styles.faqHalo} data-node-id="116:110">
        <div className={styles.faqHaloRotation}>
          <div className={styles.faqHaloShape}>
            <div className={styles.eclipseHaloPaintBounds}>
              <img alt="" className={styles.image} src={artwork.imgEllipse5} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.faqGlow} data-node-id="116:111">
        <div className={styles.faqGlowPaintBounds}>
          <img alt="" className={styles.image} src={artwork.imgEllipse6} />
        </div>
      </div>
      {faqPanel}
      <div className={styles.faqGround} data-node-id="116:123" />
      <div className={styles.faqLeftCloud} data-node-id="116:124" data-name="Cloud 2">
        <div className={styles.faqLeftCloudBase} data-node-id="116:125" data-name="Cloud">
          <div className={styles.faqLeftCloudBasePaintBounds}>
            <img alt="" className={styles.image} src={artwork.imgCloud19} />
          </div>
        </div>
        <NativeGroup nodeId="116:127" />
      </div>
      <div className={styles.faqRightCloud} data-node-id="116:132" data-name="Cloud 4">
        <div className={styles.faqRightCloudBase} data-node-id="116:133" data-name="Cloud">
          <div className={styles.faqRightCloudBasePaintBounds}>
            <img alt="" className={styles.image} src={artwork.imgCloud22} />
          </div>
        </div>
        <NativeGroup nodeId="116:135" />
      </div>
      <div className={styles.faqMiddleCloud} data-node-id="116:140" data-name="Cloud 5">
        <div className={styles.faqMiddleCloudBase} data-node-id="116:141">
          <div className={styles.upperRightCloudRotation}>
            <div className={styles.faqMiddleCloudBaseShape} data-name="Cloud">
              <div className={styles.faqMiddleCloudBasePaintBounds}>
                <img alt="" className={styles.image} src={artwork.imgCloud25} />
              </div>
            </div>
          </div>
        </div>
        <NativeGroup nodeId="116:143" />
      </div>
      <div className={styles.faqWideCloud} data-node-id="116:148" data-name="Cloud 3">
        <div className={styles.faqWideCloudBase} data-node-id="116:149" data-name="Cloud">
          <div className={styles.faqWideCloudBasePaintBounds}>
            <img alt="" className={styles.image} src={artwork.imgCloud28} />
          </div>
        </div>
        <NativeGroup nodeId="116:151" />
      </div>
      <div className={styles.boatGroup} data-node-id="116:156" data-animation="boat">
        <div className={styles.boatHull} data-node-id="116:157">
          <div className={styles.boatHullRotation}>
            <div className={styles.boatHullShape}>
              <div className={styles.boatHullPaintBounds}>
                <img alt="" className={styles.image} src={artwork.imgVector11} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.orangeSparklerGroup} data-node-id="116:158">
          <div className={styles.orangeSparklerStem} data-node-id="116:159">
            <div className={styles.orangeSparklerStemRotation}>
              <div className={styles.orangeSparklerStemShape}>
                <div className={styles.orangeSparklerStemPaintBounds}>
                  <img alt="" className={styles.image} src={artwork.imgLine2} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.orangeSparkler} data-node-id="116:160">
            <div className={styles.orangeSparklerRotation}>
              <div className={styles.orangeSparklerShape} data-name="ASCII Frame">
                {sparklers["116:160"]}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.purpleSparklerGroup} data-node-id="116:162">
          <div className={styles.purpleSparklerStem} data-node-id="116:163">
            <div className={styles.purpleSparklerStemRotation}>
              <div className={styles.purpleSparklerStemShape}>
                <div className={styles.purpleSparklerStemPaintBounds}>
                  <img alt="" className={styles.image} src={artwork.imgLine3} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.purpleSparkler} data-node-id="116:164">
            <div className={styles.purpleSparklerRotation}>
              <div className={styles.purpleSparklerShape} data-name="ASCII Frame">
                {sparklers["116:164"]}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.boatCharacter} data-node-id="116:166">
          <div className={styles.boatCharacterRotation}>
            <div className={styles.boatCharacterShape}>
              <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1363} />
            </div>
          </div>
        </div>
        <div className={styles.boatOar} data-node-id="116:170">
          <div className={styles.boatHullRotation}>
            <div className={styles.boatOarShape}>
              <div className={styles.boatOarPaintBounds}>
                <img alt="" className={styles.image} src={artwork.imgVector12} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.floatingYellowStar} data-node-id="116:171" data-animation="yellow-star">
        <div className={styles.floatingYellowStarRotation}>
          <div className={styles.boatCharacterShape}>
            <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1364} />
          </div>
        </div>
      </div>
      <div className={styles.faqFrontCloud} data-node-id="116:175" data-name="Cloud 7">
        <div className={styles.faqFrontCloudBase} data-node-id="116:176">
          <div className={styles.faqFrontCloudBaseRotation}>
            <div className={styles.faqFrontCloudBaseShape} data-name="Cloud">
              <div className={styles.faqFrontCloudBasePaintBounds}>
                <img alt="" className={styles.image} src={artwork.imgCloud31} />
              </div>
            </div>
          </div>
        </div>
        <NativeGroup nodeId="116:178" />
      </div>
    </div>
  );
}

function CampfireArtwork({ campfire }: { campfire: Campfire }) {
  return (
    <div className={styles.campfireGroup} data-node-id="121:63">
      <div className={styles.campfireLeftCharacter} data-node-id="121:45">
        <div className={styles.campfireLeftCharacterRotation}>
          <div className={styles.campfireLeftCharacterShape}>
            <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1366} />
          </div>
        </div>
      </div>
      <div className={styles.campfireLeftLog} data-node-id="116:261">
        <ShaderFill className={styles.shader} mask={`url("${artwork.campfireLeftLogMask}")`} shader={campfireLogShader} />
        <div className={styles.campfireLeftLogPaintBounds}>
          <img alt="" className={styles.absoluteImage} src={artwork.imgVector19} />
        </div>
      </div>
      <div className={styles.campfireRightLog} data-node-id="121:40">
        <div className={styles.upperRightCloudRotation}>
          <div className={styles.campfireRightLogShape}>
            <ShaderFill className={styles.shader} mask={`url("${artwork.campfireRightLogMask}")`} shader={campfireLogShader} />
            <div className={styles.campfireLeftLogPaintBounds}>
              <img alt="" className={styles.absoluteImage} src={artwork.imgVector20} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.campfireRightCharacter} data-node-id="121:41">
        <div className={styles.campfireRightCharacterRotation}>
          <div className={styles.campfireRightCharacterShape}>
            <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1365} />
          </div>
        </div>
      </div>
      <div className={styles.campfireFrontCharacter} data-node-id="121:50">
        <div className={styles.campfireFrontCharacterRotation}>
          <div className={styles.campfireFrontCharacterShape}>
            <img alt="" className={styles.absoluteImage} src={artwork.imgGroup1367} />
          </div>
        </div>
      </div>
      <div className={styles.campfireLowFlame} data-node-id="121:54">
        <div className={styles.orangeSparklerRotation}>
          <div className={styles.campfireLowFlameShape} data-name="ASCII Frame">
            {campfire["121:54"]}
          </div>
        </div>
      </div>
      <div className={styles.campfireMiddleFlame} data-node-id="121:57">
        <div className={styles.campfireMiddleFlameRotation}>
          <div className={styles.campfireLowFlameShape} data-name="ASCII Frame">
            {campfire["121:57"]}
            <div className={styles.campfireInnerFlame} data-node-id="121:61" data-name="ASCII Frame">
              {campfire["121:61"]}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.campfireSmoke} data-node-id="121:74">
        <div className={styles.campfireMiddleFlameRotation}>
          <div className={styles.campfireSmokeShape} data-name="ASCII Frame">
            {campfire["121:74"]}
          </div>
        </div>
      </div>
    </div>
  );
}

function SponsorArtwork() {
  return (
    <>
      <div className={styles.sponsorLogoRowOne} data-node-id="134:66" data-name="image 58">
        <img alt="" className={styles.sponsorImage} src={artwork.imgImage58} />
      </div>
      <div className={styles.sponsorLogoRowTwo} data-node-id="135:71" data-name="image 59">
        <img alt="" className={styles.sponsorImage} src={artwork.imgImage58} />
      </div>
      <div className={styles.sponsorLogoRowThree} data-node-id="135:72" data-name="image 60">
        <img alt="" className={styles.sponsorImage} src={artwork.imgImage58} />
      </div>
      <div className={styles.sponsorLogoRowFour} data-node-id="135:73" data-name="image 61">
        <img alt="" className={styles.sponsorImage} src={artwork.imgImage58} />
      </div>
      <div className={styles.sponsorMessageRowOne} data-node-id="135:75" data-name="image 62">
        <div aria-hidden className={styles.sponsorMessageRowOnePaintBounds}>
          <img alt="" className={styles.sponsorImage2} src={artwork.imgImage62} />
          <img alt="" className={styles.sponsorImage2} src={artwork.imgImage62} />
        </div>
      </div>
      <div className={styles.sponsorMessageRowTwo} data-node-id="135:77" data-name="image 63">
        <div aria-hidden className={styles.sponsorMessageRowOnePaintBounds}>
          <img alt="" className={styles.sponsorImage2} src={artwork.imgImage62} />
          <img alt="" className={styles.sponsorImage2} src={artwork.imgImage62} />
        </div>
      </div>
      <div className={styles.sponsorMessageRowThree} data-node-id="135:78" data-name="image 64">
        <div aria-hidden className={styles.sponsorMessageRowOnePaintBounds}>
          <img alt="" className={styles.sponsorImage2} src={artwork.imgImage62} />
          <img alt="" className={styles.sponsorImage2} src={artwork.imgImage62} />
        </div>
      </div>
      <div className={styles.sponsorMessageRowFour} data-node-id="135:79" data-name="image 65">
        <div aria-hidden className={styles.sponsorMessageRowOnePaintBounds}>
          <img alt="" className={styles.sponsorImage2} src={artwork.imgImage62} />
          <img alt="" className={styles.sponsorImage2} src={artwork.imgImage62} />
        </div>
      </div>
    </>
  );
}

/**
 * Fixed artwork uses the original 1512px Figma coordinate space.
 * ASCII maps use the outer frame node ID; values supply only the text layer,
 * while these wrappers preserve the source rotations, masks, and clipping.
 */
export default function SceneArtwork({
  wordmark,
  heroAscii,
  heroContent,
  aboutContent,
  sectionContent,
  lastYearHeading,
  faqPanel,
  shootingTrails = {},
  campfire = {},
  sparklers = {},
}: SceneArtworkProps) {
  return (
    <div className={styles.sceneArtwork} data-scene-artwork>
      <div className={styles.sponsorBackground} data-node-id="134:64" />
      {heroAscii}
      <EclipseArtwork wordmark={wordmark} />
      <div className={styles.heroGround} data-node-id="111:106" />
      {heroContent}
      <MountainArtwork />
      {aboutContent}
      <CloudArtwork shootingTrails={shootingTrails} lastYearHeading={lastYearHeading} />
      <FaqArtwork faqPanel={faqPanel} sparklers={sparklers} />
      {sectionContent}
      <CampfireArtwork campfire={campfire} />
      <SponsorArtwork />
    </div>
  );
}
