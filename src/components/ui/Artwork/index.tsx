/* eslint-disable @next/next/no-img-element -- Figma artwork keeps its original SVG bounds. */
import styles from "./Artwork.module.css";
import type { ComponentProps } from "react";

type ArtworkDeliveryProps = Pick<ComponentProps<"img">, "srcSet" | "sizes" | "loading" | "fetchPriority">;

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
  ...delivery
}: {
  src: string;
  absolute?: boolean;
  className?: string;
} & ArtworkDeliveryProps) {
  const defaultClass = absolute ? styles.absoluteImage : styles.image;
  return <img alt="" className={className ?? defaultClass} src={src} {...delivery} />;
}

export function BlueCloudImage({ cloud, ...delivery }: { cloud: BlueCloud } & ArtworkDeliveryProps) {
  const { src, paintBounds } = cloud;
  return (
    <img
      alt=""
      className={styles.blueCloudImage}
      src={src}
      {...delivery}
      style={{
        left: `calc(${paintBounds.left} * var(--u))`,
        top: `calc(${paintBounds.top} * var(--u))`,
        width: `calc(${paintBounds.width} * var(--u))`,
        height: `calc(${paintBounds.height} * var(--u))`,
      }}
    />
  );
}

export function BlueCloudGroup({ nodeId, cloud, ...delivery }: { nodeId: string; cloud: BlueCloud } & ArtworkDeliveryProps) {
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
      <BlueCloudImage cloud={cloud} {...delivery} />
    </div>
  );
}
