"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/useAnim";

/**
 * A two-part cursor: a precise dot that tracks 1:1 and a ring that lags and
 * swells over interactive elements. Desktop pointers only, and it removes
 * itself entirely under reduced-motion.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");
    gsap.set([dot, ring], { autoAlpha: 0, xPercent: -50, yPercent: -50 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    let shown = false;
    const onMove = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const setState = (
      scale: number,
      borderOpacity: number,
      text: string,
      dotScale = 1
    ) => {
      gsap.to(ring, {
        scale,
        borderColor: `rgba(255,107,61,${borderOpacity})`,
        duration: 0.45,
        ease: "expo.out",
      });
      gsap.to(dot, { scale: dotScale, duration: 0.35, ease: "expo.out" });
      if (label.textContent !== text) {
        gsap.to(label, {
          autoAlpha: text ? 1 : 0,
          duration: 0.2,
          onStart: () => {
            label.textContent = text;
          },
        });
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(
        "a, button, [data-cursor]"
      ) as HTMLElement | null;

      if (!target) {
        setState(1, 0.28, "");
        return;
      }
      const mode = target.dataset.cursor ?? "link";
      const text = target.dataset.cursorLabel ?? "";
      if (mode === "cta") setState(2.5, 0.9, text, text ? 0 : 0.4);
      else if (mode === "list") setState(2.1, 0.65, text, text ? 0 : 0.4);
      else setState(1.7, 0.6, "", 0.3);
    };

    const onDown = () => gsap.to(ring, { scale: "-=0.35", duration: 0.18 });
    const onUp = () => gsap.to(ring, { scale: "+=0.35", duration: 0.28 });
    const onLeave = () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
    const onEnter = () => gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      gsap.killTweensOf([dot, ring, label]);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-ember opacity-0"
      />
      <div
        ref={ringRef}
        className="fixed left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-bone/25 opacity-0"
      >
        <span
          ref={labelRef}
          className="font-mono text-[5px] font-medium uppercase tracking-[0.16em] text-bone opacity-0"
        />
      </div>
    </div>
  );
}
