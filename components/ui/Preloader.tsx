"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "@/lib/useAnim";

/**
 * A ~900ms curtain. It exists to hide font swap and shader compile, not to
 * make anyone wait — it lifts as soon as the first paint is stable.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const body = document.body;

    if (reduced) {
      setDone(true);
      window.dispatchEvent(new Event("vt:intro"));
      return;
    }

    window.scrollTo(0, 0);
    body.style.overflow = "hidden";

    const bars = el.querySelectorAll<HTMLElement>("[data-curtain]");
    const wordmark = el.querySelector<HTMLElement>("[data-wordmark]");
    const rule = el.querySelector<HTMLElement>("[data-rule]");

    const tl = gsap.timeline({
      onComplete: () => {
        body.style.overflow = "";
        setDone(true);
      },
    });

    tl.fromTo(
      wordmark,
      { opacity: 0, y: 14, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }
    )
      .fromTo(
        rule,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
        0.05
      )
      .to(wordmark, { opacity: 0, y: -10, duration: 0.35, ease: "power2.in" }, 0.8)
      .to(
        bars,
        {
          scaleY: 0,
          duration: 0.85,
          ease: "expo.inOut",
          stagger: { each: 0.055, from: "start" },
          onStart: () => window.dispatchEvent(new Event("vt:intro")),
        },
        0.75
      );

    return () => {
      body.style.overflow = "";
      tl.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            data-curtain
            className="h-full flex-1 origin-top bg-ink-950"
          />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <span
          data-wordmark
          className="font-mono text-[11px] uppercase tracking-[0.42em] text-bone"
        >
          Vision Thoughts
        </span>
        <span
          data-rule
          className="block h-px w-40 origin-left bg-linear-to-r from-ember to-transparent"
        />
      </div>
    </div>
  );
}
