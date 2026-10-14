"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { stage, damp, clamp, lerp } from "@/lib/stage";
import { frame, sampleKeyframes, servicePoses } from "./keyframes";

const lookTarget = new THREE.Vector3();

/**
 * The single source of truth for scene motion.
 *
 * Mounted before every other scene component, so its `useFrame` runs first and
 * everything downstream reads a consistent `frame` snapshot.
 */
export default function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const elapsed = useRef(0);
  const rot = useRef({ x: 0, y: 0 });
  const morph = useRef(0.12);
  const spread = useRef(1);

  useFrame((_, rawDelta) => {
    if (!stage.visible) return;

    const delta = Math.min(rawDelta, 1 / 20);
    const reduced = stage.reduced;

    elapsed.current += delta * (reduced ? 0.35 : 1);
    frame.time = elapsed.current;

    /* ---- intro reveal ---- */
    const revealTarget = 1;
    const revealSpeed = reduced ? 6 : 1.9;
    frame.reveal = damp(frame.reveal, revealTarget, revealSpeed, delta);

    /* ---- eased inputs ---- */
    stage.scrollEased = damp(stage.scrollEased, stage.scroll, 6, delta);
    stage.pxEased = damp(stage.pxEased, reduced ? 0 : stage.px, 2.6, delta);
    stage.pyEased = damp(stage.pyEased, reduced ? 0 : stage.py, 2.6, delta);
    stage.pulse = damp(stage.pulse, 0, 2.2, delta);

    /* ---- responsive framing ---- */
    const aspect = size.width / Math.max(1, size.height);
    const narrow = clamp((1.55 - aspect) / 1.0);
    const offsetScale = lerp(1, 0.2, narrow);
    const dolly = lerp(0, 3.1, narrow);
    // Phones stack everything centre-column, so the scene lifts above the
    // copy and steps back rather than sitting under the text.
    const narrowLift = narrow * 1.45;
    const narrowFade = lerp(1, 0.55, narrow);

    /* ---- chapter keyframe ---- */
    const kf = sampleKeyframes(stage.chapter);

    /* ---- the services chapter can take over the pose ---- */
    const focus =
      stage.service >= 0 ? clamp(stage.serviceFocus) : 0;
    const pose = stage.service >= 0 ? servicePoses[stage.service] : null;

    const targetMorph = pose ? lerp(kf.morph, pose.morph, focus) : kf.morph;
    const targetSpread = pose ? lerp(kf.spread, pose.spread, focus) : kf.spread;
    const targetHeat =
      (pose ? lerp(kf.heat, pose.heat, focus) : kf.heat) + stage.pulse * 0.25;

    const targetRotX = pose ? lerp(kf.rot[0], pose.rot[0], focus) : kf.rot[0];
    const targetRotY = pose ? lerp(kf.rot[1], pose.rot[1], focus) : kf.rot[1];

    /* ---- damped scene values ---- */
    morph.current = damp(morph.current, targetMorph, reduced ? 6 : 2.4, delta);
    spread.current = damp(spread.current, targetSpread, 2.6, delta);

    frame.morph = morph.current;
    frame.spread = spread.current;
    frame.heat = damp(frame.heat, targetHeat, 3, delta);
    frame.opacity = damp(frame.opacity, kf.opacity * narrowFade, 3.4, delta);
    frame.energy = damp(
      frame.energy,
      (kf.energy + stage.pulse * 0.4) * (reduced ? 0.18 : 1),
      2.6,
      delta
    );
    frame.ribbonSpeed = damp(frame.ribbonSpeed, kf.ribbonSpeed, 2.4, delta);
    // Bloom the field only while it is genuinely in transit.
    const inTransit = Math.abs(targetMorph - morph.current);
    frame.dissolve = damp(
      frame.dissolve,
      reduced ? 0.15 : clamp(0.25 + inTransit * 1.6, 0, 1.1),
      3,
      delta
    );

    /* ---- camera ---- */
    const parallax = reduced ? 0 : 1;
    const camX = kf.cam[0] + stage.pxEased * 0.5 * parallax;
    const camY = kf.cam[1] + stage.pyEased * 0.34 * parallax;
    const camZ = kf.cam[2] + dolly - stage.pulse * 0.25;

    camera.position.x = damp(camera.position.x, camX, 2.2, delta);
    camera.position.y = damp(camera.position.y, camY, 2.2, delta);
    camera.position.z = damp(camera.position.z, camZ, 2.0, delta);

    lookTarget.set(
      stage.pxEased * 0.16 * parallax,
      stage.pyEased * 0.12 * parallax,
      0
    );
    camera.lookAt(lookTarget);

    /* ---- scene group ---- */
    if (group.current) {
      const g = group.current;
      g.position.x = damp(
        g.position.x,
        kf.offset[0] * offsetScale,
        2.4,
        delta
      );
      g.position.y = damp(g.position.y, kf.offset[1] + narrowLift, 2.4, delta);
      g.position.z = damp(g.position.z, kf.offset[2], 2.4, delta);

      rot.current.x = damp(
        rot.current.x,
        targetRotX + stage.pyEased * 0.1 * parallax,
        1.8,
        delta
      );
      rot.current.y = damp(
        rot.current.y,
        targetRotY + stage.pxEased * 0.16 * parallax,
        1.8,
        delta
      );

      g.rotation.x = rot.current.x + Math.sin(frame.time * 0.13) * 0.045;
      g.rotation.y = rot.current.y + frame.time * 0.018;
      g.rotation.z = Math.cos(frame.time * 0.1) * 0.03;
    }

    /* ---- pointer probe, in scene-group space ---- */
    const force = reduced ? 0 : kf.pointerForce * (0.6 + frame.reveal * 0.4);
    frame.pointerForce = damp(frame.pointerForce, force, 3, delta);

    const reach = 3.0;
    frame.pointer[0] = stage.pxEased * reach - (group.current?.position.x ?? 0);
    frame.pointer[1] = stage.pyEased * reach * 0.62;
    frame.pointer[2] = 1.1;
  });

  return <group ref={group}>{children}</group>;
}
