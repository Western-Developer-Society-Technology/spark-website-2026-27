import { useId } from "react";
import styles from "./Orbits.module.css";

type OrbitsProps = {
  tone: "dark" | "light";
  className?: string;
  /** Footer omits the largest ellipse so only the inner three rings show. */
  omitOutermost?: boolean;
};

const ELLIPSES = [
  { cx: 1048.5, cy: 982.97, rx: 1124.5, ry: 684 },
  { cx: 1021, cy: 1180, rx: 894, ry: 699 },
  { cx: 667, cy: 1171.5, rx: 845, ry: 676.5 },
  { cx: 653.5, cy: 1259, rx: 553.5, ry: 610 },
] as const;

const BLUE = {
  bright: "#75D8F3",
  mid: "#6FCCE5",
  soft: "#C6F2FF",
} as const;

/** Four sponsor-orbit ellipses from Figma 227:142, drawn in the 1512×1454 frame. */
export default function Orbits({ tone, className, omitOutermost = false }: OrbitsProps) {
  const uid = useId().replace(/:/g, "");
  const lightFadeId = `${uid}-light-fade`;
  const ring0Id = `${uid}-ring-0`;
  const ring1Id = `${uid}-ring-1`;
  const ring3Id = `${uid}-ring-3`;

  const darkStrokes = [`url(#${ring0Id})`, "#000", `url(#${ring1Id})`, `url(#${ring3Id})`] as const;

  return (
    <svg
      className={className ?? styles.root}
      viewBox="0 0 1512 1454"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      overflow="visible"
      aria-hidden="true"
    >
      <defs>
        {tone === "light" && (
          <linearGradient id={lightFadeId} gradientUnits="userSpaceOnUse" x1="756" y1="780" x2="756" y2="1454">
            <stop offset="0" stopColor="#d6d6d6" />
            <stop offset="0.38" stopColor="#d0d0d0" />
            <stop offset="0.55" stopColor="#b3b3b3" />
            <stop offset="0.72" stopColor="#949494" />
            <stop offset="0.86" stopColor="#767676" />
            <stop offset="1" stopColor="#585858" />
          </linearGradient>
        )}
        {tone === "dark" && (
          <>
            {/* Outermost ring: blue washes in from the right (wide, soft falloff). */}
            <linearGradient id={ring0Id} gradientUnits="userSpaceOnUse" x1="120" y1="983" x2="1512" y2="983">
              <stop offset="0" stopColor="#000000" />
              <stop offset="0.32" stopColor="#000000" />
              <stop offset="0.52" stopColor="#142028" />
              <stop offset="0.68" stopColor={BLUE.mid} />
              <stop offset="0.84" stopColor={BLUE.bright} />
              <stop offset="1" stopColor={BLUE.soft} />
            </linearGradient>
            {/* Third ring: blue from the left. */}
            <linearGradient id={ring1Id} gradientUnits="userSpaceOnUse" x1="-40" y1="1171.5" x2="920" y2="1171.5">
              <stop offset="0" stopColor={BLUE.soft} />
              <stop offset="0.16" stopColor={BLUE.bright} />
              <stop offset="0.32" stopColor={BLUE.mid} />
              <stop offset="0.48" stopColor="#142028" />
              <stop offset="0.62" stopColor="#000000" />
              <stop offset="1" stopColor="#000000" />
            </linearGradient>
            {/* Innermost ring: gentle blue around the middle of the arc. */}
            <linearGradient id={ring3Id} gradientUnits="userSpaceOnUse" x1="80" y1="1259" x2="1240" y2="1259">
              <stop offset="0" stopColor="#000000" />
              <stop offset="0.1" stopColor="#000000" />
              <stop offset="0.24" stopColor="#142028" />
              <stop offset="0.34" stopColor={BLUE.mid} />
              <stop offset="0.42" stopColor={BLUE.soft} />
              <stop offset="0.5" stopColor={BLUE.bright} />
              <stop offset="0.58" stopColor={BLUE.soft} />
              <stop offset="0.66" stopColor={BLUE.mid} />
              <stop offset="0.78" stopColor="#142028" />
              <stop offset="0.9" stopColor="#000000" />
              <stop offset="1" stopColor="#000000" />
            </linearGradient>
          </>
        )}
      </defs>
      {ELLIPSES.map((ellipse, index) => {
        if (omitOutermost && index === 0) return null;
        return (
          <ellipse
            key={`${ellipse.cx}-${ellipse.cy}`}
            className={index === 3 ? styles.voicesOrbit : undefined}
            cx={ellipse.cx}
            cy={ellipse.cy}
            rx={ellipse.rx}
            ry={ellipse.ry}
            stroke={tone === "light" ? `url(#${lightFadeId})` : darkStrokes[index]}
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}
