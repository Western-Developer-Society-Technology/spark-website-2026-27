/* eslint-disable @next/next/no-img-element -- Figma artwork keeps its original bounds. */
import styles from "./Sponsors.module.css";

const LOGO = "/images/figma/image-58.png";
const MESSAGE = "/images/figma/image-62.png";

const LOGO_ROWS = [
  { nodeId: "134:66", name: "image 58", className: styles.sponsorLogoRowOne },
  { nodeId: "135:71", name: "image 59", className: styles.sponsorLogoRowTwo },
  { nodeId: "135:72", name: "image 60", className: styles.sponsorLogoRowThree },
  { nodeId: "135:73", name: "image 61", className: styles.sponsorLogoRowFour },
];

const MESSAGE_ROWS = [
  { nodeId: "135:75", name: "image 62", className: styles.sponsorMessageRowOne },
  { nodeId: "135:77", name: "image 63", className: styles.sponsorMessageRowTwo },
  { nodeId: "135:78", name: "image 64", className: styles.sponsorMessageRowThree },
  { nodeId: "135:79", name: "image 65", className: styles.sponsorMessageRowFour },
];

export default function Sponsors() {
  return (
    <>
      <div className={styles.sponsorBackground} data-node-id="134:64" />
      <section aria-labelledby="sponsors-heading" className={styles.sponsors}>
        <h2 id="sponsors-heading" data-node-id="116:259">Sponsors</h2>
        <ul className={styles.srOnly}>
          <li>Lovable</li>
          <li>Figma</li>
        </ul>
      </section>
      {LOGO_ROWS.map(({ nodeId, name, className }) => (
        <div className={className} data-node-id={nodeId} data-name={name} key={nodeId}>
          <img alt="" className={styles.sponsorImage} src={LOGO} />
        </div>
      ))}
      {MESSAGE_ROWS.map(({ nodeId, name, className }) => (
        <div className={className} data-node-id={nodeId} data-name={name} key={nodeId}>
          <div aria-hidden className={styles.sponsorMessagePaintBounds}>
            <img alt="" className={styles.sponsorMessageImage} src={MESSAGE} />
            <img alt="" className={styles.sponsorMessageImage} src={MESSAGE} />
          </div>
        </div>
      ))}
    </>
  );
}
