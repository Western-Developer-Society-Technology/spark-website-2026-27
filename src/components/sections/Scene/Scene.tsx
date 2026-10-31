"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { WATER_MOTION } from "../Faq/water-motion";
import { HERO_DURATION, HERO_MOTION, type HeroMotion } from "../Hero/hero-motion";
import { createStarEntrances } from "../LastYear/star-motion";
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

  useEffect(() => {
    if (rootRef.current) return createStarEntrances(rootRef.current);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motions: ManagedMotion[] = [];
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
    };

    const addMotion = (
      element: HTMLElement,
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
        const selector = `[data-node-id="${motion.nodeId}"]`;
        const element = root.querySelector<HTMLElement>(selector);
        if (!element) return;
        const animation = addMotion(element, (widthUnit) => heroKeyframes(motion, widthUnit), "hero", {
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

    const updateScenery = () => {
      const hasScrolled = window.scrollY > 0 ? "true" : "false";
      if (root.dataset.hasScrolled !== hasScrolled) root.dataset.hasScrolled = hasScrolled;
    };
    updateScenery();
    window.addEventListener("scroll", updateScenery, { passive: true });

    WATER_MOTION.forEach(({ selector, keyframes, options }) => {
      const element = root.querySelector<HTMLElement>(selector);
      if (element) addMotion(element, keyframes, "water", options);
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

    // Start with fonts and the actual hero artwork ready, rather than letting a
    // late SVG decode miss the authored reveal. Below-the-fold images don't delay it.
    const heroImages = [...root.querySelectorAll<HTMLImageElement>('[data-node-id="111:94"] img')];
    Promise.all([document.fonts.ready, ...heroImages.map((img) => img.decode().catch(() => undefined))]).then(() => {
      if (disposed) return;
      ready = true;
      syncPlayback();
    });

    return () => {
      disposed = true;
      motions.forEach(({ animation }) => animation.cancel());
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      reducedMotion.removeEventListener("change", handleReducedMotion);
      document.removeEventListener("visibilitychange", syncPlayback);
      window.removeEventListener("scroll", updateScenery);
    };
  }, []);

  return (
    <main className={styles.site} ref={rootRef} data-load-state="pending" data-has-scrolled="false" data-stars-state="pending">
      <div className={styles.stage}>{children}</div>
    </main>
  );
}
