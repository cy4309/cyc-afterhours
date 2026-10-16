import type { MutableRefObject } from "react";
import type {
  FogExp2,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
} from "three";
import type { DirectionalLight, SpotLight, AmbientLight } from "three";
import {
  CAMERA_KEYS,
  applyIntroOrbit,
  createStoryTweak,
  getIntroOrbit,
  proxyFromKey,
  type StoryProxy,
  type StoryTweak,
} from "./storyConfig";

export type StoryOverlayEls = {
  voidCopy: HTMLElement | null;
  scrollHint: HTMLElement | null;
  surfaceCopy: HTMLElement | null;
  wallCopy: HTMLElement | null;
  timeline: HTMLElement | null;
  eraV1: HTMLElement | null;
  eraV2: HTMLElement | null;
  eraV3: HTMLElement | null;
  chapterVoid: HTMLElement | null;
  chapterSurface: HTMLElement | null;
  chapterWall: HTMLElement | null;
};

export type StoryRuntime = {
  proxy: StoryProxy;
  camera: PerspectiveCamera | null;
  keyLight: SpotLight | null;
  rimLight: DirectionalLight | null;
  fillLight: DirectionalLight | null;
  ambientLight: AmbientLight | null;
  holdFill: PointLight | null;
  heroMaterial: MeshStandardMaterial | null;
  wallMaterial: MeshStandardMaterial | null;
  backdropMaterial: MeshBasicMaterial | null;
  fog: FogExp2 | null;
  routeMaterials: MeshStandardMaterial[];
  tweak: StoryTweak;
  pointer: { x: number; y: number };
  introActive: boolean;
  introTime: number;
  onCanvasReady: (() => void) | null;
  onIntroComplete: (() => void) | null;
};

function createIntroProxy() {
  const rest = CAMERA_KEYS[0];
  const proxy = proxyFromKey(rest);
  const { look, start } = getIntroOrbit(rest);
  applyIntroOrbit(proxy, start, look);
  return proxy;
}

export function createStoryRuntime(): StoryRuntime {
  return {
    proxy: createIntroProxy(),
    camera: null,
    keyLight: null,
    rimLight: null,
    fillLight: null,
    ambientLight: null,
    holdFill: null,
    heroMaterial: null,
    wallMaterial: null,
    backdropMaterial: null,
    fog: null,
    routeMaterials: [],
    tweak: createStoryTweak(),
    pointer: { x: 0, y: 0 },
    introActive: true,
    introTime: 0,
    onCanvasReady: null,
    onIntroComplete: null,
  };
}

export function createOverlayEls(): StoryOverlayEls {
  return {
    voidCopy: null,
    scrollHint: null,
    surfaceCopy: null,
    wallCopy: null,
    timeline: null,
    eraV1: null,
    eraV2: null,
    eraV3: null,
    chapterVoid: null,
    chapterSurface: null,
    chapterWall: null,
  };
}

export type OverlayElsRef = MutableRefObject<StoryOverlayEls>;
