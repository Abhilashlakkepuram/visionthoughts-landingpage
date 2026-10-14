"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { shellVertex, shellFragment } from "./shaders";
import { frame, palette } from "./keyframes";

/**
 * The nucleus: a noise-deformed icosahedral shell whose surface is only
 * partially visible, plus a sparse wireframe scaffold around it. It reads as
 * a fragment of structure the lattice is organising itself around — never as
 * a sphere.
 */
export default function Shell({ detail }: { detail: number }) {
  const group = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  const { geometry, material, wireGeometry, wireMaterial } = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1.22, detail);
    const material = new THREE.ShaderMaterial({
      vertexShader: shellVertex,
      fragmentShader: shellFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uDeform: { value: 0.26 },
        uOpacity: { value: 0 },
        uColorRim: { value: new THREE.Vector3(...palette.ember) },
        uColorCore: { value: new THREE.Vector3(...palette.rim) },
      },
    });

    const base = new THREE.IcosahedronGeometry(1.58, 1);
    const wireGeometry = new THREE.WireframeGeometry(base);
    base.dispose();
    const wireMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(0.55, 0.6, 0.72),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry, material, wireGeometry, wireMaterial };
  }, [detail]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
    };
  }, [geometry, material, wireGeometry, wireMaterial]);

  useFrame(() => {
    const t = frame.time;
    const u = material.uniforms;
    u.uTime.value = t;
    u.uOpacity.value = (0.24 + frame.heat * 0.9) * frame.opacity * frame.reveal;
    u.uDeform.value = 0.34 + frame.energy * 0.2;

    wireMaterial.opacity = 0.045 * frame.opacity * frame.reveal;

    if (group.current) {
      group.current.rotation.y = t * 0.06;
      group.current.rotation.x = Math.sin(t * 0.09) * 0.2;
      group.current.rotation.z = Math.sin(t * 0.07) * 0.35;
      // a lens, never a ball
      const s =
        (0.9 + Math.sin(t * 0.4) * 0.03 + frame.heat * 0.1) * frame.spread;
      group.current.scale.set(s * 1.5, s * 0.6, s * 0.95);
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -t * 0.035;
      wireRef.current.rotation.z = t * 0.02;
    }
  });

  return (
    <group ref={group}>
      <mesh frustumCulled={false}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </mesh>
      <lineSegments ref={wireRef} frustumCulled={false}>
        <primitive object={wireGeometry} attach="geometry" />
        <primitive object={wireMaterial} attach="material" />
      </lineSegments>
    </group>
  );
}
