"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, registerGsap, revealOnce } from "@/lib/useAnim";

/**
 * One global pass that wires every `[data-lines]` heading and `[data-reveal]`
 * element into ScrollTrigger, so sections stay declarative.
 *
 * Under reduced-motion nothing animates — elements are simply visible.
 */
export default function ScrollReveals() {
  useEffect(() => {
    registerGsap();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      document
        .querySelectorAll<HTMLElement>("[data-lines]")
        .forEach((heading) => {
          const inners = heading.querySelectorAll<HTMLElement>(".line-inner");
          gsap.set(inners, { yPercent: 108, opacity: 0 });
          revealOnce(heading, "top 86%", () =>
            gsap.to(inners, {
              yPercent: 0,
              opacity: 1,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.085,
            })
          );
        });

      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => {
          const delay = Number(el.dataset.revealDelay ?? 0);
          gsap.set(el, { y: 26, opacity: 0 });
          revealOnce(el, "top 90%", () =>
            gsap.to(el, { y: 0, opacity: 1, duration: 1, delay, ease: "expo.out" })
          );
        });
    });

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, []);

  return null;
}
