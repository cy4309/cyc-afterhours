"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { CAMERA } from "../lib/constants";

export function Camera() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={CAMERA.position}
        fov={CAMERA.fov}
      />
      <OrbitControls
        enablePan={false}
        minDistance={CAMERA.minDistance}
        maxDistance={CAMERA.maxDistance}
        enableDamping
        // autoRotate
        // autoRotateSpeed={0.55}
        target={CAMERA.target}
      />
    </>
  );
}
