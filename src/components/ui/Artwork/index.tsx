/* eslint-disable @next/next/no-img-element -- Figma artwork keeps its original SVG bounds. */
import styles from "./Artwork.module.css";

export type BlueCloud = {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  transform: string;
  paintBounds: { left: number; top: number; width: number; height: number };
};

/** Fills its parent: in flow by default, or absolutely inset for relative shape boxes. */
export function ArtworkImage({
  src,
  absolute = false,
  className,
}: {
  src: string;
  absolute?: boolean;
  className?: string;
}) {
  const defaultClass = absolute ? styles.absoluteImage : styles.image;
  return <img alt="" className={className ?? defaultClass} src={src} />;
}

export function BlueCloudImage({ cloud }: { cloud: BlueCloud }) {
  const { src, paintBounds } = cloud;
  return (
    <img
      alt=""
      className={styles.blueCloudImage}
      src={src}
      style={{
        left: `calc(${paintBounds.left} * var(--u))`,
        top: `calc(${paintBounds.top} * var(--u))`,
        width: `calc(${paintBounds.width} * var(--u))`,
        height: `calc(${paintBounds.height} * var(--u))`,
      }}
    />
  );
}

export function BlueCloudGroup({ nodeId, cloud }: { nodeId: string; cloud: BlueCloud }) {
  const { left, top, width, height, transform } = cloud;
  return (
    <div
      className={styles.blueCloudGroup}
      data-node-id={nodeId}
      data-name="Mask group"
      style={{
        left: `calc(${left} * var(--u))`,
        top: `calc(${top} * var(--u))`,
        width: `calc(${width} * var(--u))`,
        height: `calc(${height} * var(--u))`,
        transform,
      }}
    >
      <BlueCloudImage cloud={cloud} />
    </div>
  );
}
