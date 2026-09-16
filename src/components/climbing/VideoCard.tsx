"use client";

import { useEffect, useRef, useState } from "react";
import type { Climb } from "@/lib/types/climbing";

type VideoCardProps = {
  climb: Climb;
  videoUrl: string;
  posterUrl?: string;
  showMeta?: boolean;
};

export function VideoCard({ climb, videoUrl, posterUrl, showMeta = false }: VideoCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVisibleRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
        }
      },
      { threshold: 0.4, rootMargin: "80px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isVisible) {
      void video.play().catch(() => undefined);
      return;
    }
    video.pause();
  }, [isVisible]);

  return (
    <article
      ref={rootRef}
      data-grade={climb.grade}
      data-visible={isVisible}
      data-playing={isPlaying}
      data-loading={loading}
      aria-label={`${climb.grade} at ${climb.gym} on ${climb.date}`}
      className="group relative break-inside-avoid"
    >
      <div className="relative overflow-hidden bg-neutral-200 aspect-[3/4]">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-200" />
        )}

        {hasBeenVisible && !mediaError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            muted
            playsInline
            loop
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            onCanPlay={() => {
              if (isVisibleRef.current) {
                void videoRef.current?.play().catch(() => undefined);
              }
            }}
            onWaiting={() => setLoading(true)}
            onPlaying={() => {
              setLoading(false);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              setMediaError(true);
              setLoading(false);
              setIsPlaying(false);
            }}
          />
        ) : null}

        {loading ? <div className="absolute inset-0 bg-black/10" aria-hidden /> : null}
      </div>

      {showMeta ? (
        <dl className="mt-3 space-y-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
          <div>{climb.grade}</div>
          <div>{climb.date}</div>
          <div>{climb.gym}</div>
          {climb.attempts !== undefined ? <div>{climb.attempts} attempts</div> : null}
        </dl>
      ) : null}
    </article>
  );
}
