import { promises as fs } from "node:fs";
import path from "node:path";
import { sanitizeObjectKey } from "@/lib/keys";
import type { SignedUpload, StorageService } from "@/lib/storage/r2";

const UPLOAD_ROOT = path.join(process.cwd(), ".data", "uploads");

export function resolveLocalObjectPath(key: string): string {
  const safeKey = sanitizeObjectKey(key);
  return path.join(UPLOAD_ROOT, ...safeKey.split("/"));
}

export async function writeLocalObject(key: string, bytes: Buffer): Promise<void> {
  const filePath = resolveLocalObjectPath(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, bytes);
}

export async function readLocalObject(key: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(resolveLocalObjectPath(key));
  } catch {
    return null;
  }
}

export function createMockStorage(): StorageService {
  return {
    async createUpload(input) {
      const signed: SignedUpload = {
        uploadUrl: `/api/uploads/local?key=${encodeURIComponent(input.key)}`,
        method: "PUT",
        headers: {
          "content-type": input.contentType,
        },
      };
      return signed;
    },
    async getReadUrl(key: string) {
      const safeKey = sanitizeObjectKey(key);
      return `/api/media/${safeKey.split("/").map(encodeURIComponent).join("/")}`;
    },
    async deleteObject(key) {
      try {
        await fs.unlink(resolveLocalObjectPath(key));
      } catch {
        // Already gone.
      }
    },
  };
}
