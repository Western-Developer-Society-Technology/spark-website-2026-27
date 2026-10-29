"use client";

import { useState } from "react";
import styles from "./Hero.module.css";

export function Wordmark() {
  return (
    <h1 className={styles.wordmark} data-node-id="111:96">
      {/* Exported from the Eternalo text layer to preserve its exact letterforms. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/figma/spark-wordmark.svg" width="451" height="144" alt="SPARK" />
    </h1>
  );
}

export default function Hero() {
  const [comingSoon, setComingSoon] = useState(false);

  return (
    <section className={styles.hero} aria-label="Spark Hackathon and Case Competition">
      <p className={styles.tagline} data-node-id="111:107">where ideas ignite</p>
      <div className={styles.details} data-node-id="111:108">
        <button
          className={styles.apply}
          type="button"
          onClick={() => setComingSoon(true)}
          data-node-id="111:110"
        >
          <span data-node-id="111:111">{comingSoon ? "Coming soon" : "Apply now"}</span>
        </button>
        <span className={styles.srOnly} role="status">{comingSoon ? "Coming soon." : ""}</span>
        <p className={styles.date} data-node-id="111:112">February 2-4, 2027</p>
        <p className={styles.format} data-node-id="111:113">Hackathon • Case Competition</p>
        <p className={styles.location} data-node-id="111:114">In-person event @ Western University</p>
      </div>
    </section>
  );
}
