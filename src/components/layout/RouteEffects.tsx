"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

const revealSelector = "section, footer";

/**
 * Přenáší chování původní SPA do App Routeru:
 *  - po přechodu na jinou stránku skočí na začátek a přesune fokus na obsah,
 *  - postupně odkrývá sekce při scrollování (třídy z globals.css).
 *
 * Komponenta nic nevykresluje, jen běží v prohlížeči.
 */
export function RouteEffects() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    document
      .querySelector<HTMLElement>("#main-content")
      ?.focus({ preventScroll: true });
  }, [pathname]);

  useLayoutEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector),
    );

    if (elements.length === 0) {
      return;
    }

    document.documentElement.classList.add("scroll-reveal-ready");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.dataset.reveal = "true";
        element.classList.add("is-revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      },
    );

    elements.forEach((element, index) => {
      element.dataset.reveal = "true";
      element.classList.remove("is-revealed");
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index, 4) * 80}ms`,
      );
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
