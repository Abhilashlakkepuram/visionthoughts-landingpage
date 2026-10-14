/**
 * The four states of the Vision Thoughts lattice.
 *
 * Every point in the field carries all four positions as vertex attributes, so
 * the GPU can morph the whole population between them for free:
 *
 *   0 · IDEA        a swirling lens of unformed thought
 *   1 · DESIGN      that cloud snapped onto a warped blueprint grid
 *   2 · TECHNOLOGY  re-threaded into a continuous (3,4) torus-knot filament
 *   3 · GROWTH      released into an ascending, widening spiral
 *
 * None of the four is a sphere — the silhouette has to change between
 * chapters, or the morph reads as one object spinning.
 */

const TAU = Math.PI * 2;

/** Deterministic PRNG so the scene is identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Formations = {
  count: number;
  pos0: Float32Array;
  pos1: Float32Array;
  pos2: Float32Array;
  pos3: Float32Array;
  seed: Float32Array;
  scale: Float32Array;
};

/** Signed pow that keeps the sign of the input. */
const spow = (v: number, e: number) => Math.sign(v) * Math.pow(Math.abs(v), e);

export function buildFormations(count: number): Formations {
  const rnd = mulberry32(0x5eed1a);

  const pos0 = new Float32Array(count * 3);
  const pos1 = new Float32Array(count * 3);
  const pos2 = new Float32Array(count * 3);
  const pos3 = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const scale = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const s = rnd();
    seed[i] = s;
    // A handful of larger "bright motes" carry the composition.
    scale[i] = 0.4 + Math.pow(rnd(), 4.0) * 3.0;

    /* ---- 0 · IDEA : a swirled lens of thought, flat and wide ---- */
    const theta = rnd() * TAU;
    const phi = Math.acos(2 * rnd() - 1);
    const r = 2.1 * Math.pow(rnd(), 0.45);
    const sp = Math.sin(phi);
    const x = r * sp * Math.cos(theta) * 1.5;
    const y = r * Math.cos(phi) * 0.4;
    const z = r * sp * Math.sin(theta) * 0.95;
    // swirl: the further out, the more it has turned
    const swirl = r * 0.95;
    const cs = Math.cos(swirl);
    const sn = Math.sin(swirl);
    pos0[i3] = x * cs - z * sn;
    pos0[i3 + 1] = y + Math.sin(theta * 2.0) * 0.3 * (r / 2.1);
    pos0[i3 + 2] = x * sn + z * cs;

    /* ---- 1 · DESIGN : a warped blueprint grid, drawn in points ---- */
    // Points ride the *lines* of the grid, not the cells, so it reads as
    // drafting structure rather than a wall of dots.
    const LINES = 15;
    const band = ((i * 7919) % LINES) / (LINES - 1) - 0.5;
    const along = ((i * 104729) % 1013) / 1012 - 0.5;
    const horizontal = i % 2 === 0;
    const gx = (horizontal ? along : band) * 5.9;
    const gy = (horizontal ? band : along) * 3.9;
    const gz = Math.sin(gx * 0.72) * 0.55 + Math.cos(gy * 0.86) * 0.48;
    const cell = 0.045;
    pos1[i3] = Math.round(gx / cell) * cell;
    pos1[i3 + 1] = Math.round(gy / cell) * cell;
    pos1[i3 + 2] = gz;

    /* ---- 2 · TECHNOLOGY : a (3,4) torus-knot filament ---- */
    const p = 3;
    const qk = 4;
    const u = (i / count) * TAU * p;
    const quop = (qk / p) * u;
    const ring = 2 + Math.cos(quop);
    const knotScale = 0.78;
    // Most points ride the filament; a minority float off it as data motes.
    const off = s > 0.86 ? 0.55 : 0.07;
    pos2[i3] = ring * 0.5 * Math.cos(u) * knotScale + (rnd() - 0.5) * off;
    pos2[i3 + 1] = ring * 0.5 * Math.sin(u) * knotScale * 0.9 + (rnd() - 0.5) * off;
    pos2[i3 + 2] = Math.sin(quop) * 0.62 * knotScale + (rnd() - 0.5) * off;

    /* ---- 3 · GROWTH : an ascending, widening spiral ---- */
    const t = i / count;
    const turns = 4.25;
    const a = t * turns * TAU;
    const rad = 0.22 + Math.pow(t, 0.72) * 2.0;
    const stray = s > 0.9 ? (rnd() - 0.5) * 1.1 : (rnd() - 0.5) * 0.14;
    pos3[i3] = Math.cos(a) * rad + stray;
    pos3[i3 + 1] = -2.3 + t * 4.5 + (rnd() - 0.5) * 0.18;
    pos3[i3 + 2] = Math.sin(a) * rad + stray;

    // Keep the grid from feeling machine-perfect.
    pos1[i3] += spow(rnd() - 0.5, 3) * 0.04;
    pos1[i3 + 1] += spow(rnd() - 0.5, 3) * 0.04;
  }

  return { count, pos0, pos1, pos2, pos3, seed, scale };
}

/**
 * The path the ribbons follow — a helix that leans through the core, sampled
 * into control points for a closed Catmull-Rom curve.
 */
export function ribbonPath(index: number, total: number, samples = 12) {
  const pts: [number, number, number][] = [];
  const phase = (index / total) * TAU;
  const lean = 0.35 + (index % 3) * 0.22;
  const radius = 1.45 + (index % 4) * 0.42;
  const rise = 0.9 + (index % 2) * 0.55;

  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * TAU;
    const wob = 1 + Math.sin(t * 3 + phase) * 0.18;
    pts.push([
      Math.cos(t + phase) * radius * wob,
      Math.sin(t * 2 + phase) * rise * 0.5 + Math.sin(t + phase) * lean,
      Math.sin(t + phase) * radius * wob * 0.82,
    ]);
  }
  return pts;
}
