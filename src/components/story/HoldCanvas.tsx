"use client";

import { Canvas } from "@react-three/fiber";
import { HoldScene } from "./scene/HoldScene";

export function HoldCanvas() {
  return (
    <div className="relative min-h-0 w-full flex-1 bg-paper">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <HoldScene />
      </Canvas>
    </div>
  );
}
