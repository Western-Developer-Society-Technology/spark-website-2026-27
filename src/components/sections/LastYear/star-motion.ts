import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SHOOTING_STARS } from "./shooting-stars";
import {
  buildShootingStarPath,
  departureOffsetX,
  entranceTilt,
  flightPoint,
  lastYearUnit,
} from "./flight-path";

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
      const { group, marker, side } = star;
      if (!animate || completed.has(group)) {
        completed.add(group);
        group.dataset.starState = "complete";
        group.dataset.starProgress = "1";
        return;
      }

      group.dataset.starState = "pending";
      group.dataset.starProgress = "0";
      const head = group.querySelector<HTMLElement>("[data-star-head]") ?? group;
      const unit = () => lastYearUnit(root.clientWidth);
      const pathOf = () => {
        const fromX = departureOffsetX(marker, side, unit());
        return buildShootingStarPath(
          fromX,
          star.dip,
          "arc" in star && star.arc === "overshoot" ? "overshoot" : "default",
        );
      };
      const finish = () => {
        completed.add(group);
        group.dataset.starState = "complete";
        group.dataset.starProgress = "1";
      };

      const pose = { t: 0 };
      const applyPose = () => {
        const path = pathOf();
        const point = flightPoint(path, pose.t);
        const tilt = entranceTilt(path, pose.t);
        gsap.set(head, { x: point.x, y: point.y, rotation: tilt, force3D: true });
        group.dataset.starProgress = pose.t.toFixed(3);
      };

      const flight = gsap.timeline({
        paused: true,
        delay: .3 + star.index * .045,
        onStart: () => {
          group.dataset.starState = "running";
          pose.t = 0;
          applyPose();
        },
        onComplete: () => {
          finish();
          flight.kill();
        },
      });
      flight.set(group, { visibility: "visible" });
      flight.set(head, { willChange: "transform" });
      flight.fromTo(pose, { t: 0 }, {
        t: 1,
        duration: star.duration,
        ease: "power4.out",
        onUpdate: applyPose,
      });
      flight.set(head, { clearProps: RELEASE_PROPERTIES });

      const enter = (trigger: ScrollTrigger) => {
        trigger.kill(false);
        if (completed.has(group)) return;
        completed.add(group);

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
    stars.forEach(({ group }) => {
      delete group.dataset.starState;
      delete group.dataset.starProgress;
    });
    root.dataset.starsState = "pending";
  };
}
