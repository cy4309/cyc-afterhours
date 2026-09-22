"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { Wordmark } from "@/components/climbing/Wordmark";
import { motion, motionEase } from "@/lib/motion";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function HoldMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/hold-2-illus-blue.png"
      alt=""
      width={28}
      height={28}
      className="size-7 origin-center animate-breathe drop-shadow-md transition-transform duration-fast ease-micro group-hover:scale-125 group-hover:animate-none group-active:scale-90 motion-reduce:animate-none motion-reduce:transform-none motion-reduce:transition-none"
    />
  );
}

export function SiteChrome() {
  const pathname = usePathname();
  const chromeRef = useRef<HTMLAnchorElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const flyingRef = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(true);
  const [open, setOpen] = useState(false);
  const [pathWhenOpened, setPathWhenOpened] = useState(pathname);
  if (pathname !== pathWhenOpened) {
    setPathWhenOpened(pathname);
    setOpen(false);
    setIntro(true);
  }

  useLayoutEffect(() => {
    if (!intro || prefersReducedMotion()) return;

    const overlay = overlayRef.current;
    const flying = flyingRef.current;
    const chrome = chromeRef.current;
    if (!overlay || !flying || !chrome) return;

    gsap.set(overlay, { yPercent: 0 });
    gsap.set(flying, { x: 0, y: 0, opacity: 1 });

    const from = flying.getBoundingClientRect();
    const to = chrome.getBoundingClientRect();

    const timeline = gsap.timeline({
      onComplete: () => setIntro(false),
    });
    timeline
      .fromTo(
        flying,
        { y: 10, opacity: 0.35 },
        { y: 0, opacity: 1, duration: motion.fast, ease: motionEase.micro },
      )
      .to(
        overlay,
        { yPercent: -100, duration: 0.75, ease: motionEase.scene },
        0.35,
      )
      .to(
        flying,
        {
          x: to.left - from.left,
          y: to.top - from.top,
          duration: 0.75,
          ease: motionEase.scene,
        },
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
  }, [intro, pathname]);

  return (
    <header className="absolute inset-x-0 top-0 z-20 flex w-full items-start justify-between px-4 py-4">
      <Link
        ref={chromeRef}
        href="/"
        className={intro ? "invisible motion-reduce:visible" : undefined}
      >
        <Wordmark />
      </Link>

      <div className="flex flex-col items-end justify-center gap-2">
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="group cursor-pointer p-2"
          onClick={() => setOpen((current) => !current)}
        >
          <HoldMark />
        </button>

        {open ? (
          <>
            <Link
              href="/archive"
              className="bg-white p-2 text-kicker uppercase tracking-kicker text-mute hover:text-ink"
            >
              Archive
            </Link>
            <Link
              href="/upload"
              className="bg-white p-2 text-kicker uppercase tracking-kicker text-mute hover:text-ink"
            >
              Upload
            </Link>
          </>
        ) : null}
      </div>

      {intro ? (
        <>
          <div
            ref={overlayRef}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md motion-reduce:hidden"
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center motion-reduce:hidden">
            <div ref={flyingRef} className="inline-flex">
              <Wordmark />
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
