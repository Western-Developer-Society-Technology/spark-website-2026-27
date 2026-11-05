import { ArtworkImage } from "@/components/ui/Artwork";
import artwork from "./artwork";
import styles from "./AboutRidge.module.css";

/** Lower ridge below copy/campfire; stacks above the campfire and fades into Last Year. */
export default function AboutRidge() {
  return (
    <div className={styles.ridge} aria-hidden="true">
      <div className={styles.ridgeMountain} data-node-id="112:4">
        <ArtworkImage fetchPriority="low" absolute src={artwork.mountainRidge} />
      </div>
      <div className={styles.ridgeForeground} data-node-id="112:52">
        <ArtworkImage fetchPriority="low" absolute src={artwork.mountainRidgeForeground} />
      </div>
    </div>
  );
}
