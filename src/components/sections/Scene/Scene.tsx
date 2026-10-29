"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Scene.module.css";

type HeroMotion = {
  id: string;
  times: number[];
  easing: string[];
} & (
  | { property: "translate"; values: (number | [number, number])[] }
  | { property: "rotate" | "scale" | "filter" | "opacity"; values: number[] }
);

type SceneProps = {
  children: ReactNode;
};

// The four-second timeline is from the existing motion reference, frame 6:30.
// Map its authored layers to the corresponding layers in the approved frame 111:2.
const HERO_MOTION: HeroMotion[] = [
  { id: "111:95", property: "rotate", values: [-15, -15, 0, 0], times: [0, .0436, .9277, 1], easing: ["linear", "cubic-bezier(.15,.198,.315,.765)", "linear"] },
  { id: "111:95", property: "scale", values: [.8, .8, 1, 1], times: [0, .0171, .4317, 1], easing: ["linear", "cubic-bezier(.48,0,.19,.99)", "linear"] },
  { id: "111:95", property: "translate", values: [34.5, 0, 0], times: [0, .4141, 1], easing: ["cubic-bezier(.48,0,.19,.99)", "linear"] },
  { id: "111:96", property: "translate", values: [286, 0, 0], times: [0, .5366, 1], easing: ["cubic-bezier(.48,0,.19,.99)", "linear"] },
  { id: "111:96", property: "filter", values: [26.4, 26.4, 0, 0], times: [0, .2257, .5366, 1], easing: ["linear", "cubic-bezier(.5,0,.5,1)", "linear"] },
  { id: "111:97", property: "translate", values: [33, 0, 0], times: [0, .4141, 1], easing: ["cubic-bezier(.48,0,.19,.99)", "linear"] },
  { id: "111:98", property: "scale", values: [1, 1, 1.06, 1.06, 1, 1], times: [0, .0693, .2984, .4413, .8749, 1], easing: ["linear", "cubic-bezier(.5,0,.5,1)", "linear", "cubic-bezier(.5,0,.19,.99)", "linear"] },
  { id: "111:98", property: "translate", values: [[71,153.5],[71,153.5],[-.2,5.66],[-8.3,-7.51],[5,0],[5,0]], times: [0, .0693, .2984, .4413, .8749, 1], easing: ["linear", "linear", "linear", "cubic-bezier(.5,0,.19,.99)", "linear"] },
  { id: "111:99", property: "translate", values: [133.5, 0, 0], times: [0, .4141, 1], easing: ["cubic-bezier(.483,0,.192,.985)", "linear"] },
  { id: "111:108", property: "opacity", values: [0, 0, 1, 1], times: [0, .5799, .7061, 1], easing: ["linear", "cubic-bezier(.5,0,.5,1)", "linear"] },
  { id: "111:108", property: "translate", values: [133.5, 0, 0], times: [0, .4141, 1], easing: ["cubic-bezier(.483,0,.192,.985)", "linear"] },
  { id: "111:107", property: "opacity", values: [0, 0, 1, 1], times: [0, .4536, .5799, 1], easing: ["linear", "cubic-bezier(.5,0,.5,1)", "linear"] },
  { id: "111:107", property: "translate", values: [286, 0, 0], times: [0, .5366, 1], easing: ["cubic-bezier(.48,0,.19,.99)", "linear"] },
  { id: "111:100", property: "opacity", values: [0, 0, 1, 1, .76, .76], times: [0, .1457, .291, .3646, .8749, 1], easing: ["linear", "cubic-bezier(.48,0,.19,.99)", "cubic-bezier(.48,0,.19,.99)", "cubic-bezier(.5,0,.19,.99)", "linear"] },
  { id: "111:100", property: "scale", values: [.62, .62, 1.09, 1.09, .84, .84], times: [0, .1533, .3443, .4035, .8749, 1], easing: ["linear", "cubic-bezier(.48,0,.19,.99)", "cubic-bezier(.48,0,.19,.99)", "cubic-bezier(.5,0,.189,.987)", "linear"] },
  { id: "111:100", property: "translate", values: [154.81, 0, 0], times: [0, .4141, 1], easing: ["cubic-bezier(.48,0,.19,.99)", "linear"] },
];

