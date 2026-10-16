"use client";

import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { getSharedHoldGeometry } from "../lib/buildHoldGeometry";
import { ROUTE_COLORS } from "../storyConfig";
import type { HoldPlacement } from "../storyConfig";

type ClimbingHoldProps = {
  hold: HoldPlacement;
  castShadow?: boolean;
  receiveShadow?: boolean;
  sharedMaterial?: THREE.MeshStandardMaterial;
  onMaterial?: (material: THREE.MeshStandardMaterial) => void;
};

export function ClimbingHold({
  hold,
  castShadow = false,
  receiveShadow = false,
  sharedMaterial,
  onMaterial,
}: ClimbingHoldProps) {
  const geometry = useMemo(() => getSharedHoldGeometry(), []);
  const material = useMemo(() => {
    if (sharedMaterial) return sharedMaterial;
    const tint = ROUTE_COLORS[hold.line];
    const color = new THREE.Color(tint);
    if (hold.kind === "route") color.multiplyScalar(0.22);
    const material = new THREE.MeshStandardMaterial({
      color,
      vertexColors: true,
      roughness: 0.92,
      metalness: 0,
      emissive: tint,
      emissiveIntensity: hold.kind === "hero" ? 0.08 : 0,
      envMapIntensity: 0,
    });
    if (hold.era) material.userData.era = hold.era;
    return material;
  }, [hold.era, hold.kind, hold.line, sharedMaterial]);

  useLayoutEffect(() => {
    if (sharedMaterial || !onMaterial) return;
    onMaterial(material);
    return () => {
      material.dispose();
    };
  }, [material, onMaterial, sharedMaterial]);

  return (
    <group position={hold.position} rotation={hold.rotation} scale={hold.scale}>
      <mesh
        geometry={geometry}
        material={material}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      />
    </group>
  );
}
