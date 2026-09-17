"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useSharedMedia } from "@/components/climbing/SharedMedia";
import { ARCHIVE_ENTERED_COOKIE } from "@/lib/archive-entered";
import { motion, motionEase } from "@/lib/motion";

type ArchiveIntroProps = {
  playIntro: boolean;
  children: ReactNode;
};

function markEntered() {
  document.cookie = `${ARCHIVE_ENTERED_COOKIE}=1; Path=/; SameSite=Lax`;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ArchiveIntro({ playIntro, children }: ArchiveIntroProps) {
  const { state } = useSharedMedia();
  const overlayRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLParagraphElement>(null);
  const phaseRef = useRef(state.phase);
  const [visible, setVisible] = useState(playIntro);

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
    if (!playIntro) return;

    if (prefersReducedMotion() || phaseRef.current !== "idle") {
      markEntered();
      setVisible(false);
      return;
    }

    const overlay = overlayRef.current;
    const wordmark = wordmarkRef.current;
    if (!overlay || !wordmark) return;

    const done = () => {
      markEntered();
      setVisible(false);
    };

    const timeline = gsap.timeline({ onComplete: done });
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
    };
  }, [playIntro]);

  return (
    <div className="relative flex w-full flex-1 flex-col overflow-hidden pt-20">
      {children}
      {visible ? (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--paper)]"
        >
          <p ref={wordmarkRef} className="text-[11px] uppercase tracking-[0.32em]">
            cyc-afterhours
          </p>
        </div>
      ) : null}
    </div>
  );
}
