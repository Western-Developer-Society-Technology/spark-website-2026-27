"use client";

import { useId } from "react";
import { ArtworkImage } from "@/components/ui/Artwork";
import type { StarBadgeConfig } from "./shooting-star-badges";
import styles from "./LastYear.module.css";

type ShootingStarBadgeProps = {
  src: string;
  config: StarBadgeConfig;
};

export default function ShootingStarBadge({ src, config }: ShootingStarBadgeProps) {
  const uid = useId().replace(/:/g, "");
  const topPathId = `${uid}-top`;
  const bottomPathId = `${uid}-bottom`;

  return (
    <div
      className={styles.starBadge}
      style={{
        width: `calc(${config.width} * var(--u))`,
        height: `calc(${config.height} * var(--u))`,
      }}
    >
      <ArtworkImage loading="lazy" absolute src={src} />
      <svg
        className={styles.starBadgeLabel}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <path id={topPathId} d={config.topPath} />
          <path id={bottomPathId} d={config.bottomPath} />
        </defs>
        <text
          fill="#000000"
          fontFamily='"Host Grotesk", Arial, sans-serif'
          fontWeight={800}
          letterSpacing="-0.04em"
        >
          <textPath href={`#${topPathId}`} startOffset="50%" textAnchor="middle" fontSize={config.topFontSize}>
            {config.lines[0]}
          </textPath>
        </text>
        <text
          fill="#000000"
          fontFamily='"Host Grotesk", Arial, sans-serif'
          fontWeight={800}
          letterSpacing="-0.03em"
        >
          <textPath href={`#${bottomPathId}`} startOffset="50%" textAnchor="middle" fontSize={config.bottomFontSize}>
            {config.lines[1]}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
