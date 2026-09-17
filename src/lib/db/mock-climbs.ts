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
  {
    id: "demo-v1-002",
    grade: "V1",
    date: "2026-08-28",
    gym: "B-Side",
    videoKey: "demo/v1-002.mp4",
    posterKey: "demo/v1-002.svg",
    duration: 11,
    createdAt: "2026-08-28T10:00:00.000Z",
    updatedAt: "2026-08-28T10:00:00.000Z",
  },
  {
    id: "demo-v1-003",
    grade: "V1",
    date: "2026-08-20",
    gym: "Demo Gym",
    attempts: 1,
    location: "Taipei",
    videoKey: "demo/v1-003.mp4",
    posterKey: "demo/v1-003.svg",
    duration: 8,
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
  },
  {
    id: "demo-v2-002",
    grade: "V2",
    date: "2026-09-10",
    gym: "Warehouse",
    attempts: 4,
    videoKey: "demo/v2-002.mp4",
    posterKey: "demo/v2-002.svg",
    duration: 14,
    createdAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-10T10:00:00.000Z",
  },
  {
    id: "demo-v2-003",
    grade: "V2",
    date: "2026-08-22",
    gym: "Corner",
    videoKey: "demo/v2-003.mp4",
    posterKey: "demo/v2-003.svg",
    duration: 16,
    createdAt: "2026-08-22T10:00:00.000Z",
    updatedAt: "2026-08-22T10:00:00.000Z",
  },
  {
    id: "demo-v2-004",
    grade: "V2",
    date: "2026-08-14",
    gym: "Demo Gym",
    attempts: 2,
    location: "New Taipei",
    videoKey: "demo/v2-004.mp4",
    posterKey: "demo/v2-004.svg",
    duration: 10,
    createdAt: "2026-08-14T10:00:00.000Z",
    updatedAt: "2026-08-14T10:00:00.000Z",
  },
  {
    id: "demo-v3-002",
    grade: "V3",
    date: "2026-09-14",
    gym: "B-Side",
    attempts: 5,
    videoKey: "demo/v3-002.mp4",
    posterKey: "demo/v3-002.svg",
    duration: 21,
    createdAt: "2026-09-14T10:00:00.000Z",
    updatedAt: "2026-09-14T10:00:00.000Z",
  },
  {
    id: "demo-v3-003",
    grade: "V3",
    date: "2026-09-06",
    gym: "Corner",
    videoKey: "demo/v3-003.mp4",
    posterKey: "demo/v3-003.svg",
    duration: 19,
    createdAt: "2026-09-06T10:00:00.000Z",
    updatedAt: "2026-09-06T10:00:00.000Z",
  },
  {
    id: "demo-v3-004",
    grade: "V3",
    date: "2026-08-30",
    gym: "Warehouse",
    attempts: 2,
    location: "Taipei",
    videoKey: "demo/v3-004.mp4",
    posterKey: "demo/v3-004.svg",
    duration: 15,
    createdAt: "2026-08-30T10:00:00.000Z",
    updatedAt: "2026-08-30T10:00:00.000Z",
  },
  {
    id: "demo-v3-005",
    grade: "V3",
    date: "2026-08-18",
    gym: "Demo Gym",
    videoKey: "demo/v3-005.mp4",
    posterKey: "demo/v3-005.svg",
    duration: 22,
    createdAt: "2026-08-18T10:00:00.000Z",
    updatedAt: "2026-08-18T10:00:00.000Z",
  },
  {
    id: "demo-v4-002",
    grade: "V4",
    date: "2026-09-11",
    gym: "B-Side",
    attempts: 8,
    videoKey: "demo/v4-002.mp4",
    posterKey: "demo/v4-002.svg",
    duration: 27,
    createdAt: "2026-09-11T10:00:00.000Z",
    updatedAt: "2026-09-11T10:00:00.000Z",
  },
  {
    id: "demo-v4-003",
    grade: "V4",
    date: "2026-08-25",
    gym: "Corner",
    location: "Taipei",
    videoKey: "demo/v4-003.mp4",
    posterKey: "demo/v4-003.svg",
    duration: 20,
    createdAt: "2026-08-25T10:00:00.000Z",
    updatedAt: "2026-08-25T10:00:00.000Z",
  },
  {
    id: "demo-v4-004",
    grade: "V4",
    date: "2026-08-16",
    gym: "Demo Gym",
    attempts: 3,
    videoKey: "demo/v4-004.mp4",
    posterKey: "demo/v4-004.svg",
    duration: 25,
    createdAt: "2026-08-16T10:00:00.000Z",
    updatedAt: "2026-08-16T10:00:00.000Z",
  },
];

async function readClimbs(): Promise<Climb[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Climb[];
    if (!Array.isArray(parsed)) return [...SEED_CLIMBS];

    const seedById = new Map(SEED_CLIMBS.map((climb) => [climb.id, climb]));
    let changed = false;
    const merged = parsed.map((climb) => {
      const seed = seedById.get(climb.id);
      if (!seed || seed.posterKey === climb.posterKey) return climb;
      changed = true;
      return { ...climb, posterKey: seed.posterKey };
    });

    const existingIds = new Set(merged.map((climb) => climb.id));
    const missingSeeds = SEED_CLIMBS.filter((climb) => !existingIds.has(climb.id));
    if (missingSeeds.length > 0) {
      merged.push(...missingSeeds);
      changed = true;
    }

    if (changed) await writeClimbs(merged);
    return merged;
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
  };
}
