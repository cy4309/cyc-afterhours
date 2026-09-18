import { Archive } from "@/components/climbing/Archive";
import { ArchiveIntro } from "@/components/climbing/ArchiveIntro";
import { listClimbsWithMedia } from "@/lib/climbs-service";
import { parseGradeFilter } from "@/lib/types/climbing";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ grade?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const grade = parseGradeFilter(params.grade);
  const climbs = await listClimbsWithMedia("ALL");

  return (
    <section className="relative flex min-h-0 w-full flex-1 flex-col items-center md:justify-center">
      <h1 className="sr-only">Climbing Archive</h1>
      <ArchiveIntro>
        <Archive climbs={climbs} initialFilter={grade} />
      </ArchiveIntro>
    </section>
  );
}
