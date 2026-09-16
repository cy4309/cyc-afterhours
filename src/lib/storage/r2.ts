export interface SignedUpload {
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
}

export interface StorageService {
  createUpload(input: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<SignedUpload>;
  getReadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

export async function getStorageService(): Promise<StorageService> {
  const { getRuntimeEnv } = await import("@/lib/env");
  const env = await getRuntimeEnv();

  if (env.dataSource === "cloudflare") {
    if (!env.r2) {
      throw new Error("R2 credentials are not available.");
    }
    const { createR2Storage } = await import("@/workers/storage");
    return createR2Storage(env.r2);
  }

  const { createMockStorage } = await import("@/lib/storage/mock-storage");
  return createMockStorage();
}
