"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/useAnim";
import Cta from "@/components/ui/Cta";
import { site } from "@/lib/site";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const scope = root.current;
    if (!scope) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
      const soft = gsap.utils.toArray<HTMLElement>("[data-hero-soft]");
      const rule = scope.querySelector("[data-hero-rule]");

      if (reduced) {
        gsap.set([lines, soft], { clearProps: "all", opacity: 1, yPercent: 0 });
      } else {
        gsap.set(lines, { yPercent: 112, opacity: 0 });
        gsap.set(soft, { y: 22, opacity: 0 });
        gsap.set(rule, { scaleX: 0 });
      }

      let played = reduced;

      const play = () => {
        if (played) return;
        played = true;

        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(rule, { scaleX: 1, duration: 1.1 }, 0)
          .to(
            lines,
            { yPercent: 0, opacity: 1, duration: 1.25, stagger: 0.09 },
            0.05
          )
          .to(soft, { y: 0, opacity: 1, duration: 1, stagger: 0.09 }, 0.55);
      };

      window.addEventListener("vt:intro", play, { once: true });
      const fallback = window.setTimeout(play, 1800);

      /* Hero content drifts away as the next chapter arrives. */
      if (!reduced) {
        gsap.to("[data-hero-shift]", {
          yPercent: -18,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }

      return () => {
        window.removeEventListener("vt:intro", play);
        window.clearTimeout(fallback);
      };
    }, scope);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="top"
      data-chapter="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden px-5 pb-8 pt-28 md:px-10 md:pb-12"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-10 lg:max-w-[1500px]">
        <div data-hero-shift className="flex flex-col gap-8 md:gap-10">
          <div className="flex items-center gap-4">
            <span
              data-hero-rule
              aria-hidden="true"
              className="block h-px w-16 origin-left bg-ember md:w-24"
            />
            <span
              data-hero-soft
              className="label !tracking-[0.3em] text-mute"
            >
              Creative Digital Agency
            </span>
          </div>

          <h1
            id="hero-heading"
            className="display text-[clamp(2.35rem,7.6vw,7.1rem)] md:max-w-[11ch] lg:max-w-[12ch]"
          >
            <span className="sr-only">
              We turn ideas into digital experiences.
            </span>

            <span aria-hidden="true" className="line-mask">
              <span data-hero-line className="line-inner">
                We turn{" "}
                <span className="editorial font-normal normal-case text-ember">
                  ideas
                </span>
              </span>
            </span>
            <span aria-hidden="true" className="line-mask">
              <span data-hero-line className="line-inner">
                into digital
              </span>
            </span>
            <span aria-hidden="true" className="line-mask">
              <span data-hero-line className="line-inner">
                experiences<span className="text-ember">.</span>
              </span>
            </span>
          </h1>

          <div className="flex flex-col gap-9 md:flex-row md:items-end md:justify-between md:gap-16">
            <p
              data-hero-soft
              className="body-copy max-w-[42ch] text-[15px] md:text-base"
            >
              We design and build websites, stores and apps for businesses that
              want more than a page online — with design excellence, technical
              precision and measurable results.
            </p>

            <div
              data-hero-soft
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <Cta href="#contact" size="lg" label="Talk">
                Start a Project
                <span aria-hidden="true">→</span>
              </Cta>
              <Cta href="#services" variant="ghost" size="lg" label="See">
                Explore
              </Cta>
            </div>
          </div>
        </div>

        <div
          data-hero-soft
          className="mt-2 flex items-end justify-between border-t border-bone/10 pt-5"
        >
          <dl className="flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute-dim sm:text-[11px]">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Location</dt>
              <dd>{site.location}</dd>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <dt className="sr-only">Experience</dt>
              <dd>5+ Years</dd>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <dt className="sr-only">Client satisfaction</dt>
              <dd>100% Client Satisfaction</dd>
            </div>
          </dl>

          <a
            href="#manifesto"
            className="group flex shrink-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mute transition-colors duration-300 hover:text-bone sm:text-[11px]"
          >
            Scroll
            <span
              aria-hidden="true"
              className="relative block h-8 w-px overflow-hidden bg-bone/20"
            >
              <span className="absolute inset-x-0 top-0 h-3 animate-[scroll-cue_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-ember" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
