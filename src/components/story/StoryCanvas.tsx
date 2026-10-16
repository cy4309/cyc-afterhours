"use client";

/* eslint-disable react-hooks/immutability -- Canvas onCreated writes into the story runtime */

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { WallScene } from "./scene/WallScene";
import { STORY_BG, getRestKey, introStartPosition } from "./storyConfig";
import type { StoryRuntime } from "./storyRuntime";

type StoryCanvasProps = {
  runtime: StoryRuntime;
  shadows: boolean;
  mobile: boolean;
  reducedMotion: boolean;
  dpr: [number, number];
};

export function StoryCanvas({
  runtime,
  shadows,
  mobile,
  reducedMotion,
  dpr,
}: StoryCanvasProps) {
  const rest = getRestKey(mobile);
  const start = introStartPosition(rest);

  return (
    <Canvas
      className="pointer-events-none h-full w-full"
      shadows={shadows}
      dpr={dpr}
      gl={{
        antialias: !mobile,
        alpha: false,
        powerPreference: "high-performance",
      }}
      camera={{
        fov: rest.fov + 10,
        near: 0.08,
        far: 48,
        position: start,
      }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(STORY_BG, 1);
        gl.shadowMap.type = THREE.PCFShadowMap;
        runtime.camera = camera as typeof runtime.camera;
        runtime.onCanvasReady?.();
      }}
    >
      <WallScene
        runtime={runtime}
        shadows={shadows}
        mobile={mobile}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
