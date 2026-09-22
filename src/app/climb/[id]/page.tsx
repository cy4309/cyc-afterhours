import { notFound } from "next/navigation";
import { ClimbScene } from "@/components/climbing/ClimbScene";
import { isAdmin } from "@/lib/admin";
import { getClimbWithNeighbors } from "@/lib/climbs-service";
import { parseGradeFilter } from "@/lib/types/climbing";

export const dynamic = "force-dynamic";

type ClimbPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ grade?: string }>;
};

export default async function ClimbPage({ params, searchParams }: ClimbPageProps) {
  const { id } = await params;
  const grade = parseGradeFilter((await searchParams).grade);
  const [scene, admin] = await Promise.all([getClimbWithNeighbors(id, grade), isAdmin()]);

  if (!scene) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[720px] pt-16">
      <ClimbScene
        climb={scene.climb}
        previous={scene.previous}
        next={scene.next}
        filter={scene.filter}
        isAdmin={admin}
      />
    </div>
  );
}
