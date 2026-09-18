"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { GradeFilter } from "@/components/climbing/GradeFilter";
import { ScrollArea } from "@/components/climbing/ScrollArea";
import { useSharedMedia } from "@/components/climbing/SharedMedia";
import { VideoCard } from "@/components/climbing/VideoCard";
import { motion, motionEase, motionMs } from "@/lib/motion";
import { formatClimbMonth } from "@/lib/format";
import { climbHref, type ClimbWithMedia, type GradeFilter as GradeFilterValue } from "@/lib/types/climbing";

type ArchiveProps = {
  climbs: ClimbWithMedia[];
  initialFilter: GradeFilterValue;
};

type ExitRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function isVisible(climb: ClimbWithMedia, filter: GradeFilterValue): boolean {
  return filter === "ALL" || climb.grade === filter;
}

function groupByMonth(climbs: ClimbWithMedia[]): { month: string; climbs: ClimbWithMedia[] }[] {
  const groups = new Map<string, ClimbWithMedia[]>();
  for (const climb of climbs) {
    const month = formatClimbMonth(climb.date);
    const current = groups.get(month);
    if (current) current.push(climb);
    else groups.set(month, [climb]);
  }
  return [...groups.entries()].map(([month, items]) => ({ month, climbs: items }));
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function snapshotViewport(root: HTMLElement): Map<string, DOMRect> {
  const next = new Map<string, DOMRect>();
  root.querySelectorAll<HTMLElement>("[data-flip-id]").forEach((node) => {
    if (node.dataset.exiting === "true") return;
    next.set(node.dataset.flipId ?? "", node.getBoundingClientRect());
  });
  return next;
}

function toLocalRect(root: HTMLElement, rect: DOMRect): ExitRect {
  const origin = root.getBoundingClientRect();
  return {
    left: rect.left - origin.left,
    top: rect.top - origin.top,
    width: rect.width,
    height: rect.height,
  };
}

export function Archive({ climbs, initialFilter }: ArchiveProps) {
  const router = useRouter();
  const { state, openFromArchive, completeClose, completeEnter } = useSharedMedia();
  const gridRef = useRef<HTMLDivElement>(null);
  const firstRects = useRef<Map<string, DOMRect>>(new Map());
  const exitTimer = useRef<number>(0);
  const [filter, setFilter] = useState(initialFilter);
  const [exiting, setExiting] = useState<Record<string, ExitRect>>({});

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useLayoutEffect(() => {
    if (state.phase !== "closing" || !state.id) return;
    const root = gridRef.current;
    const node = root?.querySelector(`[data-flip-id="${state.id}"] [data-media-frame]`);
    completeClose(state.id, node instanceof HTMLElement ? node.getBoundingClientRect() : null);
  }, [completeClose, state.id, state.phase]);

  useLayoutEffect(() => {
    if (state.phase !== "entering" || !state.id) return;
    const root = gridRef.current;
    const card = root?.querySelector(`[data-flip-id="${state.id}"]`);
    const node = card?.querySelector("[data-media-frame]");
    if (card instanceof HTMLElement) {
      card.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    completeEnter(state.id, node instanceof HTMLElement ? node.getBoundingClientRect() : null);
  }, [climbs, completeEnter, state.id, state.phase]);

  function select(next: GradeFilterValue) {
    if (next === filter) return;

    const root = gridRef.current;
    if (root && !prefersReducedMotion()) {
      const current = snapshotViewport(root);
      firstRects.current = current;
      const leaving: Record<string, ExitRect> = {};
      for (const climb of climbs) {
        if (isVisible(climb, filter) && !isVisible(climb, next)) {
          const rect = current.get(climb.id);
          if (rect) leaving[climb.id] = toLocalRect(root, rect);
        }
      }
      window.clearTimeout(exitTimer.current);
      setExiting(leaving);
      exitTimer.current = window.setTimeout(() => setExiting({}), motionMs.normal);
    } else {
      firstRects.current = new Map();
      setExiting({});
    }

    setFilter(next);
    void router.replace(next === "ALL" ? "/" : `/?grade=${next}`, { scroll: false });
  }

  useLayoutEffect(() => {
    const root = gridRef.current;
    const first = firstRects.current;
    if (!root || first.size === 0 || prefersReducedMotion()) return;

    const nodes = [...root.querySelectorAll<HTMLElement>("[data-flip-id]:not([data-exiting='true'])")];
    const tweens: gsap.core.Tween[] = [];

    for (const node of nodes) {
      const id = node.dataset.flipId;
      if (!id) continue;
      const last = node.getBoundingClientRect();
      const prev = first.get(id);

      if (!prev) {
        tweens.push(
          gsap.fromTo(
            node,
            { opacity: 0, scale: 0.96 },
            { opacity: 1, scale: 1, duration: motion.normal, ease: motionEase.layout, overwrite: "auto" },
          ),
        );
        continue;
      }

      const dx = prev.left - last.left;
      const dy = prev.top - last.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

      tweens.push(
        gsap.fromTo(
          node,
          { x: dx, y: dy },
          { x: 0, y: 0, duration: motion.normal, ease: motionEase.layout, overwrite: "auto" },
        ),
      );
    }

    root.querySelectorAll<HTMLElement>("[data-exiting='true']").forEach((node) => {
      tweens.push(
        gsap.fromTo(
          node,
          { opacity: 1, scale: 1 },
          { opacity: 0, scale: 0.95, duration: motion.normal, ease: motionEase.layout, overwrite: "auto" },
        ),
      );
    });

    firstRects.current = new Map();
    return () => {
      tweens.forEach((tween) => tween.kill());
      for (const node of nodes) {
        gsap.set(node, { clearProps: "transform,opacity" });
      }
    };
  }, [filter]);

  const visible = climbs.filter((climb) => isVisible(climb, filter));
  const months = groupByMonth(visible);

  return (
    <>
      <div className="w-full shrink-0 px-4 pb-5">
        <GradeFilter active={filter} onSelect={select} />
      </div>

      {visible.length === 0 ? (
        <p className="w-full px-4 text-center text-kicker uppercase tracking-kicker text-mute">
          No climbs.
        </p>
      ) : (
        <ScrollArea className="min-h-0 w-full flex-1 md:h-[400px] md:flex-none">
          <div ref={gridRef} className="relative space-y-10 px-4 pb-safe-16">
            {months.map((group) => (
              <section key={group.month} aria-label={group.month} className="space-y-3">
                <h2 className="border-b border-ink/10 pb-2 text-kicker uppercase tracking-kicker text-mute">
                  {group.month}
                </h2>
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
                  {group.climbs.map((climb) => (
                    <Link
                      key={climb.id}
                      href={climbHref(climb.id, filter)}
                      data-flip-id={climb.id}
                      className={
                        state.phase !== "idle" && state.id === climb.id
                          ? "pointer-events-none block opacity-0"
                          : "block cursor-zoom-in"
                      }
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                          return;
                        }
                        const frame = event.currentTarget.querySelector("[data-media-frame]");
                        if (!(frame instanceof HTMLElement)) return;
                        event.preventDefault();
                        openFromArchive({
                          id: climb.id,
                          href: climbHref(climb.id, filter),
                          posterUrl: climb.posterUrl,
                          from: frame.getBoundingClientRect(),
                          returnHref: filter === "ALL" ? "/" : `/?grade=${filter}`,
                        });
                      }}
                    >
                      <VideoCard
                        climb={climb}
                        videoUrl={climb.videoUrl}
                        posterUrl={climb.posterUrl}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            {Object.entries(exiting).map(([id, rect]) => {
              const climb = climbs.find((item) => item.id === id);
              if (!climb) return null;
              return (
                <div
                  key={`exit-${id}`}
                  data-flip-id={id}
                  data-exiting="true"
                  className="pointer-events-none absolute origin-center"
                  style={{
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                  }}
                >
                  <VideoCard
                    climb={climb}
                    videoUrl={climb.videoUrl}
                    posterUrl={climb.posterUrl}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </>
  );
}
