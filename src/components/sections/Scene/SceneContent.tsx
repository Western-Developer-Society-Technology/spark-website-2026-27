import styles from "./SceneContent.module.css";

export function LastYearHeading() {
  return (
    <section aria-label="Last year at Spark" className={styles.lastYear}>
      <h2 data-node-id="116:257">Last year...</h2>
      <ul className={styles.srOnly}>
        <li>110+ hackers</li>
        <li>25+ projects</li>
        <li>36 hours</li>
        <li>$1k+ in prizes</li>
      </ul>
    </section>
  );
}

export default function SceneContent() {
  return (
    <>
      <section aria-labelledby="sponsors-heading" className={styles.sponsors}>
        <h2 id="sponsors-heading" data-node-id="116:259">Sponsors</h2>
        <ul className={styles.srOnly}>
          <li>Lovable</li>
          <li>Figma</li>
        </ul>
      </section>
      <footer className={styles.footer}>
        <h2 data-node-id="134:56">Team/footer</h2>
      </footer>
    </>
  );
}
