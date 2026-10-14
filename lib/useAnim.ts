"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

let registered = false;
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/** Scoped gsap.context that cleans itself up. */
export function useGsapScope<T extends HTMLElement>(
  setup: (ctx: { scope: T }) => void,
  deps: unknown[] = []
) {
  const ref = useRef<T | null>(null);

  useIsoLayoutEffect(() => {
    if (!ref.current) return;
    registerGsap();
    const scope = ref.current;
    const ctx = gsap.context(() => setup({ scope }), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/**
 * Play an entrance once, even if the visitor arrives already scrolled past it
 * (deep link, refresh with restored scroll, back-navigation). A plain
 * ScrollTrigger only fires while crossing the start line — this also checks
 * where we already are.
 */
export function revealOnce(
  trigger: Element,
  start: string,
  play: () => void
) {
  let played = false;
  const run = () => {
    if (played) return;
    played = true;
    play();
  };

  return ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: run,
    onRefresh: (self) => {
      if (self.progress > 0) run();
    },
  });
}

export { gsap, ScrollTrigger };
