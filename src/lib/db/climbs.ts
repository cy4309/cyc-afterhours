import type { Climb, ClimbGrade, CreateClimbInput, GradeFilter } from "@/lib/types/climbing";

export interface ClimbsRepository {
  list(filter?: GradeFilter): Promise<Climb[]>;
  getById(id: string): Promise<Climb | null>;
  create(input: CreateClimbInput): Promise<Climb>;
  delete(id: string): Promise<boolean>;
}

export type ClimbRow = {
  id: string;
  grade: string;
  date: string;
  gym: string;
  location: string | null;
  attempts: number | null;
  video_key: string;
  poster_key: string | null;
  duration: number | null;
  created_at: string;
  updated_at: string;
};

export function rowToClimb(row: ClimbRow): Climb {
  const climb: Climb = {
    id: row.id,
    grade: row.grade as ClimbGrade,
    date: row.date,
    gym: row.gym,
    videoKey: row.video_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.location) climb.location = row.location;
  if (row.attempts !== null) climb.attempts = row.attempts;
  if (row.poster_key) climb.posterKey = row.poster_key;
  if (row.duration !== null) climb.duration = row.duration;

  return climb;
}

export async function getClimbsRepository(): Promise<ClimbsRepository> {
  const { getRuntimeEnv } = await import("@/lib/env");
  const env = await getRuntimeEnv();

  if (env.dataSource === "cloudflare") {
    if (!env.db) {
      throw new Error("D1 binding is not available.");
    }
    const { createD1ClimbsRepository } = await import("@/workers/climbs");
    return createD1ClimbsRepository(env.db);
  }

  const { createMockClimbsRepository } = await import("@/lib/db/mock-climbs");
  return createMockClimbsRepository();
}
