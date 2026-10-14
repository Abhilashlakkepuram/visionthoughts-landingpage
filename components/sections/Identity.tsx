"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, revealOnce } from "@/lib/useAnim";
import { Eyebrow } from "@/components/ui/Type";
import { stats } from "@/lib/site";

export default function Identity() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const scope = root.current;
    if (!scope) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const inners = gsap.utils.toArray<HTMLElement>("[data-id-line] .line-inner");
      gsap.set(inners, { yPercent: 112, opacity: 0 });
      revealOnce(scope, "top 70%", () =>
        gsap.to(inners, {
          yPercent: 0,
          opacity: 1,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.08,
        })
      );

      gsap.fromTo(
        "[data-id-aside]",
        { y: 70 },
        {
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.9,
          },
        }
      );
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="studio"
      data-chapter="identity"
      aria-labelledby="studio-heading"
      className="relative px-5 py-[16vh] md:px-10 md:py-[22vh]"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1500px]">
        <Eyebrow className="mb-[8vh]">The studio</Eyebrow>

        <div className="grid gap-[9vh] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start lg:gap-20">
          <h2
            id="studio-heading"
            data-id-line
            className="display text-[clamp(2rem,5.4vw,5.1rem)]"
          >
            <span className="sr-only">
              Vision Thoughts is where creativity meets technology.
            </span>
            {["Vision Thoughts", "is where"].map((line) => (
              <span key={line} aria-hidden="true" className="line-mask">
                <span className="line-inner">{line}</span>
              </span>
            ))}
            <span aria-hidden="true" className="line-mask">
              <span className="line-inner">
                <span className="editorial text-ember">creativity</span> meets
              </span>
            </span>
            <span aria-hidden="true" className="line-mask">
              <span className="line-inner">technology.</span>
            </span>
          </h2>

          <div data-id-aside className="flex flex-col gap-10 lg:pt-6">
            <p className="body-copy max-w-[42ch] text-[15px] md:text-base">
              Vision Thoughts is a creative digital agency specialising in web
              design, web development, e-commerce solutions, mobile app
              development, digital marketing and web hosting. We help businesses
              transform their ideas into successful digital products — with a
              focus on design excellence, technical precision and measurable
              results.
            </p>

            <p className="body-copy max-w-[42ch] text-[15px] text-mute-dim md:text-base">
              From the first discovery call to post-launch support, we&apos;re
              committed to your business success every step of the way.
            </p>

            <dl className="grid grid-cols-3 gap-4 border-t border-bone/10 pt-8">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-2">
                  <dt className="font-mono text-[9px] uppercase leading-[1.5] tracking-[0.18em] text-mute-dim sm:text-[10px]">
                    {s.label}
                  </dt>
                  <dd className="display-tight text-[clamp(1.6rem,3.2vw,2.6rem)] font-bold text-bone">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
