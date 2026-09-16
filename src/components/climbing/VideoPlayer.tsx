"use client";

import { useEffect, useRef } from "react";

type VideoPlayerProps = {
  videoUrl: string;
  posterUrl?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
};

export function VideoPlayer({
  videoUrl,
  posterUrl,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;
    void video.play().catch(() => undefined);
  }, [autoPlay, videoUrl]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      poster={posterUrl}
      autoPlay={autoPlay}
      muted={muted}
      playsInline
      loop={loop}
      controls={controls}
      preload="metadata"
      className="h-full w-full object-contain bg-black"
    />
  );
}
