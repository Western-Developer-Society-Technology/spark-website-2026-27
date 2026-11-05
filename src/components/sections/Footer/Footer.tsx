/* eslint-disable @next/next/no-img-element -- Footer wordmark, WDS lockup, and social icons keep their original assets. */
import { ArtworkImage } from "@/components/ui/Artwork";
import { SOCIAL_LINKS } from "@/lib/social-links";
import Orbits from "../Closing/Orbits";
import styles from "./Footer.module.css";

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
        <ArtworkImage loading="lazy" absolute src="/images/figma/rendered/sparkcharacter.webp" />
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
          <img loading="lazy" className={styles.wds} src="/images/optimized/footer/wds-logo.webp" alt="Western Developers Society" width={903} height={326} />
        </p>
        <Wordmark />
        <nav className={styles.socials} aria-label="Western Developers Society online">
          {SOCIAL_LINKS.map(({ name, href, icon, width, height }) => (
            <a
              className={styles.social}
              href={href}
              key={name}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <span className={styles.srOnly}>{name}</span>
              <img loading="lazy" className={styles.socialIcon} src={icon} alt="" width={width} height={height} />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
