import { HOLD_BLUE } from "./lib/constants";

export const STORY_BG = "#050506";

export type Vec3 = [number, number, number];

export type CameraKey = {
  t: number;
  position: Vec3;
  lookAt: Vec3;
  fov: number;
  key: number;
  rim: number;
  fill: number;
  ambient: number;
  fog: number;
  ease: string;
};

export const ROUTE_COLORS = {
  blue: HOLD_BLUE,
  ochre: "#c4a35a",
  clay: "#b85c46",
  sage: "#6b8f72",
} as const;

export type RouteLine = keyof typeof ROUTE_COLORS;

export type StoryEra = "v1" | "v2" | "v3";

export type HoldPlacement = {
  id: string;
  position: Vec3;
  rotation: Vec3;
  scale: number;
  kind: "hero" | "route" | "fill";
  line: RouteLine;
  era?: StoryEra;
};

export const STORY_ERAS: { id: StoryEra; label: string }[] = [
  { id: "v1", label: "2025.10  ·  V1" },
  { id: "v2", label: "2026.02  ·  V2" },
  { id: "v3", label: "NOW  ·  V3" },
];

export const STORY_BEATS = {
  wallCopyIn: 0.54,
  wallCopyOut: 0.61,
  timelineIn: 0.62,
  eraAt: {
    v1: 0.64,
    v2: 0.76,
    v3: 0.88,
  },
  routeSteps: [
    { at: 0.64, to: 0.34, duration: 0.05 },
    { at: 0.76, to: 0.67, duration: 0.05 },
    { at: 0.88, to: 1, duration: 0.05 },
  ],
  bgAt: 0.97,
  bgDuration: 0.03,
  lineDim: 0.18,
} as const;

export function eraLit(route: number, era: StoryEra): number {
  const start = era === "v1" ? 0 : era === "v2" ? 0.34 : 0.67;
  const span = era === "v1" ? 0.34 : 0.33;
  return Math.max(0, Math.min(1, (route - start) / span));
}

export type StoryProxy = {
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  lookZ: number;
  fov: number;
  key: number;
  rim: number;
  fill: number;
  ambient: number;
  fog: number;
  hero: number;
  route: number;
  bg: number;
};

export const INTRO = {
  duration: 1.6,
  lightDuration: 0.35,
  radiusScale: 1.85,
  extraY: 0.9,
  extraFov: 10,
  startKey: 8.5,
  startRim: 1.7,
  startAmbient: 0.035,
  startFog: 0.13,
  startHero: 0.1,
};

export const REST_LIGHT = {
  key: 16,
  rim: 2.5,
  fill: 0,
  ambient: 0.045,
  fog: 0.11,
  hero: 0.18,
};

export const HOLD_COLOR = HOLD_BLUE;

export const CAMERA_KEYS: CameraKey[] = [
  {
    t: 0,
    position: [1.15, 0.26, 3.55],
    lookAt: [0.04, 0.18, 0.04],
    fov: 30,
    key: REST_LIGHT.key,
    rim: REST_LIGHT.rim,
    fill: REST_LIGHT.fill,
    ambient: REST_LIGHT.ambient,
    fog: REST_LIGHT.fog,
    ease: "none",
  },
  {
    t: 0.22,
    position: [0.72, 0.22, 3.15],
    lookAt: [0.08, 0.16, 0.08],
    fov: 30,
    key: 7.8,
    rim: 0.85,
    fill: 0,
    ambient: 0.022,
    fog: 0.13,
    ease: "power1.in",
  },
  {
    t: 0.36,
    position: [0.92, 0.38, 1.72],
    lookAt: [0.04, 0.12, 0.08],
    fov: 28,
    key: 4.8,
    rim: 1.15,
    fill: 0.06,
    ambient: 0.03,
    fog: 0.09,
    ease: "power2.out",
  },
  {
    t: 0.5,
    position: [-0.15, 0.55, 1.48],
    lookAt: [0.22, 0.08, 0.06],
    fov: 26,
    key: 3.4,
    rim: 1.35,
    fill: 0.08,
    ambient: 0.032,
    fog: 0.075,
    ease: "sine.inOut",
  },
  {
    t: 0.52,
    position: [1.05, 0.42, 1.58],
    lookAt: [0.45, 0.28, 0.02],
    fov: 30,
    key: 3.0,
    rim: 0.7,
    fill: 0.12,
    ambient: 0.035,
    fog: 0.06,
    ease: "power1.inOut",
  },
  {
    t: 0.58,
    position: [-0.18, 1.18, 11.4],
    lookAt: [0.08, 1.02, -0.35],
    fov: 34,
    key: 2.3,
    rim: 0.38,
    fill: 0.6,
    ambient: 0.058,
    fog: 0.016,
    ease: "power3.in",
  },
  {
    t: 1,
    position: [-0.18, 1.18, 11.4],
    lookAt: [0.08, 1.02, -0.35],
    fov: 34,
    key: 2.4,
    rim: 0.4,
    fill: 0.65,
    ambient: 0.06,
    fog: 0.014,
    ease: "none",
  },
];

