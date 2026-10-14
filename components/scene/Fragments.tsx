"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { frame } from "./keyframes";

const dummy = new THREE.Object3D();

/**
 * Sparse wireframe shards drifting on their own orbits. They give the
 * composition foreground depth without adding another material family —
 * one shared geometry, one shared material, N instances.
 */
export default function Fragments({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);

  const orbits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const g = (i * 0.61803398875) % 1;
        return {
          radius: 2.4 + g * 3.4,
          speed: 0.05 + ((i % 5) * 0.022),
          phase: g * Math.PI * 2,
          tilt: (g - 0.5) * 1.6,
          height: (((i * 7) % 11) / 11 - 0.5) * 3.6,
          scale: 0.45 + g * 0.9,
          spin: 0.2 + g * 0.5,
        };
      }),
    [count]
  );

  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.05, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.7, 0.74, 0.85),
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;

    material.opacity = 0.16 * frame.opacity * frame.reveal;
    const t = frame.time;

    for (let i = 0; i < orbits.length; i++) {
      const o = orbits[i];
      const a = t * o.speed + o.phase;
      dummy.position.set(
        Math.cos(a) * o.radius,
        o.height + Math.sin(a * 1.7 + o.phase) * 0.5,
        Math.sin(a) * o.radius * Math.cos(o.tilt)
      );
      dummy.rotation.set(a * o.spin, a * o.spin * 1.4, o.tilt);
      dummy.scale.setScalar(o.scale * frame.spread);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
