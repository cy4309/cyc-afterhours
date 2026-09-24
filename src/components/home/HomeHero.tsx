"use client";

import { useEffect, useRef, useState } from "react";

type HomeHeroProps = {
  videoUrl?: string;
  posterUrl?: string;
};

export function HomeHero({ videoUrl, posterUrl }: HomeHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [film, setFilm] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (film) {
      void video.play().catch(() => undefined);
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [film]);

  return (
    <section className="relative min-h-0 w-full flex-1 overflow-hidden bg-paper">
      <h1 className="sr-only">cyc-afterhours</h1>
      <div
        className={`absolute inset-0 ${
          film ? "scale-110 blur-md brightness-90" : ""
        }`}
      >
        <picture className="block h-full w-full">
          <source media="(min-width: 768px)" srcSet="/climbing-3-2.jpg" />
          <img
            src="/climbing-2-1.jpg"
            // src="/climbing-2-1.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </picture>
      </div>
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          muted
          playsInline
          loop
          preload="metadata"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-fast ease-micro motion-reduce:transition-none md:inset-auto md:left-1/2 md:top-1/2 md:h-[90%] md:w-auto md:aspect-[9/16] md:-translate-x-1/2 md:-translate-y-1/2 md:object-contain ${
            film ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
      {videoUrl ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-safe-16">
          <button
            type="button"
            aria-pressed={film}
            className="cursor-pointer text-kicker uppercase tracking-mark drop-shadow-md bg-white text-ink p-2"
            onClick={() => setFilm((current) => !current)}
          >
            {film ? "Still" : "Film"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
