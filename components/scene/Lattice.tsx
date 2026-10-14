"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildFormations } from "./formations";
import { latticeVertex, latticeFragment } from "./shaders";
import { frame, palette } from "./keyframes";

export default function Lattice({
  count,
  pixelRatio,
}: {
  count: number;
  pixelRatio: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const f = buildFormations(count);
    const g = new THREE.BufferGeometry();
    // `position` is required by three even though the shader never reads it.
    g.setAttribute("position", new THREE.BufferAttribute(f.pos0, 3));
    g.setAttribute("aPos0", new THREE.BufferAttribute(f.pos0, 3));
    g.setAttribute("aPos1", new THREE.BufferAttribute(f.pos1, 3));
    g.setAttribute("aPos2", new THREE.BufferAttribute(f.pos2, 3));
    g.setAttribute("aPos3", new THREE.BufferAttribute(f.pos3, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(f.seed, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(f.scale, 1));
    // The shader moves points far outside their rest positions.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return g;
  }, [count]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: latticeVertex,
      fragmentShader: latticeFragment,
      transparent: true,
      depthWrite: false,
      // everything in this scene is additive, so depth testing buys nothing
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0.12 },
        uSize: { value: 8.2 },
        uEnergy: { value: 1 },
        uSpread: { value: 1 },
        uDissolve: { value: 1 },
        uHeat: { value: 0 },
        uOpacity: { value: 0 },
        uPointer: { value: new THREE.Vector3() },
        uPointerForce: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uColorCool: { value: new THREE.Vector3(...palette.cool) },
        uColorHot: { value: new THREE.Vector3(...palette.hot) },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    material.uniforms.uPixelRatio.value = pixelRatio;
  }, [material, pixelRatio]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(() => {
    const u = material.uniforms;
    u.uTime.value = frame.time;
    u.uMorph.value = frame.morph;
    u.uEnergy.value = frame.energy;
    u.uSpread.value = frame.spread;
    u.uDissolve.value = frame.dissolve;
    u.uHeat.value = frame.heat;
    u.uOpacity.value = frame.opacity * frame.reveal;
    u.uPointerForce.value = frame.pointerForce;
    (u.uPointer.value as THREE.Vector3).set(
      frame.pointer[0],
      frame.pointer[1],
      frame.pointer[2]
    );
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </points>
  );
}
