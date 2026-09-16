import { Archive } from "@/components/climbing/Archive";
import { GradeFilter } from "@/components/climbing/GradeFilter";
import { listClimbsWithMedia } from "@/lib/climbs-service";
import { parseGradeFilter } from "@/lib/types/climbing";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ grade?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const grade = parseGradeFilter(params.grade);
  const climbs = await listClimbsWithMedia(grade);

  return (
    <section className="flex flex-1 flex-col items-center justify-center">
      <h1 className="sr-only">Climbing Archive</h1>
      <div className="w-full px-4 pb-4">
        <GradeFilter active={grade} />
      </div>
      <Archive climbs={climbs} />
    </section>
  );
}
