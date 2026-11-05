"use client";

/* eslint-disable @next/next/no-img-element -- Navbar reuses the same raster and SVG assets as the footer. */

import { useEffect, useRef, useState } from "react";
import { SOCIAL_LINKS } from "@/lib/social-links";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Stats", href: "#stats" },
  { label: "FAQ", href: "#faq" },
  { label: "Sponsors", href: "#sponsors" },
] as const;

const SCROLL_RANGE = 96;

function scrollProgress() {
  if (typeof window === "undefined") return 0;
  return Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE));
}

export default function Navbar() {
  const [progress, setProgress] = useState(0);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pillRef.current?.style.setProperty("--nav-progress", String(progress));
  }, [progress]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const sync = () => {
      frame = 0;
      const next = reducedMotion.matches ? (window.scrollY > 8 ? 1 : 0) : scrollProgress();
      setProgress(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    reducedMotion.addEventListener("change", sync);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <header className={styles.shell} aria-label="Site">
      <div
        ref={pillRef}
        className={styles.pill}
        data-glass={progress > 0.04 ? "" : undefined}
      >
        <div className={styles.content}>
          <div className={styles.startCluster}>
            <a className={styles.logoGroup} href="#top" aria-label="Spark, back to top">
              <img
                className={styles.logoImage}
                src="/images/figma/rendered/sparkcharacter.webp"
                alt=""
                width={40}
                height={40}
              />
              <span className={styles.logoDivider} aria-hidden="true" />
              <img
                className={styles.wdsLogo}
                src="/images/footer/wds-logo.png"
                alt=""
                width={120}
                height={32}
              />
            </a>
            <nav className={styles.links} aria-label="Page sections">
              {NAV_LINKS.map(({ label, href }) => (
                <a className={styles.navLink} href={href} key={href}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <nav className={styles.socials} aria-label="Western Developers Society online">
            {SOCIAL_LINKS.map(({ name, href, icon, width, height }) => (
              <a
                className={styles.social}
                href={href}
                key={name}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                <span className={styles.srOnly}>{name}</span>
                <img className={styles.socialIcon} src={icon} alt="" width={width} height={height} />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
