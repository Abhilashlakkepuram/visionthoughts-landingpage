"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/useAnim";
import { stage, detectTier, clamp } from "@/lib/stage";

/**
 * Wires together smooth scrolling, ScrollTrigger and the global pointer, and
 * funnels all of it into the mutable `stage` object the WebGL layer reads.
 */
export default function StageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    registerGsap();

    const cleanups: (() => void)[] = [];

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    stage.reduced = reducedMq.matches;
    stage.tier = detectTier();

    /* ---------------- section measurement ---------------- */

    let bands: { top: number; height: number }[] = [];

    const measure = () => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-chapter]")
      );
      bands = nodes.map((n) => {
        const rect = n.getBoundingClientRect();
        return { top: rect.top + window.scrollY, height: rect.height || 1 };
      });
    };

    const computeChapter = (scrollY: number) => {
      if (!bands.length) return 0;
      const probe = scrollY + window.innerHeight * 0.5;
      for (let i = 0; i < bands.length; i++) {
        const b = bands[i];
        if (probe < b.top) return i;
        if (probe < b.top + b.height) {
          return i + clamp((probe - b.top) / b.height);
        }
      }
      return bands.length - 1;
    };

    const onScrollValue = (scrollY: number) => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      stage.scroll = clamp(scrollY / max);
      stage.chapter = computeChapter(scrollY);
    };

    /* ---------------- lenis ---------------- */

    let lenis: Lenis | null = null;
    const tick = (time: number) => lenis?.raf(time * 1000);

    if (!stage.reduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
        wheelMultiplier: 0.95,
      });

      lenis.on("scroll", (e: { scroll: number }) => {
        ScrollTrigger.update();
        onScrollValue(e.scroll);
      });

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    } else {
      const native = () => onScrollValue(window.scrollY);
      window.addEventListener("scroll", native, { passive: true });
      native();
      cleanups.push(() => window.removeEventListener("scroll", native));
    }

    /* ---------------- pointer ---------------- */

    const onPointer = (e: PointerEvent) => {
      stage.px = (e.clientX / window.innerWidth) * 2 - 1;
      stage.py = -((e.clientY / window.innerHeight) * 2 - 1);
      if (!stage.pointerActive) {
        stage.pointerActive = true;
        stage.pxEased = stage.px;
        stage.pyEased = stage.py;
      }
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    /* ---------------- lifecycle ---------------- */

    const onVisibility = () => {
      stage.visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      measure();
      onScrollValue(window.scrollY);
    };
    window.addEventListener("resize", onResize);

    const onReducedChange = () => {
      stage.reduced = reducedMq.matches;
    };
    reducedMq.addEventListener("change", onReducedChange);

    // Sections mount after this effect on first paint, so measure late too.
    measure();
    const raf1 = requestAnimationFrame(() => {
      measure();
      onScrollValue(window.scrollY);
      ScrollTrigger.refresh();
    });
    const settle = window.setTimeout(onResize, 600);
    ScrollTrigger.addEventListener("refresh", measure);

    return () => {
      cancelAnimationFrame(raf1);
      window.clearTimeout(settle);
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMq.removeEventListener("change", onReducedChange);
      gsap.ticker.remove(tick);
      lenis?.destroy();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return <>{children}</>;
}
