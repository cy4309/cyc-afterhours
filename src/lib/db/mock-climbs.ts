import { promises as fs } from "node:fs";
import path from "node:path";
import type { ClimbsRepository } from "@/lib/db/climbs";
import { newId, nowIso } from "@/lib/keys";
import type { Climb, CreateClimbInput, GradeFilter } from "@/lib/types/climbing";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "climbs.json");

const SEED_CLIMBS: Climb[] = [
  {
    id: "demo-v3-001",
    grade: "V3",
    date: "2026-09-15",
    gym: "Demo Gym",
    attempts: 3,
    videoKey: "demo/v3-001.mp4",
    posterKey: "demo/v3-001.svg",
    duration: 18,
    createdAt: "2026-09-15T10:00:00.000Z",
    updatedAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "demo-v2-001",
    grade: "V2",
    date: "2026-09-12",
    gym: "Demo Gym",
    attempts: 1,
    videoKey: "demo/v2-001.mp4",
    posterKey: "demo/v2-001.svg",
    duration: 12,
    createdAt: "2026-09-12T10:00:00.000Z",
    updatedAt: "2026-09-12T10:00:00.000Z",
  },
  {
    id: "demo-v4-001",
    grade: "V4",
    date: "2026-09-08",
    gym: "Warehouse",
    attempts: 6,
    location: "Taipei",
    videoKey: "demo/v4-001.mp4",
    posterKey: "demo/v4-001.svg",
    duration: 24,
    createdAt: "2026-09-08T10:00:00.000Z",
    updatedAt: "2026-09-08T10:00:00.000Z",
  },
  {
    id: "demo-v1-001",
    grade: "V1",
    date: "2026-09-01",
    gym: "Demo Gym",
    attempts: 2,
    videoKey: "demo/v1-001.mp4",
    posterKey: "demo/v1-001.svg",
    duration: 9,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
];

async function readClimbs(): Promise<Climb[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Climb[];
    return Array.isArray(parsed) ? parsed : [...SEED_CLIMBS];
  } catch {
    return [...SEED_CLIMBS];
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
      return filtered.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
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
  };
}
