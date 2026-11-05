"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createStarOutlineMotion, createWaterSplashArt, WATER_MOTION } from "../Faq/water-motion";
import { HERO_DURATION, HERO_MOTION, type HeroMotion } from "../Hero/hero-motion";
import { createStarEntrances } from "../LastYear/star-motion";
import { createScrollScenery } from "./scroll-scenery";
import styles from "./Scene.module.css";

type SceneProps = { children: ReactNode };
type MotionRegion = "hero" | "water";
type ManagedMotion = {
  animation: Animation;
  keyframes: (unit: number) => Keyframe[];
  region: MotionRegion;
};

function heroKeyframes(motion: HeroMotion, unit: number): Keyframe[] {
  const finalValue = motion.frames.at(-1)?.[1];
  return motion.frames.map(([time, value, easing]) => {
    let resolved: string | number = String(value);
    if (Array.isArray(value)) {
      // The reference's final pose differs from the approved static draft.
      // Express its movement relative to that pose, so it settles on the
      // draft's native bounds without a jump when the intro completes.
      const final = Array.isArray(finalValue) ? finalValue : [0, 0];
      if (motion.property === "translate") {
        resolved = `${(value[0] - final[0]) * unit}px ${(value[1] - final[1]) * unit}px`;
      } else {
        resolved = `${value[0] / (final[0] || 1)} ${value[1] / (final[1] || 1)}`;
      }
    } else if (typeof value === "number") {
      if (motion.property === "rotate") resolved = `${value}deg`;
      else if (motion.property === "filter") {
        // The approved draft's SVG already contains its resting blur. Add only
        // the excess from the intro, so the supplied asset stays sharp at rest.
        const blur = Math.sqrt(Math.max(0, value ** 2 - (motion.bakedBlur ?? 0) ** 2));
        resolved = `blur(${blur * unit}px)`;
      } else if (motion.property === "opacity" && typeof finalValue === "number" && finalValue !== 0) {
        resolved = value / finalValue;
      } else resolved = value;
    }
    return { [motion.property]: resolved, offset: time / HERO_DURATION, easing };
  });
}

