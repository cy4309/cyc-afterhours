"use client";

/* eslint-disable react-hooks/immutability -- R3F objects are mutated in the render loop */

import { Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ClimbingHold } from "./ClimbingHold";
import {
  HOLD_COLOR,
  HOLDS,
  INTRO_TOTAL,
  LIGHT_RIG,
  REST_LIGHT,
  ROUTE_COLORS,
  STORY_BG,
  WALL,
  applyIntroOrbit,
  eraLit,
  getIntroOrbit,
  getRestKey,
  proxyFromKey,
  sampleIntro,
  type RouteLine,
  type StoryEra,
} from "../storyConfig";
import type { StoryRuntime } from "../storyRuntime";

type WallSceneProps = {
  runtime: StoryRuntime;
  shadows: boolean;
  mobile: boolean;
  reducedMotion: boolean;
};

function StoryDirector({
  runtime,
  reducedMotion,
  mobile,
}: {
  runtime: StoryRuntime;
  reducedMotion: boolean;
  mobile: boolean;
}) {
  const { camera, scene, clock } = useThree();
  const smooth = useRef(new THREE.Vector2());
  const lastFov = useRef(-1);
  const introDone = useRef(false);

  useFrame((_, delta) => {
    if (runtime.introActive && !introDone.current) {
      const rest = getRestKey(mobile);
      const duration = reducedMotion ? 0.4 : INTRO_TOTAL;
      runtime.introTime += delta;
      const { look } = getIntroOrbit(rest);
      const sampleTime = reducedMotion
        ? (runtime.introTime / duration) * INTRO_TOTAL
        : runtime.introTime;
      applyIntroOrbit(runtime.proxy, sampleIntro(rest, sampleTime), look);
      if (runtime.introTime >= duration) {
        introDone.current = true;
        runtime.introActive = false;
        Object.assign(runtime.proxy, proxyFromKey(rest), REST_LIGHT);
        runtime.onIntroComplete?.();
      }
    }

    const p = runtime.proxy;
    const t = runtime.tweak;
    const amount = runtime.introActive || reducedMotion ? 0.01 : 0.055;
    smooth.current.x += (runtime.pointer.x * amount - smooth.current.x) * 0.06;
    smooth.current.y += (runtime.pointer.y * amount - smooth.current.y) * 0.06;
    const drift =
      runtime.introActive || reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.12) * 0.03;

    camera.position.set(
      p.camX + t.camX + smooth.current.x + drift,
      p.camY + t.camY + smooth.current.y,
      p.camZ + t.camZ,
    );
    camera.lookAt(p.lookX + t.lookX, p.lookY + t.lookY, p.lookZ + t.lookZ);

    if (camera instanceof THREE.PerspectiveCamera && lastFov.current !== p.fov) {
      camera.fov = p.fov;
      camera.updateProjectionMatrix();
      lastFov.current = p.fov;
    }

    if (runtime.keyLight) {
      runtime.keyLight.intensity = p.key * t.key;
      runtime.keyLight.position.set(
        LIGHT_RIG.key[0] + t.keyX,
        LIGHT_RIG.key[1] + t.keyY,
        LIGHT_RIG.key[2] + t.keyZ,
      );
    }
    if (runtime.rimLight) runtime.rimLight.intensity = p.rim * t.rim;
    if (runtime.fillLight) runtime.fillLight.intensity = p.fill * t.fill;
    if (runtime.ambientLight) runtime.ambientLight.intensity = p.ambient * t.ambient;
    if (runtime.holdFill) runtime.holdFill.intensity = p.hero * t.hero * 7;
    if (runtime.heroMaterial) runtime.heroMaterial.emissiveIntensity = p.hero * t.hero;
    if (runtime.backdropMaterial) runtime.backdropMaterial.opacity = p.bg;
    if (runtime.wallMaterial) {
      runtime.wallMaterial.color.setRGB(
        0.431 + p.bg * 0.569,
        0.392 + p.bg * 0.608,
        0.361 + p.bg * 0.639,
      );
    }

    const fog = scene.fog;
    if (fog instanceof THREE.FogExp2) fog.density = p.fog * t.fog * (1 - p.bg * 0.9);

    runtime.routeMaterials.forEach((material) => {
      const era = material.userData.era as StoryEra | undefined;
      const lit = era ? eraLit(p.route, era) : 0;
      material.emissiveIntensity = lit * 0.12;
      material.opacity = 1;
      material.color.set(HOLD_COLOR);
      material.color.multiplyScalar(0.26 + lit * 0.4);
    });
  });

  return null;
}

function ExtraHolds({
  runtime,
  children,
}: {
  runtime: StoryRuntime;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    group.visible = !runtime.introActive && runtime.proxy.camZ > 8;
  });

  return (
    <group ref={ref} visible={false}>
      {children}
    </group>
  );
}

