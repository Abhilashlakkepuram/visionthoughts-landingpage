"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { frame } from "./keyframes";

/** Far parallax layers. Cheap, static geometry — only the group moves. */
export default function Dust({ layers }: { layers: number }) {
  const group = useRef<THREE.Group>(null);

  const built = useMemo(() => {
    return Array.from({ length: layers }, (_, layer) => {
      const n = 380 - layer * 90;
      const inner = 7 + layer * 3.2;
      const positions = new Float32Array(n * 3);

      for (let i = 0; i < n; i++) {
        const theta = ((i * 2.399963) % (Math.PI * 2)) + layer;
        const y = (((i * 13) % 97) / 97 - 0.5) * 16;
        const r = inner + (((i * 29) % 53) / 53) * 4.5;
        positions[i * 3] = Math.cos(theta) * r;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(theta) * r - 4;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      const material = new THREE.PointsMaterial({
        size: 0.035 + layer * 0.02,
        sizeAttenuation: true,
        color: new THREE.Color(0.52, 0.57, 0.7),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });

      return { geometry, material, layer };
    });
  }, [layers]);

  useEffect(() => {
    return () => {
      built.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    };
  }, [built]);

  useFrame(() => {
    const t = frame.time;
    built.forEach(({ material, layer }) => {
      material.opacity = (0.34 - layer * 0.07) * frame.reveal;
    });
    if (group.current) {
      group.current.rotation.y = t * 0.012;
    }
  });

  return (
    <group ref={group}>
      {built.map(({ geometry, material, layer }) => (
        <points key={layer} frustumCulled={false}>
          <primitive object={geometry} attach="geometry" />
          <primitive object={material} attach="material" />
        </points>
      ))}
    </group>
  );
}
