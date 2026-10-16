"use client";

import Link from "next/link";
import { STORY_ERAS } from "./storyConfig";
import type { OverlayElsRef } from "./storyRuntime";

type StoryOverlayProps = {
  overlayRef: OverlayElsRef;
};

export function StoryOverlay({ overlayRef }: StoryOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-paper">
      <div className="absolute left-4 top-4 flex flex-col gap-1 sm:left-6 sm:top-6">
        <p
          ref={(node) => {
            overlayRef.current.chapterVoid = node;
          }}
          className="text-kicker uppercase tracking-kicker text-paper/45 opacity-0"
        >
          01 / The Void
        </p>
        <p
          ref={(node) => {
            overlayRef.current.chapterSurface = node;
          }}
          className="absolute left-0 top-0 text-kicker uppercase tracking-kicker text-paper/45 opacity-0"
        >
          02 / The Surface
        </p>
        <p
          ref={(node) => {
            overlayRef.current.chapterWall = node;
          }}
          className="absolute left-0 top-0 text-kicker uppercase tracking-kicker text-paper/45 opacity-0"
        >
          03 / The Wall
        </p>
      </div>

      <div
        ref={(node) => {
          overlayRef.current.voidCopy = node;
        }}
        className="absolute inset-x-4 top-[18%] opacity-0 sm:inset-x-8"
      >
        <Link
          href="/"
          className="pointer-events-auto text-kicker font-semibold uppercase tracking-mark text-paper/90"
        >
          Afterhours
        </Link>
        <p className="mt-3 max-w-[16rem] text-kicker uppercase tracking-kicker text-paper/50">
          A study of movement
        </p>
      </div>

      <p
        ref={(node) => {
          overlayRef.current.surfaceCopy = node;
        }}
        className="sr-only"
      >
        The Surface
      </p>

      <p
        ref={(node) => {
          overlayRef.current.wallCopy = node;
        }}
        className="absolute inset-x-4 bottom-[18%] text-kicker uppercase tracking-kicker text-paper/70 opacity-0 sm:inset-x-8"
      >
        One hold. A whole wall.
      </p>

      <div
        ref={(node) => {
          overlayRef.current.timeline = node;
        }}
        className="absolute inset-x-4 bottom-[18%] flex flex-col gap-2 opacity-0 sm:inset-x-8"
      >
        <p
          ref={(node) => {
            overlayRef.current.eraV1 = node;
          }}
          className="text-kicker uppercase tracking-kicker text-paper/70"
        >
          {STORY_ERAS[0].label}
        </p>
        <p
          ref={(node) => {
            overlayRef.current.eraV2 = node;
          }}
          className="text-kicker uppercase tracking-kicker text-paper/70"
        >
          {STORY_ERAS[1].label}
        </p>
        <p
          ref={(node) => {
            overlayRef.current.eraV3 = node;
          }}
          className="text-kicker uppercase tracking-kicker text-paper/70"
        >
          {STORY_ERAS[2].label}
        </p>
      </div>

      <p
        ref={(node) => {
          overlayRef.current.scrollHint = node;
        }}
        className="absolute inset-x-0 bottom-8 text-center text-caption uppercase tracking-caption text-paper/40 opacity-0"
      >
        Scroll to enter
      </p>
    </div>
  );
}

export function StoryFallback() {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col bg-[#050506] px-6 py-8 text-paper">
      <p className="text-kicker uppercase tracking-kicker text-paper/45">01 / The Void</p>
      <Link
        href="/"
        className="mt-8 text-kicker font-semibold uppercase tracking-mark text-paper/90"
      >
        Afterhours
      </Link>
      <p className="mt-3 text-kicker uppercase tracking-kicker text-paper/50">
        A study of movement
      </p>
      <div className="mx-auto mt-16 size-40 rounded-full bg-blue/80 shadow-[0_0_80px_#1e8bc5]" />
      <div className="mt-auto flex flex-col gap-2 text-kicker uppercase tracking-kicker text-paper/40">
        {STORY_ERAS.map((era) => (
          <p key={era.id}>{era.label}</p>
        ))}
      </div>
    </div>
  );
}
