"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, revealOnce } from "@/lib/useAnim";

const LEAD = ["We don't just", "build websites."];
const BODY =
  "We build digital experiences that move businesses forward — designed with intent, engineered to last, measured by what they return.";

export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const scope = root.current;
    if (!scope) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const leadLines = gsap.utils.toArray<HTMLElement>("[data-lead] .line-inner");
      const words = gsap.utils.toArray<HTMLElement>("[data-word]");

      if (reduced) {
        gsap.set(words, { opacity: 1 });
        gsap.set(leadLines, { yPercent: 0, opacity: 1 });
        return;
      }

      gsap.set(leadLines, { yPercent: 110, opacity: 0 });
      revealOnce(scope, "top 70%", () =>
        gsap.to(leadLines, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.1,
        })
      );

      // Words illuminate as the section is scrubbed through.
      gsap.set(words, { opacity: 0.12 });
      gsap.to(words, {
        opacity: 1,
        ease: "none",
        stagger: 0.5,
        scrollTrigger: {
          trigger: "[data-scrub-block]",
          start: "top 78%",
          end: "bottom 62%",
          scrub: 0.5,
        },
      });

      gsap.fromTo(
        "[data-drift]",
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="manifesto"
      data-chapter="statement"
      aria-labelledby="manifesto-heading"
      className="relative px-5 py-[16vh] md:px-10 md:py-[22vh]"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1500px]">
        <div data-drift className="flex flex-col gap-[10vh]">
          <h2
            id="manifesto-heading"
            data-lead
            className="display max-w-[14ch] text-[clamp(2.2rem,6.8vw,6.4rem)] text-mute-dim"
          >
            <span className="sr-only">
              We don&apos;t just build websites. {BODY}
            </span>
            {LEAD.map((line, i) => (
              <span key={i} aria-hidden="true" className="line-mask">
                <span className="line-inner">
                  {i === 1 ? (
                    <>
                      build <span className="text-bone">websites.</span>
                    </>
                  ) : (
                    line
                  )}
                </span>
              </span>
            ))}
          </h2>

          <div
            data-scrub-block
            className="flex justify-end"
            aria-hidden="true"
          >
            <p className="display-tight max-w-[19ch] text-balance text-[clamp(1.6rem,3.8vw,3.5rem)] font-semibold normal-case tracking-[-0.03em] text-bone md:max-w-[22ch]">
              {BODY.split(" ").map((w, i) => (
                <span key={i} data-word className="inline-block">
                  {w === "—" ? (
                    <span className="text-ember">{w}</span>
                  ) : w === "forward" ? (
                    <span className="editorial text-ember">{w}</span>
                  ) : (
                    w
                  )}
                  {" "}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
