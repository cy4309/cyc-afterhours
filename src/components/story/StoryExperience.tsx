"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useSyncExternalStore } from "react";
import { StoryFallback, StoryOverlay } from "./StoryOverlay";
import { StoryTunePanel } from "./StoryTunePanel";
import {
  REDUCED_SCROLL_VH,
  SCROLL_VH,
  canUseWebGL,
  getStoryCapabilities,
} from "./storyConfig";
import { createOverlayEls, createStoryRuntime } from "./storyRuntime";
import { useStoryTimeline } from "./useStoryTimeline";

const StoryCanvas = dynamic(
  () => import("./StoryCanvas").then((module) => module.StoryCanvas),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-[#050506]" />,
  },
);

const fallbackCapabilities = {
  mobile: false,
  reducedMotion: false,
  shadows: false,
  dpr: [1, 1.5] as [number, number],
};

function subscribeCapabilities(onStoreChange: () => void) {
  const mobile = window.matchMedia("(max-width: 768px)");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  mobile.addEventListener("change", onStoreChange);
  motion.addEventListener("change", onStoreChange);
  return () => {
    mobile.removeEventListener("change", onStoreChange);
    motion.removeEventListener("change", onStoreChange);
  };
}

export function StoryExperience() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef(createOverlayEls());
  const runtime = useMemo(() => createStoryRuntime(), []);
  const capabilities = useSyncExternalStore(
    subscribeCapabilities,
    getStoryCapabilities,
    () => fallbackCapabilities,
  );
  const webgl = useSyncExternalStore(
    () => () => undefined,
    canUseWebGL,
    () => true,
  );

  useStoryTimeline({
    scrollerRef,
    trackRef,
    overlayRef,
    runtime,
    reducedMotion: capabilities.reducedMotion,
    mobile: capabilities.mobile,
  });

  const scrollVh = capabilities.reducedMotion ? REDUCED_SCROLL_VH : SCROLL_VH;

  if (!webgl) return <StoryFallback />;

  return (
    <div
      ref={scrollerRef}
      className="h-full min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-[#050506]"
    >
      <div
        ref={trackRef}
        className="relative"
        style={{ height: `${scrollVh * 100}vh` }}
      >
        <div className="sticky top-0 h-dvh w-full overflow-hidden">
          <StoryCanvas
            runtime={runtime}
            shadows={capabilities.shadows}
            mobile={capabilities.mobile}
            reducedMotion={capabilities.reducedMotion}
            dpr={capabilities.dpr}
          />
          <StoryOverlay overlayRef={overlayRef} />
          {process.env.NODE_ENV === "development" ? (
            <StoryTunePanel runtime={runtime} mobile={capabilities.mobile} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
