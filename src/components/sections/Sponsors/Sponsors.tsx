/* eslint-disable @next/next/no-img-element -- Sponsor wordmarks and planet spheres keep their SVG bounds. */
import Orbits from "../Closing/Orbits";
import styles from "./Sponsors.module.css";

const SPONSOR_EMAIL = "mailto:westerndeveloperssociety@gmail.com";

const PLANETS = [
  {
    name: "EY",
    logo: "/images/sponsors/ey-white.svg",
    className: styles.planetEy,
    logoClassName: styles.logoEy,
  },
  {
    name: "Slido",
    logo: "/images/sponsors/slido-planet.svg",
    className: styles.planetSlido,
    logoClassName: styles.logoSlido,
  },
  {
    name: "RBC",
    logo: "/images/sponsors/rbc-planet.svg",
    className: styles.planetRbc,
    logoClassName: styles.logoRbc,
  },
  {
    name: "Voices",
    logo: "/images/sponsors/voices-planet.svg",
    className: styles.planetVoices,
    logoClassName: styles.logoVoices,
  },
] as const;

export default function Sponsors() {
  return (
    <section id="sponsors" aria-labelledby="sponsors-heading" className={styles.sponsors}>
      <Orbits tone="dark" className={styles.orbits} />
      <div className={styles.copy}>
        <h2 id="sponsors-heading">
          Spark a weekend
          <br />
          of innovation
        </h2>
        <p className={styles.subtitle}>
          Connect with Western&apos;s brightest minds and
          <br />
          empower the builders of tomorrow.
        </p>
        <a className={styles.sponsorUs} href={SPONSOR_EMAIL}>
          Sponsor us
        </a>
      </div>
      <ul className={styles.planets} aria-label="Last year's sponsors">
        {PLANETS.map(({ name, logo, className, logoClassName }) => (
          <li className={`${styles.planet} ${className}`} key={name}>
            <img className={styles.planetBall} src="/images/sponsors/planet-ball.svg" alt="" />
            <img className={`${styles.planetLogo} ${logoClassName}`} src={logo} alt={name} />
          </li>
        ))}
      </ul>
    </section>
  );
}
