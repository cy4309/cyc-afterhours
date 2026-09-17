import { promises as fs } from "node:fs";
import path from "node:path";
import type { ClimbsRepository } from "@/lib/db/climbs";
import { newId, nowIso } from "@/lib/keys";
import type { Climb, CreateClimbInput, GradeFilter } from "@/lib/types/climbing";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "climbs.json");

async function readClimbs(): Promise<Climb[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Climb[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeClimbs(climbs: Climb[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(climbs, null, 2), "utf8");
}

export function createMockClimbsRepository(): ClimbsRepository {
  return {
    async list(filter?: GradeFilter) {
      const climbs = await readClimbs();
      const filtered =
        !filter || filter === "ALL" ? climbs : climbs.filter((climb) => climb.grade === filter);
      return filtered.sort(
        (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
      );
    },
    async getById(id: string) {
      const climbs = await readClimbs();
      return climbs.find((climb) => climb.id === id) ?? null;
    },
    async create(input: CreateClimbInput) {
      const climbs = await readClimbs();
      const timestamp = nowIso();
      const climb: Climb = {
        id: input.id ?? newId(),
        grade: input.grade,
        date: input.date,
        gym: input.gym,
        videoKey: input.videoKey,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (input.location) climb.location = input.location;
      if (input.attempts !== undefined) climb.attempts = input.attempts;
      if (input.posterKey) climb.posterKey = input.posterKey;
      if (input.duration !== undefined) climb.duration = input.duration;

      climbs.unshift(climb);
      await writeClimbs(climbs);
      return climb;
    },
    async delete(id: string) {
      const climbs = await readClimbs();
      const next = climbs.filter((climb) => climb.id !== id);
      if (next.length === climbs.length) return false;
      await writeClimbs(next);
      return true;
    },
  };
}
