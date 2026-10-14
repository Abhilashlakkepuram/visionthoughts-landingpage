"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap, revealOnce } from "@/lib/useAnim";
import { Eyebrow, MaskedLines } from "@/components/ui/Type";
import { reasons } from "@/lib/site";
import { pulseStage } from "@/lib/stage";

export default function Why() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    registerGsap();
    const scope = root.current;
    if (!scope) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-why-row]").forEach((row, i) => {
        gsap.set(row, { yPercent: 55, opacity: 0 });
        revealOnce(row, "top 93%", () =>
          gsap.to(row, {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            ease: "expo.out",
            delay: i * 0.05,
          })
        );
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      data-chapter="why"
      aria-labelledby="why-heading"
      className="relative px-5 py-[14vh] md:px-10 md:py-[18vh]"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1500px]">
        <div className="flex flex-col gap-6">
          <Eyebrow>Why Vision Thoughts</Eyebrow>
          <MaskedLines
            id="why-heading"
            lines={["Six reasons clients", "stay with us."]}
            className="display-tight max-w-[20ch] text-[clamp(1.75rem,4vw,3.4rem)] font-semibold normal-case"
          />
        </div>

        <dl
          className="mt-[9vh] flex flex-col border-t border-bone/10"
          onMouseLeave={() => setActive(-1)}
        >
          {reasons.map((r, i) => {
            const on = active === i;
            return (
              <div
                key={r.word}
                data-why-row
                className="relative border-b border-bone/10"
                onMouseEnter={() => {
                  setActive(i);
                  pulseStage(0.2);
                }}
                data-cursor="list"
              >
                <div className="flex flex-col gap-2 py-6 md:flex-row md:items-baseline md:justify-between md:gap-10 md:py-8">
                  <dt
                    className={`display text-[clamp(1.9rem,6vw,5rem)] transition-colors duration-500 ${
                      on ? "text-ember" : "text-bone/50"
                    }`}
                  >
                    {r.word}
                  </dt>
                  <dd
                    className={`body-copy max-w-[34ch] text-[13px] transition-all duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:text-right md:text-sm ${
                      on
                        ? "translate-x-0 text-bone/85 opacity-100"
                        : "opacity-65 md:translate-x-5 md:opacity-40"
                    }`}
                  >
                    {r.claim}
                  </dd>
                </div>

                <span
                  aria-hidden="true"
                  className={`absolute bottom-[-1px] left-0 h-px bg-ember transition-[width] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    on ? "w-full" : "w-0"
                  }`}
                />
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
