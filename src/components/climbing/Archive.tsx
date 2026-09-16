import Link from "next/link";
import { ScrollArea } from "@/components/climbing/ScrollArea";
import { VideoCard } from "@/components/climbing/VideoCard";
import type { ClimbWithMedia } from "@/lib/types/climbing";

type ArchiveProps = {
  climbs: ClimbWithMedia[];
};

export function Archive({ climbs }: ArchiveProps) {
  if (climbs.length === 0) {
    return (
      <p className="w-full px-4 text-center text-xs uppercase tracking-[0.22em] text-neutral-400">
        No climbs.
      </p>
    );
  }

  return (
    <ScrollArea className="h-[250px] w-full md:h-[400px]">
      <div className="grid grid-cols-4 gap-x-2 gap-y-2 px-4">
        {climbs.map((climb) => (
          <Link key={climb.id} href={`/climb/${climb.id}`} className="block">
            <VideoCard
              climb={climb}
              videoUrl={climb.videoUrl}
              posterUrl={climb.posterUrl}
            />
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}