export default function Scene({ children }: SceneProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createScrollScenery(root);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createStarEntrances(root);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // These light layers need the dark center to composite correctly. Their
    // downloads can finish first on a cold connection, exposing a white disc.
    const eclipseCore = root.querySelector<HTMLImageElement>('[data-node-id="111:99"] img');
    const revealEclipse = () => {
      if (eclipseCore?.complete && eclipseCore.naturalWidth > 0) root.dataset.eclipseCoreReady = "ready";
    };
    eclipseCore?.addEventListener("load", revealEclipse);
    revealEclipse();
    const motions: ManagedMotion[] = [];
    let starOutline: ReturnType<typeof createStarOutlineMotion> | undefined;
    let splashArt: ReturnType<typeof createWaterSplashArt> | undefined;
    const visibleRegions: Record<MotionRegion, boolean> = { hero: false, water: false };
    let unit = root.clientWidth / 1512;
    let ready = false;
    let disposed = false;
    let heroFinished = reducedMotion.matches;

    const completeHero = () => {
      heroFinished = true;
      root.dataset.loadState = "complete";
      // Every final keyframe is the underlying draft pose. Release the effects
      // instead of retaining identity transforms and blur layers while scrolling.
      for (let index = motions.length - 1; index >= 0; index -= 1) {
        if (motions[index].region !== "hero") continue;
        motions[index].animation.onfinish = null;
        motions[index].animation.cancel();
        motions.splice(index, 1);
      }
    };

    const syncPlayback = () => {
      const timelineTime = document.timeline.currentTime;
      motions.forEach(({ animation, region }) => {
        // Calling play() on a finished one-shot animation would replay the intro.
        if (animation.playState === "finished") return;
        if (ready && !reducedMotion.matches && !document.hidden && visibleRegions[region]) {
          const currentTime = Number(animation.currentTime ?? 0);
          animation.play();
          if (typeof timelineTime === "number") animation.startTime = timelineTime - currentTime;
        } else animation.pause();
      });
      starOutline?.sync();
      splashArt?.sync();
    };

    const addMotion = (
      element: HTMLElement | SVGElement,
      keyframes: ManagedMotion["keyframes"],
      region: MotionRegion,
      options: KeyframeAnimationOptions,
    ) => {
      const animation = element.animate(keyframes(unit), options);
      animation.pause();
      animation.currentTime = 0;
      motions.push({ animation, keyframes, region });
      return animation;
    };

    if (!heroFinished) {
      HERO_MOTION.forEach((motion) => {
        const selector = `[data-node-id="${motion.nodeId}"]${motion.part ? ` [data-part="${motion.part}"]` : ""}`;
        const element = root.querySelector<HTMLElement>(selector);
        if (!element) return;
        // Text with a size cap scales its motion by its own capped unit instead.
        const elementUnit = (widthUnit: number) => {
          const textUnit = parseFloat(getComputedStyle(element).getPropertyValue("--text-u"));
          return textUnit > 0 ? textUnit : widthUnit;
        };
        const animation = addMotion(element, (widthUnit) => heroKeyframes(motion, elementUnit(widthUnit)), "hero", {
          duration: HERO_DURATION,
          iterations: 1,
          fill: "both",
        });
        animation.onfinish = () => {
          if (motions.filter(({ region }) => region === "hero").every(({ animation: item }) => item.playState === "finished")) {
            completeHero();
          }
        };
      });
    }
    root.dataset.loadState = heroFinished ? "complete" : "running";

    WATER_MOTION.forEach(({ selector, keyframes, options }) => {
      const element = root.querySelector<HTMLElement | SVGElement>(selector);
      if (!element) return;
      const animation = addMotion(element, keyframes, "water", options);
      if (element.dataset.animation === "yellow-star-balance") {
        const path = root.querySelector<SVGPathElement>('[data-animation="yellow-star-outline"]');
        if (path) starOutline = createStarOutlineMotion(path, animation);
        splashArt = createWaterSplashArt(root, animation);
      }
    });

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!(entry.target instanceof HTMLElement)) return;
        const region = entry.target.dataset.motionRegion as MotionRegion;
        visibleRegions[region] = entry.isIntersecting;
      });
      syncPlayback();
    });
    root.querySelectorAll<HTMLElement>("[data-motion-region]").forEach((region) => intersectionObserver.observe(region));

    // Update distances without recreating animations or resetting their clocks.
    const resizeObserver = new ResizeObserver(() => {
      const nextUnit = root.clientWidth / 1512;
      if (Math.abs(nextUnit - unit) < .000001) return;
      unit = nextUnit;
      motions.forEach(({ animation, keyframes }) => {
        if (animation.effect instanceof KeyframeEffect) animation.effect.setKeyframes(keyframes(unit));
      });
    });
    resizeObserver.observe(root);

    const handleReducedMotion = () => {
      if (reducedMotion.matches) {
        completeHero();
        motions.forEach(({ animation }) => {
          animation.pause();
          animation.currentTime = 0;
        });
      }
      syncPlayback();
    };
    reducedMotion.addEventListener("change", handleReducedMotion);
    document.addEventListener("visibilitychange", syncPlayback);

    // Play the eclipse intro immediately; wordmark and artwork can finish decoding in the background.
    ready = true;
    syncPlayback();
    const heroImages = [...root.querySelectorAll<HTMLImageElement>('[data-node-id="111:94"] img, [data-node-id="111:96"] img')];
    const wordmarkFont = document.fonts.load('1em "Eternalo"').catch(() => undefined);
    void Promise.all([wordmarkFont, ...heroImages.map((img) => img.decode().catch(() => undefined))]).then(() => {
      if (disposed) return;
      syncPlayback();
    });

    return () => {
      disposed = true;
      eclipseCore?.removeEventListener("load", revealEclipse);
      starOutline?.dispose();
      splashArt?.dispose();
      motions.forEach(({ animation }) => animation.cancel());
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      reducedMotion.removeEventListener("change", handleReducedMotion);
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  return (
    <main id="top" className={styles.site} ref={rootRef} data-load-state="pending" data-eclipse-core-ready="pending" data-stars-state="pending">
      <div className={styles.stage}>{children}</div>
    </main>
  );
}
