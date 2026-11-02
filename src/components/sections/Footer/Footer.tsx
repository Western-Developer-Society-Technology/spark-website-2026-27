import { ArtworkImage } from "@/components/ui/Artwork";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Spark footer">
      <div className={styles.inner}>
        <div className={styles.main}>
          <div className={styles.brand}>
            <a className={styles.wordmark} href="#top" aria-label="Spark, back to top">
              <span className={styles.wordmarkSp} aria-hidden="true">SP</span>
              <span className={styles.wordmarkA} aria-hidden="true">A</span>
              <span className={styles.star} aria-hidden="true">
                <ArtworkImage absolute src="/images/figma/rendered/group-1363.webp" />
              </span>
              <span className={styles.wordmarkRk} aria-hidden="true">RK</span>
            </a>
            <p className={styles.tagline}>where ideas ignite</p>
          </div>
          <div className={styles.event}>
            <p className={styles.invitation}>See you at Spark.</p>
            <p>February 2–4, 2027</p>
            <p>Western University</p>
            <p className={styles.format}>Hackathon &amp; Case Competition</p>
          </div>
          <nav className={styles.links} aria-label="Footer navigation">
            <a href="#about-heading">About Spark</a>
            <a href="#faq-heading">FAQ</a>
            <a href="#sponsors">Sponsors</a>
          </nav>
        </div>
        <div className={styles.bottom}>
          <p>© 2027 Spark</p>
          <a className={styles.backToTop} href="#top">
            Back to top
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5m-6 6 6-6 6 6" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
