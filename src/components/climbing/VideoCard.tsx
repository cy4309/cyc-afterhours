"use client";

import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
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
      <div className="relative aspect-video overflow-hidden bg-neutral-100">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {shouldLoad && !videoFailed ? (
          <video
            src={videoUrl}
            poster={posterUrl}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setVideoFailed(true)}
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              if (video.currentTime < 0.05) {
                video.currentTime = 0.1;
              }
            }}
          />
        ) : null}

        <div
          className="absolute bottom-2 left-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-white drop-shadow"
            aria-hidden
          >
            <path d="M8 5.14v13.72L19 12 8 5.14Z" />
          </svg>
        </div>
      </div>

      <p className="mt-1.5 text-[10px] leading-4 text-neutral-500">{climb.date}</p>
    </article>
  );
}
