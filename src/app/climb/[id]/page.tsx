import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/climbing/VideoPlayer";
import { getClimbWithMedia } from "@/lib/climbs-service";

type ClimbPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClimbPage({ params }: ClimbPageProps) {
  const { id } = await params;
  const climb = await getClimbWithMedia(id);

  if (!climb) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <Link href="/" className="text-xs uppercase tracking-[0.22em] text-neutral-400 hover:text-black">
        Archive
      </Link>

      <div className="aspect-[9/16] w-full max-w-md bg-black sm:aspect-video sm:max-w-none">
        <VideoPlayer videoUrl={climb.videoUrl} posterUrl={climb.posterUrl} />
      </div>

      <dl className="space-y-2 text-sm uppercase tracking-[0.22em]">
        <div>{climb.grade}</div>
        <div>{climb.gym}</div>
        {climb.location ? <div>{climb.location}</div> : null}
        <div>{climb.date}</div>
        {climb.attempts !== undefined ? <div>{climb.attempts} attempts</div> : null}
      </dl>
    </section>
  );
}
