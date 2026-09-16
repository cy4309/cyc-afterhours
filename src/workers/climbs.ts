import type { D1DatabaseLike } from "@/lib/env";
import { rowToClimb, type ClimbRow, type ClimbsRepository } from "@/lib/db/climbs";
import { newId, nowIso } from "@/lib/keys";
import type { CreateClimbInput, GradeFilter } from "@/lib/types/climbing";

const SELECT_FIELDS = `
  id, grade, date, gym, location, attempts, video_key, poster_key, duration, created_at, updated_at
`;

export function createD1ClimbsRepository(db: D1DatabaseLike): ClimbsRepository {
  return {
    async list(filter?: GradeFilter) {
      const useFilter = filter && filter !== "ALL";
      const statement = useFilter
        ? db
            .prepare(
              `SELECT ${SELECT_FIELDS} FROM climbs WHERE grade = ? ORDER BY created_at DESC, date DESC`,
            )
            .bind(filter)
        : db.prepare(`SELECT ${SELECT_FIELDS} FROM climbs ORDER BY created_at DESC, date DESC`);

      const { results } = await statement.all<ClimbRow>();
      return results.map(rowToClimb);
    },
    async getById(id: string) {
      const row = await db
        .prepare(`SELECT ${SELECT_FIELDS} FROM climbs WHERE id = ? LIMIT 1`)
        .bind(id)
        .first<ClimbRow>();
      return row ? rowToClimb(row) : null;
    },
    async create(input: CreateClimbInput) {
      const id = input.id ?? newId();
      const timestamp = nowIso();
      const row: ClimbRow = {
        id,
        grade: input.grade,
        date: input.date,
        gym: input.gym,
        location: input.location ?? null,
        attempts: input.attempts ?? null,
        video_key: input.videoKey,
        poster_key: input.posterKey ?? null,
        duration: input.duration ?? null,
        created_at: timestamp,
        updated_at: timestamp,
      };

      await db
        .prepare(
          `INSERT INTO climbs (
            id, grade, date, gym, location, attempts, video_key, poster_key, duration, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          row.id,
          row.grade,
          row.date,
          row.gym,
          row.location,
          row.attempts,
          row.video_key,
          row.poster_key,
          row.duration,
          row.created_at,
          row.updated_at,
        )
        .run();

      return rowToClimb(row);
    },
  };
}
