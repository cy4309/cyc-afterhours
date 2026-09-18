"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useSharedMedia } from "@/components/climbing/SharedMedia";
import { motion, motionEase } from "@/lib/motion";

type ArchiveIntroProps = {
  children: ReactNode;
};

let introConsumed = false;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ArchiveIntro({ children }: ArchiveIntroProps) {
  const { state } = useSharedMedia();
  const overlayRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLParagraphElement>(null);
  const phaseRef = useRef(state.phase);
  const [visible, setVisible] = useState(true);

  useLayoutEffect(() => {
    phaseRef.current = state.phase;
  }, [state.phase]);

  useLayoutEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  useLayoutEffect(() => {
    if (!visible) return;

    const finish = () => {
      introConsumed = true;
      const chrome = document.querySelector<HTMLElement>("[data-site-wordmark]");
      if (chrome) gsap.set(chrome, { clearProps: "opacity" });
      setVisible(false);
    };

    if (introConsumed || prefersReducedMotion() || phaseRef.current !== "idle") {
      finish();
      return;
    }

    const overlay = overlayRef.current;
    const wordmark = wordmarkRef.current;
    const chrome = document.querySelector<HTMLElement>("[data-site-wordmark]");
    if (!overlay || !wordmark) return;

    gsap.set(wordmark, { x: 0, y: 0, opacity: 1 });
    if (chrome) gsap.set(chrome, { opacity: 0 });

    const from = wordmark.getBoundingClientRect();
    const to = chrome?.getBoundingClientRect();
    const dx = to ? to.left - from.left : 0;
    const dy = to ? to.top - from.top : 0;

    const timeline = gsap.timeline({ onComplete: finish });
    timeline
      .fromTo(
        wordmark,
        { y: 10, opacity: 0.35 },
        { y: 0, opacity: 1, duration: motion.fast, ease: motionEase.micro },
      )
      .to(
        overlay,
        { yPercent: -100, duration: 0.75, ease: motionEase.scene },
        0.35,
      )
      .to(
        wordmark,
        { x: dx, y: dy, duration: 0.75, ease: motionEase.scene },
        0.35,
      );

    const skip = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      timeline.progress(1);
    };

    overlay.addEventListener("pointerdown", skip);
    return () => {
      timeline.kill();
      overlay.removeEventListener("pointerdown", skip);
      if (chrome) gsap.set(chrome, { clearProps: "opacity" });
      gsap.set(wordmark, { clearProps: "transform,opacity" });
    };
  }, [visible]);

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden md:flex-none">
      {children}
      {visible ? (
        <>
          <div ref={overlayRef} className="fixed inset-0 z-40 bg-paper" />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
            <p
              ref={wordmarkRef}
              className="inline-block text-kicker uppercase tracking-mark"
            >
              cyc-afterhours
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
