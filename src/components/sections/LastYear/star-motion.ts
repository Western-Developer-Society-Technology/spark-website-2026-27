import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SHOOTING_STARS } from "./shooting-stars";

const RELEASE_PROPERTIES = "transform,transformOrigin,willChange,visibility";

export function createStarEntrances(root: HTMLElement) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  const completed = new Set<HTMLElement>();
  const stars = SHOOTING_STARS.flatMap((star, index) => {
    const group = root.querySelector<HTMLElement>(`[data-node-id="${star.nodeId}"]`);
    const marker = root.querySelector<HTMLElement>(`[data-star-trigger="${star.id}"]`);
    return group && marker ? [{ ...star, index, group, marker }] : [];
  });

  media.add({
    animate: "(prefers-reduced-motion: no-preference)",
    reduce: "(prefers-reduced-motion: reduce)",
  }, (context) => {
    const animate = context.conditions?.animate;

    stars.forEach((star) => {
      const { group, marker, side, slope } = star;
      if (!animate || completed.has(group)) {
        completed.add(group);
        group.dataset.starState = "complete";
        return;
      }

      group.dataset.starState = "pending";
      const unit = () => root.clientWidth / 1512;
      const departureX = () => {
        const bounds = marker.getBoundingClientRect();
        const gutter = Math.max(24, 40 * unit());
        return side < 0 ? -bounds.right - gutter : window.innerWidth - bounds.left + gutter;
      };
      const finish = () => {
        completed.add(group);
        group.dataset.starState = "complete";
      };

      // Only the star and its own tail become a composited layer, and only for
      // the flight. A small overshoot makes the stop feel weighted, not elastic.
      const flight = gsap.timeline({
        paused: true,
        delay: .3 + star.index * .045,
        onStart: () => { group.dataset.starState = "running"; },
        onComplete: () => {
          finish();
          // kill() detaches the timeline without reverting the cleared final
          // pose. No finished flight remains available for scroll to replay.
          flight.kill();
        },
      });
      flight.set(group, { visibility: "visible", willChange: "transform" });
      flight.fromTo(group, {
        x: departureX,
        y: () => departureX() * slope,
        rotation: side * -4,
        scaleX: 1.06,
        scaleY: .97,
      }, {
        x: () => -side * 12 * unit(),
        y: () => -side * 12 * unit() * slope,
        rotation: side * .55,
        scaleX: 1,
        scaleY: 1,
        duration: star.duration,
        ease: "power3.out",
        force3D: true,
        immediateRender: false,
      });
      flight.to(group, {
        x: 0, y: 0, rotation: 0,
        duration: .22,
        ease: "sine.inOut",
      });
      flight.set(group, { clearProps: RELEASE_PROPERTIES });

      const enter = (trigger: ScrollTrigger) => {
        // Keep scrolling and playback independent. Linking the animation to
        // ScrollTrigger lets its refresh/revert logic render the departure
        // frame again before a once:true trigger reaches its end boundary.
        trigger.kill(false);
        if (completed.has(group)) return;
        completed.add(group);

        // Scroll restoration or a fling can skip the entire star in one frame.
        // It should already be settled when the reader returns to this section.
        if (marker.getBoundingClientRect().bottom <= 0) {
          finish();
          flight.kill();
          return;
        }
        flight.restart(true);
      };

      ScrollTrigger.create({
        trigger: marker,
        start: "top 90%",
        end: "bottom top",
        once: true,
        onEnter: enter,
        onEnterBack: enter,
      });
    });

    root.dataset.starsState = "ready";
  }, root);

  return () => {
    media.revert();
    stars.forEach(({ group }) => { delete group.dataset.starState; });
    root.dataset.starsState = "pending";
  };
}
