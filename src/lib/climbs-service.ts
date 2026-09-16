import { getClimbsRepository } from "@/lib/db/climbs";
import { getStorageService, type StorageService } from "@/lib/storage/r2";
import type {
  Climb,
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

async function toClimbWithMedia(storage: StorageService, climb: Climb): Promise<ClimbWithMedia> {
  const videoUrl = await storage.getReadUrl(climb.videoKey);
  const result: ClimbWithMedia = { ...climb, videoUrl };

  if (climb.posterKey) {
    result.posterUrl = await storage.getReadUrl(climb.posterKey);
  }

  return result;
}
