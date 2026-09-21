import { Archive } from "@/components/climbing/Archive";
import { ArchiveIntro } from "@/components/climbing/ArchiveIntro";
import { listClimbsWithMedia } from "@/lib/climbs-service";
import { parseGradeFilter } from "@/lib/types/climbing";

export const dynamic = "force-dynamic";

type ArchivePageProps = {
  searchParams: Promise<{ grade?: string }>;
};

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const grade = parseGradeFilter(params.grade);
  const climbs = await listClimbsWithMedia("ALL");

  return (
    <section className="relative mx-auto flex min-h-0 w-full max-w-[720px] flex-1 flex-col items-center md:justify-center">
      <h1 className="sr-only">Climbing Archive</h1>
      <ArchiveIntro>
        <Archive climbs={climbs} initialFilter={grade} />
      </ArchiveIntro>
    </section>
  );
}
