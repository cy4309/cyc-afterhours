export const motion = {
  fast: 0.2,
  normal: 0.45,
  slow: 0.8,
  scene: 1.0,
} as const;

export const motionMs = {
  fast: motion.fast * 1000,
  normal: motion.normal * 1000,
  slow: motion.slow * 1000,
  scene: motion.scene * 1000,
} as const;

export const motionEase = {
  micro: "power2.out",
  layout: "power3.out",
  scene: "power4.inOut",
} as const;

