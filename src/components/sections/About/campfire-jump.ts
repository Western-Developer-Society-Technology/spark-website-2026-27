const CHARACTER_NODE_IDS = ["121:45", "121:41", "121:50"] as const;
const JUMP_DURATION_MS = 720;
const INTRO_STAGGER_MS = 150;
const RANDOM_INTERVALS_MS = [3000, 4000, 6000] as const;

function sceneUnit(campfireRoot: HTMLElement) {
  const main = campfireRoot.closest("main");
  return (main?.clientWidth ?? 1512) / 1512;
}

function jumpPose(y: number, rotateDeg: number, scaleX: number, scaleY: number) {
  return `translate3d(0, ${y}px, 0) rotate(${rotateDeg}deg) scale(${scaleX}, ${scaleY})`;
}

function jumpKeyframes(unit: number): Keyframe[] {
  const lift = 21 * unit;
  return [
    { transform: jumpPose(0, 0, 1, 1), offset: 0 },
    {
      transform: jumpPose(-lift * 0.52, 0, 0.94, 1.06),
      easing: "cubic-bezier(0.33, 1, 0.68, 1)",
      offset: 0.34,
    },
    {
      transform: jumpPose(-lift * 0.88, -2, 0.95, 1.05),
      easing: "cubic-bezier(0.45, 0, 0.55, 1)",
      offset: 0.46,
    },
    {
      transform: jumpPose(-lift * 1.08, 1.5, 0.96, 1.04),
      easing: "cubic-bezier(0.45, 0, 0.55, 1)",
      offset: 0.58,
    },
    {
      transform: jumpPose(-lift * 0.48, 0.35, 0.98, 1.02),
      easing: "cubic-bezier(0.34, 1.15, 0.64, 1)",
      offset: 0.76,
    },
    {
      transform: jumpPose(-lift * 0.08, 0, 0.99, 1.01),
      easing: "ease-out",
      offset: 0.9,
    },
    { transform: jumpPose(0, 0, 1, 1), offset: 1 },
  ];
}

function randomIntervalMs() {
  const index = Math.floor(Math.random() * RANDOM_INTERVALS_MS.length);
  return RANDOM_INTERVALS_MS[index];
}

function playJump(element: HTMLElement, unit: number) {
  const animation = element.animate(jumpKeyframes(unit), {
    duration: JUMP_DURATION_MS,
    fill: "none",
  });
  return new Promise<void>((resolve) => {
    animation.onfinish = () => {
      animation.cancel();
      resolve();
    };
    animation.oncancel = () => resolve();
  });
}

/** Staggered trio on first about scroll, then independent random hops. */
export function setupCampfireJumps(campfireRoot: HTMLElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return () => undefined;

  const characters = CHARACTER_NODE_IDS.flatMap((nodeId) => {
    const element = campfireRoot.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
    return element ? [element] : [];
  });
  if (characters.length !== CHARACTER_NODE_IDS.length) return () => undefined;

  let disposed = false;
  let introStarted = false;
  let randomLoopsStarted = false;
  const timeouts = new Set<number>();

  const schedule = (callback: () => void, delayMs: number) => {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      if (!disposed) callback();
    }, delayMs);
    timeouts.add(id);
  };

  const unit = () => sceneUnit(campfireRoot);

  const startRandomLoops = () => {
    if (randomLoopsStarted || disposed) return;
    randomLoopsStarted = true;

    const loop = (element: HTMLElement) => {
      if (disposed) return;
      schedule(async () => {
        if (disposed) return;
        await playJump(element, unit());
        loop(element);
      }, randomIntervalMs());
    };

    characters.forEach((element) => loop(element));
  };

  const runIntro = () => {
    if (introStarted || disposed) return;
    introStarted = true;
    campfireRoot.dataset.campfireJump = "intro";

    characters.forEach((element, index) => {
      schedule(() => {
        void playJump(element, unit());
      }, index * INTRO_STAGGER_MS);
    });

    const introEnd =
      (characters.length - 1) * INTRO_STAGGER_MS + JUMP_DURATION_MS + 250;
    schedule(() => {
      campfireRoot.dataset.campfireJump = "idle";
      startRandomLoops();
    }, introEnd);
  };

  const sceneRoot = campfireRoot.closest("main");
  const aboutRegion = sceneRoot?.querySelector<HTMLElement>('[data-motion-region="about"]');

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      runIntro();
      observer.disconnect();
    },
    { threshold: 0.12 },
  );

  observer.observe(aboutRegion ?? campfireRoot);

  return () => {
    disposed = true;
    observer.disconnect();
    timeouts.forEach((id) => window.clearTimeout(id));
    timeouts.clear();
    characters.forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
  };
}
