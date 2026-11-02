/* eslint-disable @next/next/no-img-element -- Local SVG sponsor wordmarks need no raster optimization. */
import styles from "./Sponsors.module.css";

// Last year's sponsors, shown until the 2027 lineup is confirmed.
const SPONSORS = [
  { name: "Slido", logo: "/images/sponsors/slido.svg", width: 144, height: 48 },
  { name: "Voices", logo: "/images/sponsors/voices.svg", width: 160, height: 36 },
  { name: "EY", logo: "/images/sponsors/ey.svg", width: 64, height: 65 },
  { name: "RBC", logo: "/images/sponsors/rbc.svg", width: 52, height: 68 },
];

export default function Sponsors() {
  return (
    <section id="sponsors" aria-labelledby="sponsors-heading" className={styles.sponsors}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h2 id="sponsors-heading">Our sponsors</h2>
          <p>A little support goes a long way. Thank you to the partners who helped last year&apos;s ideas take flight.</p>
        </div>
        <ul className={styles.logos} aria-label="Last year's sponsors" aria-describedby="sponsor-note">
          {SPONSORS.map(({ name, logo, width, height }) => (
            <li className={styles.logo} key={name}>
              <img className={name === "RBC" ? styles.rbcLogo : undefined} src={logo} alt={name} width={width} height={height} />
            </li>
          ))}
        </ul>
        <p className={styles.note} id="sponsor-note">
          These companies sponsored Spark last year. Our 2027 sponsors are still to be confirmed.
        </p>
      </div>
    </section>
  );
}
