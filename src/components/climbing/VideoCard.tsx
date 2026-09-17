"use client";

import { useEffect, useRef, useState } from "react";
import { formatAttempts, formatClimbDate } from "@/lib/format";
import type { Climb } from "@/lib/types/climbing";

type VideoCardProps = {
  climb: Climb;
  videoUrl: string;
  posterUrl?: string;
};

export function VideoCard({
  climb,
  videoUrl,
  posterUrl,
}: VideoCardProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const attempts = formatAttempts(climb.attempts);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: "180px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={rootRef}
      data-grade={climb.grade}
      aria-label={`${climb.grade} at ${climb.gym} on ${climb.date}`}
      className="group relative"
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--paper)]" data-media-frame>
        <div className="absolute inset-0 origin-center transition-transform duration-[var(--motion-fast)] ease-[var(--motion-ease-micro)] group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : shouldLoad && !videoFailed ? (
            <video
              src={videoUrl}
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={() => setVideoFailed(true)}
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                if (video.currentTime < 0.05) {
                  video.currentTime = 0.1;
                }
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-2 space-y-0.5 text-[10px] uppercase leading-4 tracking-[0.18em] text-[var(--mute)]">
        <p>{formatClimbDate(climb.date)}</p>
        <p className="opacity-100 transition-opacity duration-[var(--motion-fast)] ease-[var(--motion-ease-micro)] [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none">
          {climb.grade}
          {attempts ? ` · ${attempts}` : null}
        </p>
      </div>
    </article>
  );
}
