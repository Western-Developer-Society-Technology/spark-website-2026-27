import { ShaderFill } from "@/lib/custom-effect-runtime/components/ShaderFill";
import type { Shader } from "@/lib/custom-effect-runtime/types";
import styles from "./Artwork.module.css";

/** Callers must be client components: shader objects carry functions. */
export default function ArtworkShader({ mask, shader }: { mask: string; shader: Shader }) {
  return <ShaderFill className={styles.shader} mask={`url("${mask}")`} shader={shader} />;
}
