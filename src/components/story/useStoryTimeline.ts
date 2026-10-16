"use client";

/* eslint-disable react-hooks/immutability -- GSAP mutates the story runtime proxy */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  REST_LIGHT,
  STORY_BEATS,
  applyIntroOrbit,
  getIntroOrbit,
  getStoryCameraKeys,
  proxyFromKey,
  type CameraKey,
} from "./storyConfig";
import { setStoryHeaderHidden } from "./storyChrome";
import type { OverlayElsRef, StoryRuntime } from "./storyRuntime";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function tweenProxy(key: CameraKey) {
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
  };
}

type Options = {
  scrollerRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLElement | null>;
  overlayRef: OverlayElsRef;
  runtime: StoryRuntime;
  reducedMotion: boolean;
  mobile: boolean;
};

export function useStoryTimeline({
  scrollerRef,
  trackRef,
  overlayRef,
  runtime,
  reducedMotion,
  mobile,
}: Options) {
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    let cancelled = false;
    let scrollCtx: gsap.Context | null = null;
    const keys = getStoryCameraKeys(mobile, reducedMotion);
    const rest = keys[0];
    const { look, start } = getIntroOrbit(rest);

    const introAlreadyDone = !runtime.introActive && runtime.introTime > 0;
    if (!introAlreadyDone) {
      runtime.introActive = true;
      runtime.introTime = 0;
      setStoryHeaderHidden(false);
      applyIntroOrbit(runtime.proxy, start, look);
    } else {
      setStoryHeaderHidden(true);
    }

    const els = overlayRef.current;
    const introHidden = [els.voidCopy, els.scrollHint, els.chapterVoid].filter(Boolean);
    gsap.set(introHidden, { opacity: 0 });

    const revealCopy = () => {
      if (els.voidCopy) gsap.to(els.voidCopy, { opacity: 1, duration: 0.5, ease: "power2.out" });
      if (els.scrollHint) {
        gsap.to(els.scrollHint, { opacity: 1, duration: 0.5, delay: 0.12, ease: "power2.out" });
      }
      if (els.chapterVoid) gsap.to(els.chapterVoid, { opacity: 1, duration: 0.4, ease: "power2.out" });
    };

    const buildScrollTimeline = () => {
      Object.assign(runtime.proxy, proxyFromKey(rest), REST_LIGHT);
      scrollCtx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            scroller,
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: reducedMotion ? 0.15 : 0.7,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
          },
        });

        for (let i = 1; i < keys.length; i += 1) {
          const prev = keys[i - 1];
          const next = keys[i];
          tl.to(
            runtime.proxy,
            {
              ...tweenProxy(next),
              duration: next.t - prev.t,
              ease: next.ease,
            },
            prev.t,
          );
        }

        if (els.scrollHint) {
          tl.to(els.scrollHint, { opacity: 0, duration: 0.06 }, 0.03);
        }
        if (els.voidCopy) {
          tl.to(els.voidCopy, { opacity: 0, duration: 0.08 }, reducedMotion ? 0.28 : 0.18);
        }
        if (els.surfaceCopy) {
          gsap.set(els.surfaceCopy, { opacity: 0 });
          tl.to(els.surfaceCopy, { opacity: 1, duration: 0.06 }, 0.38);
          tl.to(els.surfaceCopy, { opacity: 0, duration: 0.06 }, 0.58);
        }
        if (els.wallCopy) {
          gsap.set(els.wallCopy, { opacity: 0 });
          tl.to(els.wallCopy, { opacity: 1, duration: 0.07 }, STORY_BEATS.wallCopyIn);
          tl.to(els.wallCopy, { opacity: 0, duration: 0.06 }, STORY_BEATS.wallCopyOut);
        }
        if (els.timeline) {
          gsap.set(els.timeline, { opacity: 0 });
          tl.to(els.timeline, { opacity: 1, duration: 0.06 }, STORY_BEATS.timelineIn);
        }
        const eraLines = [
          [els.eraV1, STORY_BEATS.eraAt.v1],
          [els.eraV2, STORY_BEATS.eraAt.v2],
          [els.eraV3, STORY_BEATS.eraAt.v3],
        ] as const;
        eraLines.forEach(([node, at]) => {
          if (!node) return;
          gsap.set(node, { opacity: STORY_BEATS.lineDim });
          tl.to(node, { opacity: 1, duration: 0.08 }, at);
        });
        if (els.chapterVoid) {
          tl.to(els.chapterVoid, { opacity: 0, duration: 0.04 }, 0.33);
        }
        if (els.chapterSurface) {
          gsap.set(els.chapterSurface, { opacity: 0 });
          tl.to(els.chapterSurface, { opacity: 1, duration: 0.04 }, 0.34);
          tl.to(els.chapterSurface, { opacity: 0, duration: 0.04 }, 0.52);
        }
        if (els.chapterWall) {
          gsap.set(els.chapterWall, { opacity: 0 });
          tl.to(els.chapterWall, { opacity: 1, duration: 0.04 }, 0.54);
        }

        STORY_BEATS.routeSteps.forEach((step) => {
          tl.to(
            runtime.proxy,
            { route: step.to, duration: step.duration, ease: "none" },
            step.at,
          );
        });
        tl.to(
          runtime.proxy,
          { bg: 1, duration: STORY_BEATS.bgDuration, ease: "power1.inOut" },
          STORY_BEATS.bgAt,
        );
      }, scroller);
      ScrollTrigger.refresh();
    };

    const finishIntro = () => {
      if (cancelled) return;
      runtime.introActive = false;
      scroller.scrollTop = 0;
      Object.assign(runtime.proxy, proxyFromKey(rest), REST_LIGHT);
      setStoryHeaderHidden(true);
      revealCopy();
      buildScrollTimeline();
    };

    runtime.onIntroComplete = finishIntro;
    if (introAlreadyDone) buildScrollTimeline();

    const refresh = () => ScrollTrigger.refresh();
    const resize = new ResizeObserver(refresh);
    resize.observe(scroller);
    window.addEventListener("resize", refresh);

    let lastY = scroller.scrollTop;
    const revealHeader = (goingUp: boolean) => {
      if (runtime.introActive) return;
      setStoryHeaderHidden(!goingUp);
    };
    const onScroll = () => {
      const y = scroller.scrollTop;
      const dy = y - lastY;
      lastY = y;
      if (Math.abs(dy) < 6) return;
      revealHeader(dy < 0);
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) return;
      revealHeader(event.deltaY < 0);
    };
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchY;
      const dy = y - touchY;
      touchY = y;
      if (Math.abs(dy) < 8) return;
      revealHeader(dy > 0);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("touchmove", onTouchMove, { passive: true });

    const onPointer = (event: PointerEvent) => {
      const box = scroller.getBoundingClientRect();
      runtime.pointer.x = ((event.clientX - box.left) / box.width) * 2 - 1;
      runtime.pointer.y = -(((event.clientY - box.top) / box.height) * 2 - 1);
    };
    const onLeave = () => {
      runtime.pointer.x = 0;
      runtime.pointer.y = 0;
    };
    scroller.addEventListener("pointermove", onPointer);
    scroller.addEventListener("pointerleave", onLeave);

    return () => {
      cancelled = true;
      runtime.onIntroComplete = null;
      runtime.onCanvasReady = null;
      scrollCtx?.revert();
      resize.disconnect();
      window.removeEventListener("resize", refresh);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("pointermove", onPointer);
      scroller.removeEventListener("pointerleave", onLeave);
      setStoryHeaderHidden(false);
    };
  }, [mobile, overlayRef, reducedMotion, runtime, scrollerRef, trackRef]);
}
