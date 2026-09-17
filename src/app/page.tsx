import { cookies } from "next/headers";
import { Archive } from "@/components/climbing/Archive";
import { ArchiveIntro } from "@/components/climbing/ArchiveIntro";
import { ARCHIVE_ENTERED_COOKIE } from "@/lib/archive-entered";
import { listClimbsWithMedia } from "@/lib/climbs-service";
import { parseGradeFilter } from "@/lib/types/climbing";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ grade?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const grade = parseGradeFilter(params.grade);
  const [climbs, cookieStore] = await Promise.all([listClimbsWithMedia("ALL"), cookies()]);
  const playIntro = cookieStore.get(ARCHIVE_ENTERED_COOKIE)?.value !== "1";

  return (
    <section className="relative flex flex-1 flex-col items-center justify-center">
      <h1 className="sr-only">Climbing Archive</h1>
      <ArchiveIntro playIntro={playIntro}>
        <Archive climbs={climbs} initialFilter={grade} />
      </ArchiveIntro>
    </section>
  );
}