function motionValue(motion: HeroMotion, index: number, unit: number): string | number {
  if (motion.property === "translate") {
    const value = motion.values[index];
    return Array.isArray(value) ? `${value[0] * unit}px ${value[1] * unit}px` : `0px ${value * unit}px`;
  }
  const { property } = motion;
  const value = motion.values[index];
  if (property === "filter") return `blur(${value * unit}px)`;
  if (property === "rotate") return `${value}deg`;
  return value;
}

export default function Scene({ children }: SceneProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    let animationGroups: Record<string, Animation[]> = {};
    let visibleRegions: Record<string, boolean> = {};
    let intersectionObserver: IntersectionObserver | undefined;

    const configureMotion = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      animationGroups = {};
      visibleRegions = {};
      intersectionObserver?.disconnect();
      if (reducedMotion.matches) return;

      const unit = root.clientWidth / 1512;
      HERO_MOTION.forEach((motion) => {
        const { id, property, values, times, easing } = motion;
        const element = root.querySelector<HTMLElement>(`[data-node-id="${id}"]`);
        if (!element) return;
        const animation = element.animate(values.map((_, index) => ({
          [property]: motionValue(motion, index, unit),
          offset: times[index],
          easing: easing[index] ?? "linear",
        })), { duration: 4000, iterations: Infinity });
        animations.push(animation);
      });
      animationGroups.hero = [...animations];
      const heroAnimationCount = animations.length;

      // These note-only movements have no authored keyframes. Their timing is
      // centralized here so the design team can tune it without changing artwork.
      const boat = root.querySelector<HTMLElement>('[data-animation="boat"]');
      if (boat) animations.push(boat.animate([
        { translate: "0px 0px", offset: 0 },
        { translate: `${-800 * unit}px 0px`, offset: .5 },
        { translate: "0px 0px", offset: 1 },
      ], { duration: 16000, iterations: Infinity, easing: "ease-in-out" }));

      const star = root.querySelector<HTMLElement>('[data-animation="yellow-star"]');
      if (star) animations.push(star.animate([
        { rotate: "0deg", translate: "0px 0px", offset: 0 },
        { rotate: "3deg", translate: "0px 0px", offset: .25 },
        { rotate: "-3deg", translate: "0px 0px", offset: .5 },
        { rotate: "0deg", translate: `0px ${100 * unit}px`, offset: .7 },
        { rotate: "3deg", translate: "0px 0px", offset: .85 },
        { rotate: "0deg", translate: "0px 0px", offset: 1 },
      ], { duration: 8000, iterations: Infinity, easing: "ease-in-out" }));

      animationGroups.water = animations.slice(heroAnimationCount);
      animations.forEach((animation) => animation.pause());
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!(entry.target instanceof HTMLElement)) return;
          const region = entry.target.dataset.motionRegion;
          if (!region) return;
          visibleRegions[region] = entry.isIntersecting;
          animationGroups[region]?.forEach((animation) => entry.isIntersecting && !document.hidden ? animation.play() : animation.pause());
        });
      });
      intersectionObserver = observer;
      root.querySelectorAll<HTMLElement>("[data-motion-region]").forEach((region) => observer.observe(region));
    };

    configureMotion();
    const resizeObserver = new ResizeObserver(configureMotion);
    resizeObserver.observe(root);
    reducedMotion.addEventListener("change", configureMotion);
    const handleVisibility = () => Object.entries(animationGroups).forEach(([region, group]) => {
      group.forEach((animation) => !document.hidden && visibleRegions[region] ? animation.play() : animation.pause());
    });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      animations.forEach((animation) => animation.cancel());
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      reducedMotion.removeEventListener("change", configureMotion);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <main className={styles.site} ref={rootRef}>
      <div className={styles.stage}>
        <div className={styles.heroMotionRegion} data-motion-region="hero" aria-hidden="true" />
        <div className={styles.waterMotionRegion} data-motion-region="water" aria-hidden="true" />
        {children}
      </div>
    </main>
  );
}
