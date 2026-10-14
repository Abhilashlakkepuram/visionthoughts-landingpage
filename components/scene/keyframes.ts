import { lerp } from "@/lib/stage";

/** sRGB triples, written straight to the framebuffer by the raw shaders. */
export const palette = {
  cool: [0.44, 0.5, 0.64] as const,
  hot: [1.0, 0.42, 0.24] as const,
  ember: [1.0, 0.42, 0.24] as const,
  rim: [0.38, 0.5, 0.95] as const,
  bone: [0.93, 0.93, 0.94] as const,
};

export type Keyframe = {
  /** Camera position. */
  cam: [number, number, number];
  /** Where the scene group sits, in world units. */
  offset: [number, number, number];
  /** Resting rotation of the whole scene group. */
  rot: [number, number];
  /** Which formation the lattice settles on, 0 → 3. */
  morph: number;
  /** Uniform scale of the lattice. */
  spread: number;
  /** Idle-motion amount. */
  energy: number;
  /** Overall presence of the scene behind the content. */
  opacity: number;
  /** How much ember bleeds into the field. */
  heat: number;
  /** Pointer repulsion strength. */
  pointerForce: number;
  /** Ribbon signal speed. */
  ribbonSpeed: number;
};

/**
 * One keyframe per chapter of the page. `stage.chapter` is a float, so the
 * scene is always somewhere between two of these — the 3D never cuts, it
 * travels.
 *
 * 0 hero · 1 statement · 2 services · 3 identity · 4 why · 5 cta · 6 footer
 */
export const keyframes: Keyframe[] = [
  {
    cam: [0, 0, 6.6],
    offset: [2.15, 0.25, 0],
    rot: [0.0, 0.0],
    morph: 0.1,
    spread: 1.0,
    energy: 1.0,
    opacity: 1.0,
    heat: 0.11,
    pointerForce: 0.28,
    ribbonSpeed: 0.055,
  },
  {
    cam: [0, 0.3, 8.6],
    offset: [-0.35, 1.15, -1.6],
    rot: [0.14, 0.75],
    morph: 0.98,
    spread: 1.08,
    energy: 0.65,
    opacity: 0.3,
    heat: 0.0,
    pointerForce: 0.07,
    ribbonSpeed: 0.04,
  },
  {
    cam: [0, -0.05, 6.2],
    offset: [-1.85, -1.0, -0.8],
    rot: [-0.1, 1.4],
    morph: 1.72,
    spread: 0.78,
    energy: 1.0,
    opacity: 0.42,
    heat: 0.1,
    pointerForce: 0.15,
    ribbonSpeed: 0.07,
  },
  {
    cam: [0, 0.15, 7.6],
    offset: [-2.9, -0.8, -1.0],
    rot: [0.2, 2.1],
    morph: 2.18,
    spread: 0.98,
    energy: 0.6,
    opacity: 0.44,
    heat: 0.04,
    pointerForce: 0.07,
    ribbonSpeed: 0.045,
  },
  {
    cam: [0, -0.2, 8.4],
    offset: [-3.6, -0.55, -2.8],
    rot: [-0.16, 2.8],
    morph: 2.6,
    spread: 1.12,
    energy: 0.8,
    opacity: 0.26,
    heat: 0.08,
    pointerForce: 0.09,
    ribbonSpeed: 0.05,
  },
  {
    cam: [0, 0.05, 5.4],
    offset: [0, -0.2, -0.3],
    rot: [0.05, 3.5],
    morph: 3.0,
    spread: 1.0,
    energy: 1.3,
    opacity: 0.8,
    heat: 0.2,
    pointerForce: 0.6,
    ribbonSpeed: 0.11,
  },
  {
    cam: [0, 0.75, 9.8],
    offset: [0, -1.4, -2.6],
    rot: [0.2, 3.9],
    morph: 3.0,
    spread: 1.2,
    energy: 0.45,
    opacity: 0.14,
    heat: 0.04,
    pointerForce: 0.0,
    ribbonSpeed: 0.03,
  },
];

/** A distinct scene pose for every service in the list. */
export const servicePoses = [
  { morph: 1.0, rot: [0.16, 0.35] as const, heat: 0.18, spread: 0.76 },
  { morph: 2.0, rot: [-0.1, 1.5] as const, heat: 0.14, spread: 0.82 },
  { morph: 2.42, rot: [0.22, 2.6] as const, heat: 0.24, spread: 0.8 },
  { morph: 1.42, rot: [-0.24, 0.9] as const, heat: 0.12, spread: 0.72 },
  { morph: 3.0, rot: [0.08, 3.2] as const, heat: 0.3, spread: 0.82 },
  { morph: 0.5, rot: [-0.05, 2.0] as const, heat: 0.08, spread: 0.9 },
];

/** Live per-frame scene values — written by the rig, read by everything else. */
export const frame = {
  time: 0,
  morph: 0.12,
  spread: 1,
  energy: 1,
  opacity: 0,
  heat: 0,
  pointerForce: 0,
  ribbonSpeed: 0.05,
  dissolve: 1,
  reveal: 0,
  pointer: [0, 0, 0] as [number, number, number],
};

export function sampleKeyframes(chapter: number): Keyframe {
  const max = keyframes.length - 1;
  const c = chapter < 0 ? 0 : chapter > max ? max : chapter;
  const i = Math.floor(c);
  const j = Math.min(max, i + 1);

  // Hold the chapter's pose for most of the section, then travel to the next
  // one near the boundary. A straight lerp would leave the scene permanently
  // in transit and never actually composed with the content.
  const raw = c - i;
  const eased = Math.min(1, Math.max(0, (raw - 0.5) / 0.42));
  const t = eased * eased * (3 - 2 * eased);

  const a = keyframes[i];
  const b = keyframes[j];

  return {
    cam: [
      lerp(a.cam[0], b.cam[0], t),
      lerp(a.cam[1], b.cam[1], t),
      lerp(a.cam[2], b.cam[2], t),
    ],
    offset: [
      lerp(a.offset[0], b.offset[0], t),
      lerp(a.offset[1], b.offset[1], t),
      lerp(a.offset[2], b.offset[2], t),
    ],
    rot: [lerp(a.rot[0], b.rot[0], t), lerp(a.rot[1], b.rot[1], t)],
    morph: lerp(a.morph, b.morph, t),
    spread: lerp(a.spread, b.spread, t),
    energy: lerp(a.energy, b.energy, t),
    opacity: lerp(a.opacity, b.opacity, t),
    heat: lerp(a.heat, b.heat, t),
    pointerForce: lerp(a.pointerForce, b.pointerForce, t),
    ribbonSpeed: lerp(a.ribbonSpeed, b.ribbonSpeed, t),
  };
}
