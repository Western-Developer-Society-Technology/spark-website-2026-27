import { ArtworkImage } from "@/components/ui/Artwork";
import artwork from "./artwork";
import Eclipse from "./Eclipse";
import HeroAscii, { HeroStreaks } from "./HeroAscii";
import styles from "./Hero.module.css";

/** After the rise, the "A" gives way to the star while "SP" and "RK" part around it. */
function Wordmark() {
  return (
    <h1 className={styles.wordmark} data-node-id="111:96" aria-label="SPARK">
      <span className={styles.wordmarkSp} data-part="sp" aria-hidden="true">SP</span>
      <span className={styles.wordmarkA} data-part="a" aria-hidden="true">A</span>
      <span className={styles.wordmarkRk} data-part="rk" aria-hidden="true">RK</span>
      <span className={styles.wordmarkStar} data-part="star" aria-hidden="true">
        <ArtworkImage absolute src={artwork.imgGroup1363} />
      </span>
    </h1>
  );
}

export default function Hero() {
  return (
    <>
      <div className={styles.motionRegion} data-motion-region="hero" aria-hidden="true" />
      <Eclipse />
      <HeroStreaks />
      <HeroAscii />
      <div className={styles.ground} data-node-id="111:106" />
      <section className={styles.hero} aria-label="Spark Hackathon and Case Competition">
        <p className={styles.tagline} data-node-id="111:107">where ideas ignite</p>
        <div className={styles.details} data-node-id="111:108">
          <button
            className={styles.apply}
            type="button"
            data-node-id="111:110"
          >
            <span data-node-id="111:111">Apply now</span>
          </button>
          <p className={styles.date} data-node-id="111:112">February 2-4, 2027</p>
          <p className={styles.format} data-node-id="111:113">Hackathon • Case Competition</p>
          <p className={styles.location} data-node-id="111:114">In-person event @ Western University</p>
        </div>
      </section>
      <Wordmark />
    </>
  );
}
