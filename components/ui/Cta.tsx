"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/useAnim";
import { pulseStage } from "@/lib/stage";

type Props = {
  href: string;
  children: React.ReactNode;
  /** `solid` is the hero/climax button, `ghost` the quieter one. */
  variant?: "solid" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  magnetic?: boolean;
  label?: string;
};

const sizes = {
  sm: "px-4 py-2 text-[10px] sm:px-5 sm:text-[11px]",
  md: "px-6 py-3.5 text-[11px]",
  lg: "px-8 py-4 text-xs sm:px-10 sm:py-5 sm:text-[13px]",
};

/**
 * One button, used everywhere: a sweep fill on hover plus an optional
 * magnetic pull. Both are motion-safe and purely decorative — the anchor
 * works untouched with a keyboard.
 */
export default function Cta({
  href,
  children,
  variant = "solid",
  size = "md",
  className = "",
  magnetic = true,
  label,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !magnetic) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const inner = el.querySelector<HTMLElement>("[data-magnet-inner]");
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "expo.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "expo.out" });
    const ixTo = inner
      ? gsap.quickTo(inner, "x", { duration: 0.8, ease: "expo.out" })
      : null;
    const iyTo = inner
      ? gsap.quickTo(inner, "y", { duration: 0.8, ease: "expo.out" })
      : null;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * 0.22);
      yTo(dy * 0.34);
      ixTo?.(dx * 0.08);
      iyTo?.(dy * 0.12);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    };
    const onEnter = () => pulseStage(0.35);

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerenter", onEnter);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerenter", onEnter);
      gsap.killTweensOf([el, inner].filter(Boolean) as HTMLElement[]);
    };
  }, [magnetic]);

  const solid = variant === "solid";

  return (
    <a
      ref={ref}
      href={href}
      data-cursor="cta"
      data-cursor-label={label}
      className={[
        "group/cta relative isolate inline-flex items-center gap-3 overflow-hidden rounded-full border font-mono uppercase tracking-[0.2em] transition-colors duration-500",
        solid
          ? "border-ember/60 text-ink-950"
          : "border-bone/20 text-bone hover:border-bone/45",
        sizes[size],
        className,
      ].join(" ")}
    >
      {solid && <span className="absolute inset-0 -z-20 bg-ember" />}
      <span
        aria-hidden="true"
        className={[
          "absolute inset-0 -z-10 translate-y-full transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-y-0 group-focus-visible/cta:translate-y-0",
          solid ? "bg-bone" : "bg-ember",
        ].join(" ")}
      />
      <span
        data-magnet-inner
        className={[
          "relative z-10 flex items-center gap-3 transition-colors duration-500",
          solid ? "" : "group-hover/cta:text-ink-950 group-focus-visible/cta:text-ink-950",
        ].join(" ")}
      >
        {children}
      </span>
    </a>
  );
}
