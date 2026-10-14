"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stage, detectTier, TIER_SETTINGS, type Tier } from "@/lib/stage";
import Rig from "./Rig";
import Lattice from "./Lattice";
import Ribbons from "./Ribbons";
import Shell from "./Shell";
import Fragments from "./Fragments";
import Dust from "./Dust";

/** Parks the render loop whenever the tab is hidden. */
function Frameloop() {
  const setFrameloop = useThree((s) => s.setFrameloop);

  useEffect(() => {
    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      stage.visible = visible;
      setFrameloop(visible ? "always" : "never");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setFrameloop]);

  return null;
}

export default function Experience() {
  const [tier, setTier] = useState<Tier>("mid");
  const [lost, setLost] = useState(false);

  useEffect(() => {
    const t = detectTier();
    stage.tier = t;
    setTier(t);
  }, []);

  const settings = TIER_SETTINGS[tier];
  const pixelRatio = useMemo(
    () =>
      typeof window === "undefined"
        ? 1
        : Math.min(window.devicePixelRatio || 1, settings.dpr[1]),
    [settings.dpr]
  );

  if (lost) return null;

  return (
    <Canvas
      dpr={settings.dpr}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0, 6.5] }}
      gl={{
        // the scene is soft additive geometry — MSAA costs fill rate and
        // changes almost nothing here
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x08080a, 0);
        gl.toneMapping = THREE.NoToneMapping;
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            setLost(true);
          },
          { once: true }
        );
      }}
      style={{ pointerEvents: "none" }}
    >
      <Frameloop />
      <Rig>
        <Lattice count={settings.particles} pixelRatio={pixelRatio} />
        <Ribbons
          count={settings.ribbons}
          segments={tier === "low" ? 80 : tier === "mid" ? 128 : 170}
        />
        <Shell detail={settings.shellDetail} />
        {tier !== "low" && <Fragments count={tier === "high" ? 14 : 9} />}
      </Rig>
      <Dust layers={settings.dustLayers} />
    </Canvas>
  );
}
