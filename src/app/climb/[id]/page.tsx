import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/climbing/VideoPlayer";
import { getClimbWithMedia } from "@/lib/climbs-service";

export const dynamic = "force-dynamic";

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
    <section className="space-y-8 px-4 pb-16">
      <Link href="/" className="text-xs uppercase tracking-[0.22em] text-neutral-400 hover:text-black">
        Archive
      </Link>

      <div className="mx-auto w-full max-w-[24rem]">
        <div className="aspect-[9/16] overflow-hidden bg-black">
          <VideoPlayer videoUrl={climb.videoUrl} posterUrl={climb.posterUrl} />
        </div>
      </div>

      <dl className="mx-auto max-w-[24rem] space-y-2 text-sm uppercase tracking-[0.22em]">
        <div>{climb.grade}</div>
        <div>{climb.gym}</div>
        {climb.location ? <div>{climb.location}</div> : null}
        <div>{climb.date}</div>
        {climb.attempts !== undefined ? <div>{climb.attempts} attempts</div> : null}
      </dl>
    </section>
  );
}
