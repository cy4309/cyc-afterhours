import { getClimbsRepository } from "@/lib/db/climbs";
import { getStorageService, type StorageService } from "@/lib/storage/r2";
import type {
  Climb,
  ClimbNeighbor,
  ClimbWithMedia,
  CreateClimbInput,
  GradeFilter,
  UploadAuthorization,
} from "@/lib/types/climbing";
import { authorizeVideoUpload } from "@/workers/upload";

export async function listClimbsWithMedia(filter: GradeFilter): Promise<ClimbWithMedia[]> {
  const [repo, storage] = await Promise.all([getClimbsRepository(), getStorageService()]);
  const climbs = await repo.list(filter);
  return Promise.all(climbs.map(async (climb) => toClimbWithMedia(storage, climb)));
}

export async function getClimbWithMedia(id: string): Promise<ClimbWithMedia | null> {
  const [repo, storage] = await Promise.all([getClimbsRepository(), getStorageService()]);
  const climb = await repo.getById(id);
  if (!climb) return null;
  return toClimbWithMedia(storage, climb);
}

export async function getClimbWithNeighbors(
  id: string,
  filter: GradeFilter,
): Promise<{
  climb: ClimbWithMedia;
  previous: ClimbNeighbor | null;
  next: ClimbNeighbor | null;
  filter: GradeFilter;
} | null> {
  const [repo, storage] = await Promise.all([getClimbsRepository(), getStorageService()]);
  const climb = await repo.getById(id);
  if (!climb) return null;

  let appliedFilter = filter;
  let list = await repo.list(appliedFilter);
  let index = list.findIndex((item) => item.id === id);

  if (index === -1 && appliedFilter !== "ALL") {
    appliedFilter = "ALL";
    list = await repo.list("ALL");
    index = list.findIndex((item) => item.id === id);
  }

  const previousRow = index > 0 ? list[index - 1] : undefined;
  const nextRow = index >= 0 && index < list.length - 1 ? list[index + 1] : undefined;

  const [withMedia, previous, next] = await Promise.all([
    toClimbWithMedia(storage, climb),
    previousRow ? toNeighbor(storage, previousRow) : null,
    nextRow ? toNeighbor(storage, nextRow) : null,
  ]);

  return { climb: withMedia, previous, next, filter: appliedFilter };
}

export async function createClimbRecord(input: CreateClimbInput): Promise<ClimbWithMedia> {
  const [repo, storage] = await Promise.all([getClimbsRepository(), getStorageService()]);
  const climb = await repo.create(input);
  return toClimbWithMedia(storage, climb);
}

export async function requestVideoUpload(input: {
  fileName: string;
  contentType: string;
  grade: ClimbWithMedia["grade"];
  date: string;
}): Promise<UploadAuthorization> {
  const storage = await getStorageService();
  return authorizeVideoUpload(storage, input);
}

export async function deleteClimb(id: string): Promise<boolean> {
  const [repo, storage] = await Promise.all([getClimbsRepository(), getStorageService()]);
  const climb = await repo.getById(id);
  if (!climb) return false;

  await repo.delete(id);
  await Promise.all([
    storage.deleteObject(climb.videoKey).catch(() => undefined),
    climb.posterKey ? storage.deleteObject(climb.posterKey).catch(() => undefined) : Promise.resolve(),
  ]);
  return true;
}

async function toClimbWithMedia(storage: StorageService, climb: Climb): Promise<ClimbWithMedia> {
  const videoUrl = await storage.getReadUrl(climb.videoKey);
  const result: ClimbWithMedia = { ...climb, videoUrl };

  if (climb.posterKey) {
    result.posterUrl = await storage.getReadUrl(climb.posterKey);
  }

  return result;
}

async function toNeighbor(storage: StorageService, climb: Climb): Promise<ClimbNeighbor> {
  const neighbor: ClimbNeighbor = { id: climb.id };
  if (climb.posterKey) {
    neighbor.posterUrl = await storage.getReadUrl(climb.posterKey);
  }
  return neighbor;
}
