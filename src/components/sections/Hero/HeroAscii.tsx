import AsciiArt from "@/components/ui/AsciiArt";
import styles from "./HeroAscii.module.css";

const ASCII_LAYERS = [
  { frameId: "111:79", textId: "111:80", className: "distant" },
  { frameId: "111:83", textId: "111:84", className: "orange" },
  { frameId: "111:85", textId: "111:86", className: "peach" },
  { frameId: "111:87", textId: "111:88", className: "left" },
];

export default function HeroAscii() {
  return ASCII_LAYERS.map(({ frameId, textId, className }) => (
    <div className={styles[className]} data-node-id={frameId} key={frameId} aria-hidden="true">
      <AsciiArt nodeId={textId} mode="cursor" />
    </div>
  ));
}
