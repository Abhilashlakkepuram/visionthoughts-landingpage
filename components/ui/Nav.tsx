"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { stage } from "@/lib/stage";
import { site } from "@/lib/site";
import Cta from "./Cta";

const links = [
  { href: "#services", label: "Services" },
  { href: "#studio", label: "Studio" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const barRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    let condensed = false;

    const loop = () => {
      const bar = barRef.current;
      if (bar) bar.style.transform = `scaleX(${stage.scroll})`;

      const next = stage.scroll > 0.015;
      if (next !== condensed) {
        condensed = next;
        const el = shellRef.current;
        if (el) {
          if (condensed) el.setAttribute("data-condensed", "");
          else el.removeAttribute("data-condensed");
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <header
      ref={shellRef}
      className="group/nav fixed inset-x-0 top-0 z-50 transition-colors duration-500 data-[condensed]:bg-ink-950/60 data-[condensed]:backdrop-blur-xl"
    >
      <div
        aria-hidden="true"
        ref={barRef}
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ember/70 opacity-0 transition-opacity duration-500 group-data-[condensed]/nav:opacity-100"
      />

      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 transition-[padding] duration-500 group-data-[condensed]/nav:py-3.5 md:px-10">
        <a
          href="#top"
          className="group/brand flex items-center gap-3"
          aria-label={`${site.name} — back to top`}
        >
          <Image
            src="/vt_logo_transparent.png"
            alt=""
            width={601}
            height={381}
            priority
            className="h-6 w-auto shrink-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/brand:scale-110 sm:h-7"
          />
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-bone sm:text-[11px] sm:tracking-[0.3em]">
            Vision<span className="text-mute-dim">/</span>Thoughts
          </span>
        </a>

        <nav aria-label="Page sections" className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group/link relative font-mono text-[11px] uppercase tracking-[0.22em] text-mute transition-colors duration-300 hover:text-bone"
            >
              {l.label}
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-px w-0 bg-ember transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:w-full"
              />
            </a>
          ))}
        </nav>

        <Cta href="#contact" variant="ghost" size="sm" magnetic={false}>
          <span className="hidden sm:inline">Start a Project</span>
          <span className="sm:hidden">Enquire</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ember" />
        </Cta>
      </div>
    </header>
  );
}
