/* eslint-disable @next/next/no-img-element -- Footer wordmark, WDS lockup, and social icons keep their original assets. */
import { ArtworkImage } from "@/components/ui/Artwork";
import Orbits from "../Closing/Orbits";
import styles from "./Footer.module.css";

const SOCIALS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/westerndevsociety",
    icon: "/images/footer/instagramicon.svg",
    width: 22,
    height: 22,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/western-dev-society",
    icon: "/images/footer/linkedinicon.svg",
    width: 22,
    height: 22,
  },
  {
    name: "Website",
    href: "https://westerndevsociety.ca",
    icon: "/images/footer/globeicon.svg",
    width: 22,
    height: 22,
  },
  {
    name: "Email",
    href: "mailto:westerndeveloperssociety@gmail.com",
    icon: "/images/footer/mailicon.svg",
    width: 25,
    height: 20,
  },
] as const;

function Wordmark() {
  return (
    <a className={styles.wordmark} href="#top" aria-label="Spark, back to top">
      <span className={styles.wordmarkSp} aria-hidden="true">
        SP
      </span>
      <span className={styles.wordmarkA} aria-hidden="true">
        A
      </span>
      <span className={styles.wordmarkRk} aria-hidden="true">
        RK
      </span>
      <span className={styles.wordmarkStar} aria-hidden="true">
        <ArtworkImage absolute src="/images/figma/rendered/sparkcharacter.webp" />
      </span>
    </a>
  );
}

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Spark footer">
      <div className={styles.orbitClip} aria-hidden="true">
        <Orbits tone="light" className={styles.orbits} omitOutermost />
      </div>
      <div className={styles.brand}>
        <p className={styles.credit}>
          Brought to you by
          <img className={styles.wds} src="/images/footer/wds-logo.png" alt="Western Developers Society" />
        </p>
        <Wordmark />
        <nav className={styles.socials} aria-label="Western Developers Society online">
          {SOCIALS.map(({ name, href, icon, width, height }) => (
            <a
              className={styles.social}
              href={href}
              key={name}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <span className={styles.srOnly}>{name}</span>
              <img className={styles.socialIcon} src={icon} alt="" width={width} height={height} />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
