import Link from "next/link";
import { VideoCard } from "@/components/climbing/VideoCard";
import type { ClimbWithMedia } from "@/lib/types/climbing";

type ArchiveProps = {
  climbs: ClimbWithMedia[];
};

export function Archive({ climbs }: ArchiveProps) {
  if (climbs.length === 0) {
    return <p className="mt-24 text-sm uppercase tracking-[0.22em] text-neutral-400">No climbs.</p>;
  }

  return (
    <div className="mt-16 columns-1 gap-8 sm:columns-2 lg:columns-3">
      {climbs.map((climb, index) => (
        <Link
          key={climb.id}
          href={`/climb/${climb.id}`}
          className="mb-8 block"
          style={{ marginTop: index % 3 === 1 ? "3rem" : undefined }}
        >
          <VideoCard
            climb={climb}
            videoUrl={climb.videoUrl}
            posterUrl={climb.posterUrl}
          />
        </Link>
      ))}
    </div>
  );
}