export const REDUCED_CAMERA_KEYS: CameraKey[] = [
  CAMERA_KEYS[0],
  { ...CAMERA_KEYS[2], t: 0.4, ease: "power1.inOut" },
  { ...CAMERA_KEYS[5], t: 0.7, ease: "power1.inOut" },
  { ...CAMERA_KEYS[CAMERA_KEYS.length - 1], t: 1, ease: "power1.inOut" },
];

const MOBILE_FRAME = {
  closeZ: 7,
  closeScale: 1.85,
  closeFov: 18,
  wideScale: 1.08,
  wideFov: 8,
} as const;

export function frameCameraKey(key: CameraKey, mobile: boolean): CameraKey {
  if (!mobile) return key;
  const close = key.position[2] < MOBILE_FRAME.closeZ;
  const scale = close ? MOBILE_FRAME.closeScale : MOBILE_FRAME.wideScale;
  const look = key.lookAt;
  return {
    ...key,
    position: [
      look[0] + (key.position[0] - look[0]) * scale,
      look[1] + (key.position[1] - look[1]) * scale,
      look[2] + (key.position[2] - look[2]) * scale,
    ],
    fov: key.fov + (close ? MOBILE_FRAME.closeFov : MOBILE_FRAME.wideFov),
  };
}

export function getStoryCameraKeys(mobile: boolean, reducedMotion: boolean) {
  const source = reducedMotion ? REDUCED_CAMERA_KEYS : CAMERA_KEYS;
  return mobile ? source.map((key) => frameCameraKey(key, true)) : source;
}

export function getRestKey(mobile: boolean) {
  return frameCameraKey(CAMERA_KEYS[0], mobile);
}

export const HOLDS: HoldPlacement[] = [
  {
    id: "hero",
    position: [0, -1.05, 0.12],
    rotation: [0.14, 0.38, 0.08],
    scale: 1,
    kind: "hero",
    line: "blue",
    era: "v1",
  },
  {
    id: "route-1",
    position: [-0.95, 0.15, 0.12],
    rotation: [0.2, -0.4, 0.12],
    scale: 0.72,
    kind: "route",
    line: "blue",
    era: "v1",
  },
  {
    id: "route-2",
    position: [0.78, 1.05, 0.12],
    rotation: [-0.08, 0.55, -0.1],
    scale: 0.64,
    kind: "route",
    line: "blue",
    era: "v2",
  },
  {
    id: "route-3",
    position: [-0.42, 2.05, 0.12],
    rotation: [0.18, 0.12, 0.22],
    scale: 0.8,
    kind: "route",
    line: "blue",
    era: "v2",
  },
  {
    id: "route-4",
    position: [1.05, 3.05, 0.12],
    rotation: [0.05, -0.28, 0.16],
    scale: 0.68,
    kind: "route",
    line: "blue",
    era: "v3",
  },
  {
    id: "ochre-1",
    position: [-2.15, -0.85, 0.12],
    rotation: [0.3, 0.7, -0.2],
    scale: 0.52,
    kind: "fill",
    line: "ochre",
  },
  {
    id: "ochre-2",
    position: [-1.85, 1.85, 0.12],
    rotation: [0.1, 0.9, 0.05],
    scale: 0.48,
    kind: "fill",
    line: "ochre",
  },
  {
    id: "ochre-3",
    position: [-1.55, 3.2, 0.12],
    rotation: [0.16, 0.4, -0.08],
    scale: 0.5,
    kind: "fill",
    line: "ochre",
  },
  {
    id: "clay-1",
    position: [2.35, 0.35, 0.12],
    rotation: [-0.2, -0.5, 0.18],
    scale: 0.58,
    kind: "fill",
    line: "clay",
  },
  {
    id: "clay-2",
    position: [2.05, 2.65, 0.12],
    rotation: [0.25, -0.15, -0.12],
    scale: 0.55,
    kind: "fill",
    line: "clay",
  },
  {
    id: "sage-1",
    position: [0.15, 3.55, 0.12],
    rotation: [-0.12, 0.33, 0.2],
    scale: 0.46,
    kind: "fill",
    line: "sage",
  },
  {
    id: "sage-2",
    position: [-0.85, 4.15, 0.12],
    rotation: [0.08, -0.22, 0.14],
    scale: 0.44,
    kind: "fill",
    line: "sage",
  },
];

export const WALL = {
  size: [16, 12] as [number, number],
  position: [0, 1.25, 0] as Vec3,
  rotation: [0.16, 0, 0] as Vec3,
};

export const LIGHT_RIG = {
  key: [1.15, 1.55, 2.1] as Vec3,
  holdFill: [0.28, 0.55, 1.35] as Vec3,
  rim: [-2.8, 0.6, -1.4] as Vec3,
  fill: [2.2, 3.4, 6.5] as Vec3,
};

export type StoryTweak = {
  key: number;
  rim: number;
  fill: number;
  ambient: number;
  hero: number;
  fog: number;
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  lookZ: number;
  keyX: number;
  keyY: number;
  keyZ: number;
};

