"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/** The whole WebGL bundle is loaded on the client, after first paint. */
const Experience = dynamic(() => import("./Experience"), {
  ssr: false,
  loading: () => null,
});

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function SceneCanvas() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supportsWebGL()) return;

    // Let the page paint and the fonts settle before we start compiling shaders.
    const ric = window.requestIdleCallback;
    const start = () => setReady(true);

    if (typeof ric === "function") {
      const handle = ric(start, { timeout: 900 });
      return () => window.cancelIdleCallback?.(handle);
    }

    const handle = window.setTimeout(start, 140);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      data-scene-root=""
    >
      {/* Painted fallback so the composition never starts from flat black. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_62%_42%,rgba(255,107,61,0.09),transparent_62%),radial-gradient(45%_45%_at_25%_70%,rgba(60,80,170,0.10),transparent_65%)]" />
      {ready && <Experience />}
    </div>
  );
}
