import Footer from "../Footer/Footer";
import Sponsors from "../Sponsors/Sponsors";
import styles from "./Closing.module.css";

export default function Closing() {
  return (
    <div className={styles.band} data-artwork-region="sponsors">
      <div className={styles.gradient} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- Soft radial glow scales with the closing band. */}
        <img loading="lazy" src="/images/sponsors/gradient.svg" alt="" />
      </div>
      <Sponsors />
      <Footer />
    </div>
  );
}
