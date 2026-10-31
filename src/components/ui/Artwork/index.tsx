/* eslint-disable @next/next/no-img-element -- Figma artwork keeps its original SVG bounds. */
import styles from "./Artwork.module.css";

export type NativeArtwork = {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  transform: string;
  paintBounds: { left: number; top: number; width: number; height: number };
};

/** Fills its parent: in flow by default, or absolutely inset for relative shape boxes. */
export function ArtworkImage({ src, absolute = false }: { src: string; absolute?: boolean }) {
  return <img alt="" className={absolute ? styles.absoluteImage : styles.image} src={src} />;
}

export function NativeImage({ artwork }: { artwork: NativeArtwork }) {
  const { src, paintBounds } = artwork;
  return (
    <img
      alt=""
      className={styles.nativeImage}
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

export function NativeGroup({ nodeId, artwork }: { nodeId: string; artwork: NativeArtwork }) {
  const { left, top, width, height, transform } = artwork;
  return (
    <div
      className={styles.nativeGroup}
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
      <NativeImage artwork={artwork} />
    </div>
  );
}
