/**
 * A tiny mutable store shared between the DOM layer and the WebGL layer.
 *
 * The 3D scene reads these values inside the render loop, so writing to them
 * must never trigger a React render — that is the entire point of this module.
 */

export type Tier = "high" | "mid" | "low";

export type Stage = {
  /** Total document scroll progress, 0 → 1. */
  scroll: number;
  /** Smoothed scroll used by the scene so lag feels intentional. */
  scrollEased: number;
  /** Continuous section position, 0 = hero … 6 = footer. */
  chapter: number;
  /** Raw pointer in normalised device coords, -1 → 1. */
  px: number;
  py: number;
  /** Damped pointer — what the camera actually follows. */
  pxEased: number;
  pyEased: number;
  /** Pointer has been seen at least once (avoids a snap on first move). */
  pointerActive: boolean;
  /** Intro reveal, 0 → 1. */
  intro: number;
  /** Index of the hovered/selected service, -1 when none. */
  service: number;
  /** How strongly the services chapter is driving the scene, 0 → 1. */
  serviceFocus: number;
  /** Extra energy injected by clicks / CTA hovers, decays to 0. */
  pulse: number;
  /** Device capability tier. */
  tier: Tier;
  /** prefers-reduced-motion. */
  reduced: boolean;
  /** Tab is visible — the loop parks itself when it is not. */
  visible: boolean;
};

export const stage: Stage = {
  scroll: 0,
  scrollEased: 0,
  chapter: 0,
  px: 0,
  py: 0,
  pxEased: 0,
  pyEased: 0,
  pointerActive: false,
  intro: 0,
  service: -1,
  serviceFocus: 0,
  pulse: 0,
  tier: "high",
  reduced: false,
  visible: true,
};

/** Frame-rate independent damping. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export const clamp = (v: number, min = 0, max = 1) =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smoothstep with an explicit range. */
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function pulseStage(amount = 1) {
  stage.pulse = Math.min(1.6, stage.pulse + amount);
}

/** Resolve the device tier once, on the client. */
export function detectTier(): Tier {
  if (typeof window === "undefined") return "high";

  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const lowMemory =
    "deviceMemory" in navigator &&
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory ===
      "number" &&
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4;

  if (w < 768 || (coarse && w < 1024) || cores <= 4 || lowMemory) return "low";
  if (w < 1280 || cores <= 8) return "mid";
  return "high";
}

export const TIER_SETTINGS: Record<
  Tier,
  {
    particles: number;
    ribbons: number;
    dpr: [number, number];
    shellDetail: number;
    dustLayers: number;
  }
> = {
  high: { particles: 7000, ribbons: 5, dpr: [1, 1.6], shellDetail: 3, dustLayers: 3 },
  mid: { particles: 4200, ribbons: 4, dpr: [1, 1.35], shellDetail: 3, dustLayers: 2 },
  low: { particles: 1800, ribbons: 3, dpr: [1, 1.2], shellDetail: 2, dustLayers: 1 },
};