function WallSurface({ runtime }: { runtime: StoryRuntime }) {
  const texture = useTexture("/wall-normal.jpg");
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  useLayoutEffect(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.4, 2.1);
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    runtime.wallMaterial = materialRef.current;
    return () => {
      runtime.wallMaterial = null;
    };
  }, [runtime, texture]);

  return (
    <mesh receiveShadow>
      <planeGeometry args={[WALL.size[0], WALL.size[1], 1, 1]} />
      <meshStandardMaterial
        ref={materialRef}
        map={texture}
        color="#6e645c"
        roughness={0.96}
        metalness={0}
      />
    </mesh>
  );
}

function PhotoBackdrop({ runtime }: { runtime: StoryRuntime }) {
  const texture = useTexture("/wall-normal.jpg");
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    runtime.backdropMaterial = materialRef.current;
    return () => {
      runtime.backdropMaterial = null;
    };
  }, [runtime, texture]);

  return (
    <mesh scale={[-1, 1, 1]} renderOrder={-1}>
      <sphereGeometry args={[28, 48, 32]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        side={THREE.BackSide}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

export function WallScene({ runtime, shadows, mobile, reducedMotion }: WallSceneProps) {
  const keyRef = useRef<THREE.SpotLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const holdFillRef = useRef<THREE.PointLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const routeMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const lineMaterials = useMemo(() => {
    const lines: RouteLine[] = ["ochre", "clay", "sage"];
    return Object.fromEntries(
      lines.map((line) => {
        const tint = ROUTE_COLORS[line];
        return [
          line,
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(tint).multiplyScalar(0.4),
            vertexColors: true,
            roughness: 0.93,
            metalness: 0,
            emissive: tint,
            emissiveIntensity: 0.025,
          }),
        ];
      }),
    ) as Record<Exclude<RouteLine, "blue">, THREE.MeshStandardMaterial>;
  }, []);

  const holds = mobile ? HOLDS.filter((hold) => hold.kind !== "fill" || hold.line !== "sage") : HOLDS;

  useLayoutEffect(() => {
    runtime.keyLight = keyRef.current;
    runtime.rimLight = rimRef.current;
    runtime.fillLight = fillRef.current;
    runtime.holdFill = holdFillRef.current;
    runtime.ambientLight = ambientRef.current;
    runtime.routeMaterials = routeMats.current;
    if (keyRef.current) {
      keyRef.current.target.position.set(0, 0.22, 0.05);
      keyRef.current.target.updateMatrixWorld();
    }
    return () => {
      runtime.keyLight = null;
      runtime.rimLight = null;
      runtime.fillLight = null;
      runtime.holdFill = null;
      runtime.heroMaterial = null;
      runtime.wallMaterial = null;
      runtime.backdropMaterial = null;
      runtime.ambientLight = null;
      runtime.routeMaterials = [];
      routeMats.current = [];
    };
  }, [runtime]);

  return (
    <>
      <StoryDirector runtime={runtime} reducedMotion={reducedMotion} mobile={mobile} />
      <color attach="background" args={[STORY_BG]} />
      <fogExp2 attach="fog" args={[STORY_BG, 0.18]} />
      <Suspense fallback={null}>
        <PhotoBackdrop runtime={runtime} />
      </Suspense>

      <ambientLight ref={ambientRef} intensity={0.018} color="#8aa4b8" />
      <spotLight
        ref={keyRef}
        position={LIGHT_RIG.key}
        angle={0.26}
        penumbra={0.72}
        intensity={2.2}
        color="#f2f7ff"
        castShadow={shadows}
        distance={10}
        decay={1.15}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
      />
      <pointLight
        ref={holdFillRef}
        position={LIGHT_RIG.holdFill}
        color="#cfe6ff"
        intensity={0}
        distance={4.2}
        decay={2}
      />
      <directionalLight
        ref={rimRef}
        position={LIGHT_RIG.rim}
        intensity={0.42}
        color="#5aa7d4"
      />
      <directionalLight
        ref={fillRef}
        position={LIGHT_RIG.fill}
        intensity={0}
        color="#cfc6bb"
        castShadow={false}
      />

      <group position={WALL.position} rotation={WALL.rotation}>
        <Suspense fallback={null}>
          <WallSurface runtime={runtime} />
        </Suspense>
        {holds
          .filter((hold) => hold.kind === "hero")
          .map((hold) => (
            <ClimbingHold
              key={hold.id}
              hold={hold}
              castShadow={shadows}
              receiveShadow={shadows}
              onMaterial={(material) => {
                runtime.heroMaterial = material;
              }}
            />
          ))}
        <ExtraHolds runtime={runtime}>
          {holds
            .filter((hold) => hold.kind !== "hero")
            .map((hold) => (
              <ClimbingHold
                key={hold.id}
                hold={hold}
                receiveShadow={shadows}
                sharedMaterial={
                  hold.kind === "fill" && hold.line !== "blue"
                    ? lineMaterials[hold.line]
                    : undefined
                }
                onMaterial={
                  hold.kind === "route"
                    ? (material) => {
                        if (!routeMats.current.includes(material)) {
                          routeMats.current.push(material);
                        }
                      }
                    : undefined
                }
              />
            ))}
        </ExtraHolds>
      </group>
    </>
  );
}
