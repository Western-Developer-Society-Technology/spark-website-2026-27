import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Figma-unit Y at scroll start (lower) and end (higher than layout); far layers travel most. */
const MOUNTAIN_PARALLAX = [
  { nodeId: "112:3", start: 180, end: -440 },
  { nodeId: "112:49", start: 110, end: -300 },
  { nodeId: "112:50", start: 56, end: -168 },
  { nodeId: "112:51", start: 32, end: -96 },
  { nodeId: "116:102", start: 96, end: -248 },
  { nodeId: "116:87", start: 80, end: -208 },
  { nodeId: "116:96", start: 88, end: -228 },
] as const;

function aboutStage(root: HTMLElement) {
  return root.querySelector<HTMLElement>("[data-about-stage]");
}

export function createScrollScenery(root: HTMLElement) {
  gsap.registerPlugin(ScrollTrigger);
  const stage = aboutStage(root);
  const reveal = () => stage?.setAttribute("data-scenery-ready", "");
  const hide = () => stage?.removeAttribute("data-scenery-ready");

  const heroRegion = root.querySelector<HTMLElement>('[data-motion-region="hero"]');
  const aboutRegion = root.querySelector<HTMLElement>('[data-motion-region="about"]');
  const mountains = MOUNTAIN_PARALLAX.flatMap(({ nodeId, start, end }) => {
    const element = root.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
    return element ? [{ element, start, end }] : [];
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !heroRegion || !aboutRegion || mountains.length === 0) {
    reveal();
    return () => hide();
  }

  const unit = () => root.clientWidth / 1512;

  const apply = (progress: number) => {
    const u = unit();
    mountains.forEach(({ element, start, end }) => {
      const y = (start + (end - start) * progress) * u;
      gsap.set(element, { y, force3D: true });
    });
  };

  apply(0);

  const scrollTrigger = ScrollTrigger.create({
    trigger: heroRegion,
    start: "top top",
    endTrigger: aboutRegion,
    end: "bottom top",
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => apply(self.progress),
  });

  apply(scrollTrigger.progress);
  reveal();

  const resizeObserver = new ResizeObserver(() => {
    ScrollTrigger.refresh();
    apply(scrollTrigger.progress);
  });
  resizeObserver.observe(root);

  return () => {
    scrollTrigger.kill();
    resizeObserver.disconnect();
    mountains.forEach(({ element }) => gsap.set(element, { clearProps: "transform" }));
    hide();
  };
}
