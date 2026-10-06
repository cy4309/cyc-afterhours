"use client";

import { useTexture } from "@react-three/drei";
import { useLayoutEffect } from "react";
import * as THREE from "three";

export function Wall() {
  const texture = useTexture("/wall-normal.jpg");
  useLayoutEffect(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.2, 2.2);
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      {/* <meshStandardMaterial map={texture} roughness={0.9} metalness={0} /> */}
      <meshStandardMaterial color="black" />
    </mesh>
  );
}
