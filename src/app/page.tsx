import { Archive } from "@/components/climbing/Archive";
import { GradeFilter } from "@/components/climbing/GradeFilter";
import { listClimbsWithMedia } from "@/lib/climbs-service";
import { parseGradeFilter } from "@/lib/types/climbing";

type HomeProps = {
  searchParams: Promise<{ grade?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const grade = parseGradeFilter(params.grade);
  const climbs = await listClimbsWithMedia(grade);

  return (
    <section>
      <h1 className="sr-only">Climbing Archive</h1>
      <GradeFilter active={grade} />
      <Archive climbs={climbs} />
    </section>
  );
}
