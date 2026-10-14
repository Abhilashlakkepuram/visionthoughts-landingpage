"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, registerGsap, revealOnce } from "@/lib/useAnim";
import { stage, pulseStage } from "@/lib/stage";
import { services } from "@/lib/site";
import { Eyebrow, MaskedLines } from "@/components/ui/Type";

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);
  const [pinned, setPinned] = useState(-1);
  const focusTween = useRef<ReturnType<typeof gsap.to> | null>(null);

  const current = active >= 0 ? active : pinned;

  /** Push the selection into the WebGL layer. */
  const drive = useCallback((index: number) => {
    focusTween.current?.kill();
    if (index >= 0) {
      stage.service = index;
      focusTween.current = gsap.to(stage, {
        serviceFocus: 1,
        duration: 0.7,
        ease: "power3.out",
        overwrite: true,
      });
    } else {
      focusTween.current = gsap.to(stage, {
        serviceFocus: 0,
        duration: 0.9,
        ease: "power2.inOut",
        overwrite: true,
        onComplete: () => {
          stage.service = -1;
        },
      });
    }
  }, []);

  useEffect(() => {
    drive(current);
  }, [current, drive]);

  useEffect(() => {
    return () => {
      focusTween.current?.kill();
      stage.service = -1;
      stage.serviceFocus = 0;
    };
  }, []);

  useEffect(() => {
    registerGsap();
    const scope = root.current;
    if (!scope) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row, i) => {
        gsap.set(row, { yPercent: 40, opacity: 0 });
        revealOnce(row, "top 92%", () =>
          gsap.to(row, {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            ease: "expo.out",
            delay: i * 0.055,
          })
        );
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="services"
      data-chapter="services"
      aria-labelledby="services-heading"
      className="relative px-5 py-[14vh] md:px-10 md:py-[18vh]"
    >
      {/* Background responds to the active service. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700"
        style={{
          opacity: current >= 0 ? 1 : 0,
          background: `radial-gradient(38rem 26rem at ${
            12 + current * 14
          }% ${28 + current * 9}%, rgba(255,107,61,0.085), transparent 70%)`,
          transitionProperty: "opacity, background",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1500px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6">
            <Eyebrow>What we do</Eyebrow>
            <MaskedLines
              id="services-heading"
              lines={["Six disciplines,", "one delivery team."]}
              className="display-tight max-w-[18ch] text-[clamp(1.75rem,4vw,3.4rem)] font-semibold normal-case"
            />
          </div>
          <p
            data-reveal=""
            className="body-copy max-w-[34ch] text-sm md:text-right"
          >
            Everything a business needs to launch, sell and grow online — built
            by one team, under one roof.
          </p>
        </div>

        <div className="mt-[9vh] grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
          {/* ---------------- the list ---------------- */}
          <ul
            className="flex flex-col border-t border-bone/10"
            onMouseLeave={() => setActive(-1)}
          >
            {services.map((service, i) => {
              const isOpen = current === i;
              return (
                <li
                  key={service.index}
                  data-row
                  className="relative border-b border-bone/10"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`service-panel-${service.index}`}
                    data-cursor="list"
                    data-cursor-label="View"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(-1)}
                    onClick={() => {
                      setPinned((p) => (p === i ? -1 : i));
                      pulseStage(0.5);
                    }}
                    className="group/row relative flex w-full items-center gap-5 py-5 text-left transition-colors duration-500 md:gap-8 md:py-7"
                  >
                    <span
                      aria-hidden="true"
                      className={`shrink-0 font-mono text-[10px] tabular-nums tracking-[0.2em] transition-colors duration-500 md:text-xs ${
                        isOpen ? "text-ember" : "text-mute-dim"
                      }`}
                    >
                      {service.index}
                    </span>

                    {/* two stacked copies: the ember one rises on hover */}
                    <span className="relative block flex-1 overflow-hidden">
                      <span
                        className={`display-tight block text-[clamp(1.35rem,3.5vw,3.05rem)] font-bold uppercase transition-[transform,color] duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isOpen
                            ? "-translate-y-full text-bone"
                            : "translate-y-0 text-bone/55"
                        }`}
                      >
                        {service.name}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`display-tight absolute inset-0 block text-[clamp(1.35rem,3.5vw,3.05rem)] font-bold uppercase text-ember transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isOpen ? "translate-y-0" : "translate-y-full"
                        }`}
                      >
                        {service.name}
                      </span>
                    </span>

                    <span
                      aria-hidden="true"
                      className={`hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-500 md:block ${
                        isOpen
                          ? "translate-x-0 text-mute opacity-100"
                          : "-translate-x-3 opacity-0"
                      }`}
                    >
                      {service.short}
                    </span>

                    <span
                      aria-hidden="true"
                      className={`shrink-0 text-lg transition-all duration-500 ${
                        isOpen
                          ? "rotate-45 text-ember"
                          : "rotate-0 text-mute-dim"
                      }`}
                    >
                      +
                    </span>

                    <span
                      aria-hidden="true"
                      className={`absolute bottom-[-1px] left-0 h-px bg-ember transition-[width] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isOpen ? "w-full" : "w-0"
                      }`}
                    />
                  </button>

                  {/* inline detail — the mobile/tablet presentation */}
                  <div
                    id={`service-panel-${service.index}`}
                    role="region"
                    aria-label={service.name}
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:pointer-events-none lg:absolute lg:left-0 lg:-z-10 lg:w-px lg:opacity-0 ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <p className="body-copy pb-6 pl-[calc(10px+1.25rem)] text-sm">
                        {service.description}
                      </p>
                      <ul className="flex flex-wrap gap-2 pb-7 pl-[calc(10px+1.25rem)]">
                        {service.facets.map((f) => (
                          <li
                            key={f}
                            className="rounded-full border border-bone/15 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-mute"
                          >
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ---------------- the desktop detail panel ---------------- */}
          <aside className="relative hidden lg:block" aria-hidden="true">
            <div className="sticky top-32">
              <div className="relative min-h-[17rem] border-l border-bone/10 pl-8">
                {services.map((service, i) => (
                  <div
                    key={service.index}
                    className={`absolute inset-0 pl-8 transition-all duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      current === i
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-4 opacity-0"
                    }`}
                  >
                    <span className="label !text-ember">{service.index}</span>
                    <p className="body-copy mt-5 text-[15px] leading-[1.65] text-bone/75">
                      {service.description}
                    </p>
                    <ul className="mt-7 flex flex-col gap-2.5 border-t border-bone/10 pt-6">
                      {service.facets.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mute"
                        >
                          <span className="h-px w-4 bg-ember/70" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div
                  className={`absolute inset-0 pl-8 transition-opacity duration-500 ${
                    current < 0 ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <p className="body-copy max-w-[26ch] text-[15px] leading-[1.65]">
                    Hover a discipline to see how we approach it — the scene
                    behind responds with it.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
