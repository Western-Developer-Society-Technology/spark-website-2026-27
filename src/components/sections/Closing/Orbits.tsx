import styles from "./Closing.module.css";

type OrbitsProps = {
  tone: "dark" | "light";
  className?: string;
};

/** Four sponsor-orbit ellipses from Figma 227:142, drawn in the 1512×1454 frame. */
export default function Orbits({ tone, className }: OrbitsProps) {
  const stroke = tone === "light" ? "#fff" : "#000";

  return (
    <svg
      className={className ?? styles.orbits}
      viewBox="0 0 1512 1454"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      overflow="visible"
      aria-hidden="true"
    >
      <ellipse cx="1048.5" cy="982.97" rx="1124.5" ry="684" stroke={stroke} strokeWidth="2" />
      <ellipse cx="1021" cy="1180" rx="894" ry="699" stroke={stroke} strokeWidth="2" />
      <ellipse cx="667" cy="1171.5" rx="845" ry="676.5" stroke={stroke} strokeWidth="2" />
      <ellipse cx="653.5" cy="1259" rx="553.5" ry="610" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}
