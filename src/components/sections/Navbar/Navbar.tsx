"use client";

/* eslint-disable @next/next/no-img-element -- Navbar reuses the same raster and SVG assets as the footer. */

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { SOCIAL_LINKS } from "@/lib/social-links";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Stats", href: "#stats" },
  { label: "FAQ", href: "#faq" },
  { label: "Sponsors", href: "#sponsors" },
] as const;

const SCROLL_RANGE = 96;
const MENU_ANIM_MS = 280;

/** Give anchor destinations a head start while the user focuses or opens a link. */
function warmSectionImages(href: string) {
  const region = document.querySelector(href)?.closest("[data-artwork-region]");
  region?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((image) => {
    image.loading = "eager";
  });
}

function scrollProgress() {
  if (typeof window === "undefined") return 0;
  return Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE));
}

export default function Navbar() {
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const pendingSectionRef = useRef<string | null>(null);
  const menuVisible = menuOpen || menuClosing;

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

  useEffect(() => {
    pillRef.current?.style.setProperty("--nav-progress", String(progress));
  }, [progress]);

  useEffect(() => {
    // The desktop stylesheet hides the overlay; release its scroll lock too.
    const mobile = window.matchMedia("(max-width: 720px)");
    const onChange = () => {
      if (mobile.matches) return;
      setMenuOpen(false);
      setMenuClosing(false);
    };
    mobile.addEventListener("change", onChange);
    return () => mobile.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!menuVisible) return;

    const scrollY = window.scrollY;
    const { documentElement: html, body } = document;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.touchAction = "none";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMenuClosing(true);
      }
    };

    const blockBackgroundScroll = (event: TouchEvent) => {
      const panel = menuPanelRef.current;
      if (panel && event.target instanceof Node && panel.contains(event.target)) return;
      event.preventDefault();
    };

    const blockBackgroundWheel = (event: WheelEvent) => {
      const panel = menuPanelRef.current;
      if (panel && event.target instanceof Node && panel.contains(event.target)) return;
      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("touchmove", blockBackgroundScroll, { passive: false });
    document.addEventListener("wheel", blockBackgroundWheel, { passive: false });

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.touchAction = previousBodyTouchAction;

      const pending = pendingSectionRef.current;
      pendingSectionRef.current = null;

      // This restores a frozen viewport, rather than navigating to a section.
      // Inheriting the page's smooth scrolling briefly jumps back to the top.
      window.scrollTo({ top: scrollY, behavior: "instant" });

      if (pending) {
        const id = pending.slice(1);
        requestAnimationFrame(() => {
          const target = document.getElementById(id);
          if (!target) return;

          history.pushState(null, "", pending);
          const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth";
          target.scrollIntoView({ behavior, block: "start" });
        });
      }

      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("touchmove", blockBackgroundScroll);
      document.removeEventListener("wheel", blockBackgroundWheel);
    };
  }, [menuVisible]);

  useEffect(() => {
    if (!menuClosing) return;

    const timer = window.setTimeout(() => setMenuClosing(false), MENU_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [menuClosing]);

  const openMenu = () => {
    setMenuClosing(false);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    if (!menuOpen && !menuClosing) return;
    setMenuOpen(false);
    setMenuClosing(true);
  };

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
      return;
    }
    if (menuClosing) {
      setMenuClosing(false);
      setMenuOpen(true);
      return;
    }
    openMenu();
  };

  const handleSectionLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    warmSectionImages(href);
    event.preventDefault();
    pendingSectionRef.current = href;
    closeMenu();
  };

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
                src="/images/optimized/footer/wds-logo.webp"
                alt=""
                width={120}
                height={32}
              />
            </a>
            <nav className={styles.links} aria-label="Page sections">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  className={styles.navLink}
                  href={href}
                  key={href}
                  onPointerEnter={() => warmSectionImages(href)}
                  onFocus={() => warmSectionImages(href)}
                  onClick={() => warmSectionImages(href)}
                >
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
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuVisible}
            aria-controls="navbar-mobile-menu"
            aria-label={menuVisible ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            <span className={styles.menuToggleBar} aria-hidden="true" />
            <span className={styles.menuToggleBar} aria-hidden="true" />
            <span className={styles.menuToggleBar} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="navbar-mobile-menu"
        className={styles.menuOverlay}
        data-open={menuOpen ? "" : undefined}
        data-closing={menuClosing ? "" : undefined}
        data-visible={menuVisible ? "" : undefined}
        aria-hidden={!menuVisible}
      >
        <div className={styles.menuPanel} ref={menuPanelRef}>
          <nav className={styles.menuLinks} aria-label="Page sections">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                className={styles.menuLink}
                href={href}
                key={href}
                onClick={(event) => handleSectionLink(event, href)}
                onPointerEnter={() => warmSectionImages(href)}
                onFocus={() => warmSectionImages(href)}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className={styles.menuFooter}>
            <nav className={styles.menuSocials} aria-label="Western Developers Society online">
              {SOCIAL_LINKS.map(({ name, href, icon, width, height }) => (
                <a
                  className={styles.menuSocial}
                  href={href}
                  key={name}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  onClick={closeMenu}
                >
                  <span className={styles.srOnly}>{name}</span>
                  <img className={styles.menuSocialIcon} src={icon} alt="" width={width} height={height} />
                </a>
              ))}
            </nav>
          </div>
        </div>
        <button
          type="button"
          className={styles.menuBackdrop}
          aria-label="Close menu"
          tabIndex={menuVisible ? 0 : -1}
          onClick={closeMenu}
        />
      </div>
    </header>
  );
}
