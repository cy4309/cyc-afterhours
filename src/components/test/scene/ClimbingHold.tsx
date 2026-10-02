"use client";

import { useEffect, useMemo } from "react";
import { HOLD_BLUE } from "../lib/constants";
import { buildHoldGeometry } from "../lib/buildHoldGeometry";

export function ClimbingHold() {
  const geometry = useMemo(() => buildHoldGeometry(), []);

  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry],
  );

  return (
    <group position={[0, 0, 0.08]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={HOLD_BLUE}
          vertexColors
          roughness={0.96}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
