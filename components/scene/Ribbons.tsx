"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ribbonPath } from "./formations";
import { ribbonVertex, ribbonFragment } from "./shaders";
import { frame, palette } from "./keyframes";

/**
 * Filaments threading through the lattice — the "connection" half of the
 * visual language. Each carries a travelling signal pulse.
 */
export default function Ribbons({
  count,
  segments,
}: {
  count: number;
  segments: number;
}) {
  const group = useRef<THREE.Group>(null);

  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const curve = new THREE.CatmullRomCurve3(
        ribbonPath(i, count).map((p) => new THREE.Vector3(...p)),
        true,
        "centripetal",
        0.5
      );
      const geometry = new THREE.TubeGeometry(
        curve,
        segments,
        0.009 + (i % 3) * 0.004,
        4,
        true
      );
      const material = new THREE.ShaderMaterial({
        vertexShader: ribbonVertex,
        fragmentShader: ribbonFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uSpeed: { value: 0.05 + (i % 3) * 0.012 },
          uOpacity: { value: 0 },
          uOffset: { value: i / count },
          uWave: { value: 1 },
          uColorBase: {
            value: new THREE.Vector3(...(i % 3 === 0 ? palette.rim : palette.cool)),
          },
          uColorPulse: { value: new THREE.Vector3(...palette.ember) },
        },
      });
      return { geometry, material, speedBase: 0.05 + (i % 3) * 0.012, i };
    });
  }, [count, segments]);

  useEffect(() => {
    return () => {
      items.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    };
  }, [items]);

  useFrame(() => {
    const t = frame.time;
    for (const { material, speedBase } of items) {
      const u = material.uniforms;
      u.uTime.value = t;
      u.uSpeed.value = speedBase * (frame.ribbonSpeed / 0.05);
      u.uOpacity.value = (0.72 + frame.heat * 1.5) * frame.opacity * frame.reveal;
      u.uWave.value = frame.energy;
    }
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.11) * 0.16;
      group.current.rotation.x = Math.cos(t * 0.08) * 0.12;
      group.current.scale.setScalar(frame.spread);
    }
  });

  return (
    <group ref={group}>
      {items.map(({ geometry, material, i }) => (
        <mesh key={i} frustumCulled={false}>
          <primitive object={geometry} attach="geometry" />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
