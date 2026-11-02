import { useId } from "react";
import { ORIGINAL_STAR_OUTLINE } from "./star-shape";
import styles from "./Water.module.css";

const LEFT_EYE = "M128.571 119.548L128.544 119.645C124.985 124.418 123.451 128.331 123.941 131.383C124.432 134.435 124.346 136.597 123.683 137.871C123.021 139.145 122.73 139.793 122.81 139.815L122.959 139.753L122.932 139.849";
const RIGHT_EYE = "M172.555 129.699L172.529 129.795C168.969 134.568 167.435 138.481 167.926 141.533C168.417 144.585 168.331 146.748 167.668 148.021C167.005 149.295 166.714 149.943 166.795 149.965L166.943 149.903L166.916 149.999";

export default function StarCharacter() {
  const filterId = `${useId()}-yellow-star-texture`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={styles.starCharacter}
      preserveAspectRatio="none"
      viewBox="0 0 296.165 299.445"
      fill="none"
    >
      <g fill="#FFB731" filter={`url(#${filterId})`}>
        <path d={ORIGINAL_STAR_OUTLINE} data-animation="yellow-star-outline" />
      </g>
      <g stroke="white" strokeWidth="21.4285" strokeLinecap="round">
        <g className={styles.starEyeLeft} data-animation="yellow-star-eye-left">
          <path d={LEFT_EYE} />
        </g>
        <g className={styles.starEyeRight} data-animation="yellow-star-eye-right">
          <path d={RIGHT_EYE} />
        </g>
      </g>
      <defs>
        <filter
          id={filterId}
          x="-20"
          y="-25"
          width="340"
          height="355"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="13.5817" dy="-33.9543" />
          <feGaussianBlur stdDeviation="37.0102" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.944987 0 0 0 0 0.669922 0 0 0 1 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.88354063034057617 0.88354063034057617"
            stitchTiles="stitch"
            numOctaves="3"
            result="noise"
            seed="3996"
          />
          <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
          <feComponentTransfer in="alphaNoise" result="coloredNoise1">
            <feFuncA
              type="discrete"
              tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
            />
          </feComponentTransfer>
          <feComposite operator="in" in2="effect1_innerShadow" in="coloredNoise1" result="noise1Clipped" />
          <feFlood floodColor="rgba(255, 255, 255, 0.26)" result="color1Flood" />
          <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
          <feMerge>
            <feMergeNode in="effect1_innerShadow" />
            <feMergeNode in="color1" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
