"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, revealOnce } from "@/lib/useAnim";
import Cta from "@/components/ui/Cta";
import { site } from "@/lib/site";

export default function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const scope = root.current;
    if (!scope) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const inners = gsap.utils.toArray<HTMLElement>("[data-cta-line] .line-inner");
      const soft = gsap.utils.toArray<HTMLElement>("[data-cta-soft]");

      gsap.set(inners, { yPercent: 115, opacity: 0 });
      gsap.set(soft, { y: 28, opacity: 0 });

      revealOnce(scope, "top 65%", () => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(inners, { yPercent: 0, opacity: 1, duration: 1.3, stagger: 0.1 })
          .to(soft, { y: 0, opacity: 1, duration: 1, stagger: 0.09 }, 0.5);
      });

      gsap.fromTo(
        "[data-cta-glow]",
        { scale: 0.85, opacity: 0.25 },
        {
          scale: 1.15,
          opacity: 0.7,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="contact"
      data-chapter="cta"
      aria-labelledby="cta-heading"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-[12vh] text-center md:px-10"
    >
      <div
        data-cta-glow
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,107,61,0.14),transparent_62%)] blur-[2px]"
      />

      {/* Keeps the copy readable where the field is at its densest. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[64rem] max-w-[115vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(8,8,10,0.82),rgba(8,8,10,0.55)_55%,transparent_100%)]"
      />

      <div className="relative z-10 flex w-full max-w-[1200px] flex-col items-center gap-7 sm:gap-9">
        <p data-cta-soft className="label !tracking-[0.34em]">
          Let&apos;s begin
        </p>

        <h2
          id="cta-heading"
          data-cta-line
          className="display text-[clamp(2.3rem,7.4vw,6.6rem)]"
        >
          <span className="sr-only">
            Ready to build something extraordinary?
          </span>
          {["Ready to", "build something"].map((line) => (
            <span key={line} aria-hidden="true" className="line-mask">
              <span className="line-inner">{line}</span>
            </span>
          ))}
          <span aria-hidden="true" className="line-mask">
            <span className="line-inner">
              <span className="editorial text-ember">extraordinary</span>
              <span className="text-ember">?</span>
            </span>
          </span>
        </h2>

        <p
          data-cta-soft
          className="body-copy max-w-[48ch] text-[15px] md:text-base"
        >
          Tell us what you&apos;re building. We&apos;ll come back with a clear
          plan, a realistic timeline and transparent pricing.
        </p>

        <div data-cta-soft>
          <Cta href={`mailto:${site.email}`} size="lg" label="Email">
            Start a Project
            <span aria-hidden="true">→</span>
          </Cta>
        </div>

        <ul
          data-cta-soft
          className="flex flex-col items-center gap-4 pt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/70 sm:flex-row sm:gap-10"
        >
          <li>
            <a
              href={`mailto:${site.email}`}
              className="transition-colors duration-300 hover:text-ember"
            >
              {site.email}
            </a>
          </li>
          <li aria-hidden="true" className="hidden h-3 w-px bg-bone/15 sm:block" />
          <li>
            <a
              href={`tel:${site.phoneHref}`}
              className="transition-colors duration-300 hover:text-ember"
            >
              {site.phone}
            </a>
          </li>
          <li aria-hidden="true" className="hidden h-3 w-px bg-bone/15 sm:block" />
          <li>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-ember"
            >
              WhatsApp
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
