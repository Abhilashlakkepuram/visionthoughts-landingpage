export const latticeVertex = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uSize;
  uniform float uEnergy;
  uniform float uSpread;
  uniform float uDissolve;
  uniform float uHeat;
  uniform vec3  uPointer;
  uniform float uPointerForce;
  uniform float uPixelRatio;

  attribute vec3  aPos0;
  attribute vec3  aPos1;
  attribute vec3  aPos2;
  attribute vec3  aPos3;
  attribute float aSeed;
  attribute float aScale;

  varying float vHot;
  varying float vFade;
  varying float vTwinkle;

  const float PI = 3.141592653589793;

  vec3 formation(float m) {
    float f = clamp(m, 0.0, 3.0);
    float i = floor(f);
    float t = fract(f);
    t = t * t * (3.0 - 2.0 * t);

    vec3 a = i < 0.5 ? aPos0 : (i < 1.5 ? aPos1 : (i < 2.5 ? aPos2 : aPos3));
    vec3 b = i < 0.5 ? aPos1 : (i < 1.5 ? aPos2 : (i < 2.5 ? aPos3 : aPos3));
    return mix(a, b, t);
  }

  void main() {
    vec3 p = formation(uMorph);

    float ph = aSeed * 6.2831853;

    // Idle breathing — every point on its own clock.
    vec3 drift = vec3(
      sin(uTime * 0.34 + ph),
      cos(uTime * 0.27 + ph * 1.73),
      sin(uTime * 0.21 + ph * 2.31)
    ) * (0.055 + aSeed * 0.06) * uEnergy;
    p += drift;

    // Mid-transition the field blooms outward, so morphs feel alive.
    float trans = sin(fract(clamp(uMorph, 0.0, 2.999)) * PI);
    p += normalize(p + 1e-4) * trans * (0.18 + aSeed * 0.42) * uDissolve;

    // Pointer pressure — the field parts around the cursor.
    vec3 toPointer = p - uPointer;
    float d2 = dot(toPointer, toPointer);
    float influence = exp(-d2 * 0.42) * uPointerForce;
    p += normalize(toPointer + 1e-4) * influence;

    p *= uSpread;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float dist = max(0.1, -mv.z);
    gl_PointSize = uSize * aScale * uPixelRatio * (3.2 / dist);

    vFade = smoothstep(16.0, 2.5, dist) * smoothstep(0.2, 1.6, dist);
    vHot = clamp(
      smoothstep(0.58, 0.99, aSeed) * 0.85 + uHeat * 0.4 + influence * 1.2,
      0.0,
      1.0
    );
    vTwinkle = 0.72 + 0.28 * sin(uTime * 1.6 + ph * 3.1);
  }
`;

export const latticeFragment = /* glsl */ `
  precision highp float;

  uniform vec3  uColorCool;
  uniform vec3  uColorHot;
  uniform float uOpacity;

  varying float vHot;
  varying float vFade;
  varying float vTwinkle;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;

    float alpha = smoothstep(0.25, 0.0, d);
    alpha = pow(alpha, 1.5);

    vec3 col = mix(uColorCool, uColorHot, vHot);
    // a tight core keeps points from reading as soft blobs
    col += vec3(alpha * alpha * 0.35);

    gl_FragColor = vec4(col, alpha * uOpacity * vFade * vTwinkle);
  }
`;

export const ribbonVertex = /* glsl */ `
  uniform float uTime;
  uniform float uWave;

  varying vec2 vUv;
  varying float vRim;

  void main() {
    vUv = uv;

    vec3 p = position;
    p += normal * sin(uv.x * 26.0 + uTime * 1.1) * 0.018 * uWave;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vRim = pow(1.0 - abs(dot(n, normalize(-mv.xyz))), 1.6);

    gl_Position = projectionMatrix * mv;
  }
`;

export const ribbonFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uOpacity;
  uniform float uOffset;
  uniform vec3  uColorBase;
  uniform vec3  uColorPulse;

  varying vec2 vUv;
  varying float vRim;

  void main() {
    float head = fract(vUv.x - uTime * uSpeed + uOffset);

    // a travelling signal running the length of the filament
    float pulse = smoothstep(0.0, 0.035, head) * smoothstep(0.26, 0.05, head);
    float trail = smoothstep(0.55, 0.0, head) * 0.12;

    float body = 0.055 + vRim * 0.16;
    float a = (body + pulse * 0.9 + trail) * uOpacity;

    vec3 col = mix(uColorBase, uColorPulse, clamp(pulse * 1.3, 0.0, 1.0));

    gl_FragColor = vec4(col, a);
  }
`;

export const shellVertex = /* glsl */ `
  uniform float uTime;
  uniform float uDeform;

  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;

  // cheap value-noise-ish field, enough for a slow organic wobble
  float wobble(vec3 p) {
    return sin(p.x * 1.9 + uTime * 0.42)
         * sin(p.y * 2.3 - uTime * 0.31)
         * sin(p.z * 1.7 + uTime * 0.26);
  }

  void main() {
    vec3 n = normalize(normal);
    float w = wobble(position * 1.35);
    vNoise = w;

    vec3 p = position + n * w * uDeform;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * n);
    vView = normalize(-mv.xyz);

    gl_Position = projectionMatrix * mv;
  }
`;

export const shellFragment = /* glsl */ `
  precision highp float;

  uniform vec3  uColorRim;
  uniform vec3  uColorCore;
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;

  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0);

    // patchy visibility so the shell reads as fragments of a structure,
    // never as a clean sphere outline
    float veil = smoothstep(-0.55, 0.65, vNoise);

    float a = fres * (0.35 + veil * 0.75) * uOpacity;
    vec3 col = mix(uColorCore, uColorRim, fres);

    gl_FragColor = vec4(col, a);
  }
`;