export function createStoryTweak(): StoryTweak {
  return {
    key: 1,
    rim: 1,
    fill: 2,
    ambient: 1,
    hero: 1,
    fog: 1,
    camX: 0,
    camY: 0,
    camZ: 0,
    lookX: 0,
    lookY: 0,
    lookZ: 0,
    keyX: 0,
    keyY: 0,
    keyZ: 0,
  };
}

export const SCROLL_VH = 6.2;
export const REDUCED_SCROLL_VH = 2.6;

export function proxyFromKey(key: CameraKey): StoryProxy {
  return {
    camX: key.position[0],
    camY: key.position[1],
    camZ: key.position[2],
    lookX: key.lookAt[0],
    lookY: key.lookAt[1],
    lookZ: key.lookAt[2],
    fov: key.fov,
    key: key.key,
    rim: key.rim,
    fill: key.fill,
    ambient: key.ambient,
    fog: key.fog,
    hero: REST_LIGHT.hero,
    route: 0,
    bg: 0,
  };
}

export type IntroOrbit = {
  angle: number;
  radius: number;
  y: number;
  fov: number;
  key: number;
  rim: number;
  ambient: number;
  fog: number;
  hero: number;
};

export function getIntroOrbit(rest: CameraKey) {
  const look = rest.lookAt;
  const endAngle = Math.atan2(
    rest.position[2] - look[2],
    rest.position[0] - look[0],
  );
  const endRadius = Math.hypot(
    rest.position[0] - look[0],
    rest.position[2] - look[2],
  );
  const start: IntroOrbit = {
    angle: endAngle - Math.PI * 2,
    radius: endRadius * INTRO.radiusScale,
    y: rest.position[1] + INTRO.extraY,
    fov: rest.fov + INTRO.extraFov,
    key: INTRO.startKey,
    rim: INTRO.startRim,
    ambient: INTRO.startAmbient,
    fog: INTRO.startFog,
    hero: INTRO.startHero,
  };
  return { look, endAngle, endRadius, start };
}

export function applyIntroOrbit(
  proxy: StoryProxy,
  orbit: IntroOrbit,
  look: Vec3,
) {
  proxy.camX = look[0] + Math.cos(orbit.angle) * orbit.radius;
  proxy.camY = orbit.y;
  proxy.camZ = look[2] + Math.sin(orbit.angle) * orbit.radius;
  proxy.lookX = look[0];
  proxy.lookY = look[1];
  proxy.lookZ = look[2];
  proxy.fov = orbit.fov;
  proxy.key = orbit.key;
  proxy.rim = orbit.rim;
  proxy.fill = 0;
  proxy.ambient = orbit.ambient;
  proxy.fog = orbit.fog;
  proxy.hero = orbit.hero;
  proxy.route = 0;
  proxy.bg = 0;
}

export function introStartPosition(rest: CameraKey): Vec3 {
  const { look, start } = getIntroOrbit(rest);
  return [
    look[0] + Math.cos(start.angle) * start.radius,
    start.y,
    look[2] + Math.sin(start.angle) * start.radius,
  ];
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 2;
}

export function sampleIntro(rest: CameraKey, time: number): IntroOrbit {
  const { endAngle, endRadius, start } = getIntroOrbit(rest);
  const orbitDur = INTRO.duration;
  const lightDur = INTRO.lightDuration;
  const orbitT = easeInOut(Math.min(1, time / orbitDur));
  const lightT = easeOut(
    Math.max(0, Math.min(1, (time - 0.22) / (orbitDur * 0.8 + lightDur * 0.2))),
  );
  return {
    angle: start.angle + (endAngle - start.angle) * orbitT,
    radius: start.radius + (endRadius - start.radius) * orbitT,
    y: start.y + (rest.position[1] - start.y) * orbitT,
    fov: start.fov + (rest.fov - start.fov) * orbitT,
    key: start.key + (REST_LIGHT.key - start.key) * lightT,
    rim: start.rim + (REST_LIGHT.rim - start.rim) * lightT,
    ambient: start.ambient + (REST_LIGHT.ambient - start.ambient) * lightT,
    fog: start.fog + (REST_LIGHT.fog - start.fog) * lightT,
    hero: start.hero + (REST_LIGHT.hero - start.hero) * lightT,
  };
}

export const INTRO_TOTAL = INTRO.duration + INTRO.lightDuration * 0.55;

export function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export type StoryCapabilities = {
  mobile: boolean;
  reducedMotion: boolean;
  shadows: boolean;
  dpr: [number, number];
};

let cachedCapabilities: StoryCapabilities | null = null;

export function getStoryCapabilities(): StoryCapabilities {
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const shadows = !mobile;
  const dpr: [number, number] = mobile ? [1, 1.25] : [1, 1.75];
  if (
    cachedCapabilities &&
    cachedCapabilities.mobile === mobile &&
    cachedCapabilities.reducedMotion === reducedMotion &&
    cachedCapabilities.shadows === shadows &&
    cachedCapabilities.dpr[0] === dpr[0] &&
    cachedCapabilities.dpr[1] === dpr[1]
  ) {
    return cachedCapabilities;
  }
  cachedCapabilities = { mobile, reducedMotion, shadows, dpr };
  return cachedCapabilities;
}
