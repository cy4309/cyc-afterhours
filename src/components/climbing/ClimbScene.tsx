"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  useSharedMedia,
  type PageDirection,
} from "@/components/climbing/SharedMedia";
import { VideoPlayer } from "@/components/climbing/VideoPlayer";
import { deleteClimb } from "@/lib/api/climbing";
import { formatAttempts, formatClimbDate } from "@/lib/format";
import { motion, motionEase } from "@/lib/motion";
import {
  climbHref,
  type ClimbNeighbor,
  type ClimbWithMedia,
  type GradeFilter,
} from "@/lib/types/climbing";

type ClimbSceneProps = {
  climb: ClimbWithMedia;
  previous: ClimbNeighbor | null;
  next: ClimbNeighbor | null;
  filter: GradeFilter;
  isAdmin: boolean;
};

export function ClimbScene({
  climb,
  previous,
  next,
  filter,
  isAdmin,
}: ClimbSceneProps) {
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDListElement>(null);
  const { state, completeOpen, closeToArchive, pageToNeighbor } =
    useSharedMedia();
  const transitioning = state.phase !== "idle";
  const [deleting, setDeleting] = useState(false);
  const attempts = formatAttempts(climb.attempts);

  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    completeOpen(climb.id, node.getBoundingClientRect());
  }, [climb.id, completeOpen]);

  useLayoutEffect(() => {
    const node = metaRef.current;
    if (!node || transitioning) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.fromTo(
      node,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: motion.fast, ease: motionEase.micro },
    );
    return () => {
      tween.kill();
      gsap.set(node, { clearProps: "transform,opacity" });
    };
  }, [climb.id, transitioning]);

  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (direction: PageDirection) => {
      const neighbor = direction === "next" ? next : previous;
      const node = frameRef.current;
      if (!neighbor || !node || state.phase !== "idle") return;
      pageToNeighbor({
        toId: neighbor.id,
        href: climbHref(neighbor.id, filter),
        direction,
        fromPoster: climb.posterUrl,
        toPoster: neighbor.posterUrl,
        from: node.getBoundingClientRect(),
      });
    },
    [climb.posterUrl, filter, next, pageToNeighbor, previous, state.phase],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go("next");
      if (event.key === "ArrowLeft") go("prev");
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section
      className={`space-y-6 px-4 pt-20 pb-20 ${
        transitioning ? "pointer-events-none opacity-0" : ""
      }`}
      onTouchStart={(event) => {
        if (event.touches.length !== 1) return;
        touchX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchX.current == null) return;
        const dx = event.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 64) return;
        go(dx < 0 ? "next" : "prev");
      }}
    >
      <div className="mx-auto flex w-full items-center justify-between">
        <button
          type="button"
          className="cursor-pointer text-[11px] uppercase tracking-[0.28em] text-[var(--mute)] hover:text-[var(--ink)]"
          onClick={() => {
            const node = frameRef.current;
            if (!node) return;
            closeToArchive({
              id: climb.id,
              posterUrl: climb.posterUrl,
              from: node.getBoundingClientRect(),
            });
          }}
        >
          Archive
        </button>

        <div className="flex gap-6">
          {previous ? (
            <button
              type="button"
              className="cursor-pointer text-[11px] uppercase tracking-[0.28em] text-[var(--mute)] hover:text-[var(--ink)]"
              onClick={() => go("prev")}
            >
              Previous
            </button>
          ) : null}
          {next ? (
            <button
              type="button"
              className="cursor-pointer text-[11px] uppercase tracking-[0.28em] text-[var(--mute)] hover:text-[var(--ink)]"
              onClick={() => go("next")}
            >
              Next
            </button>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[18rem]">
        <div
          ref={frameRef}
          data-media-frame
          className="aspect-[9/16] overflow-hidden bg-black"
        >
          <VideoPlayer
            videoUrl={climb.videoUrl}
            posterUrl={climb.posterUrl}
            autoPlay={!transitioning}
          />
        </div>
      </div>

      <dl ref={metaRef} className="mx-auto w-full flex items-center">
        <div className="text-sm uppercase tracking-[0.28em]">{climb.grade}</div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--mute)]">
          {climb.gym}
        </div>
        {climb.location ? (
          <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--mute)]">
            {climb.location}
          </div>
        ) : null}
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--mute)]">
          {formatClimbDate(climb.date)}
        </div>
        {attempts ? (
          <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--mute)]">
            {attempts} attempts
          </div>
        ) : null}
      </dl>
      {isAdmin ? (
        <div className="mx-auto w-full flex items-center justify-end">
          <button
            type="button"
            disabled={deleting}
            className="cursor-pointer text-[11px] uppercase tracking-[0.28em] text-[var(--mute)] hover:text-[var(--ink)] disabled:text-neutral-300"
            onClick={async () => {
              if (deleting) return;
              if (!window.confirm("Delete this climb?")) return;
              setDeleting(true);
              try {
                await deleteClimb(climb.id);
                router.push("/");
                router.refresh();
              } catch {
                setDeleting(false);
              }
            }}
          >
            {deleting ? "Deleting" : "Delete"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
