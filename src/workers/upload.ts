import { buildClimbObjectKey, extensionFromFileName, newId, posterKeyFromVideoKey } from "@/lib/keys";
import type { StorageService } from "@/lib/storage/r2";
import type { ClimbGrade, UploadAuthorization } from "@/lib/types/climbing";

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);

export function assertVideoContentType(contentType: string): void {
  if (!VIDEO_TYPES.has(contentType)) {
    throw new Error("Unsupported video type. Use mp4, mov, or webm.");
  }
}

export async function authorizeVideoUpload(
  storage: StorageService,
  input: {
    fileName: string;
    contentType: string;
    grade: ClimbGrade;
    date: string;
  },
): Promise<UploadAuthorization> {
  assertVideoContentType(input.contentType);

  const id = newId();
  const extension = extensionFromFileName(input.fileName, "mp4");
  const videoKey = buildClimbObjectKey({
    grade: input.grade,
    date: input.date,
    id,
    extension,
  });

  const posterKey = posterKeyFromVideoKey(videoKey);
  const [signed, posterSigned] = await Promise.all([
    storage.createUpload({
      key: videoKey,
      contentType: input.contentType,
    }),
    storage.createUpload({
      key: posterKey,
      contentType: "image/jpeg",
    }),
  ]);

  return {
    videoKey,
    uploadUrl: signed.uploadUrl,
    method: signed.method,
    headers: signed.headers,
    posterKey,
    posterUploadUrl: posterSigned.uploadUrl,
    posterHeaders: posterSigned.headers,
  };
}
