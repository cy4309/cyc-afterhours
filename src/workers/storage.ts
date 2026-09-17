import { AwsClient } from "aws4fetch";
import type { R2Credentials } from "@/lib/env";
import { sanitizeObjectKey } from "@/lib/keys";
import type { SignedUpload, StorageService } from "@/lib/storage/r2";

function objectUrl(credentials: R2Credentials, key: string): URL {
  return new URL(
    `https://${credentials.accountId}.r2.cloudflarestorage.com/${credentials.bucketName}/${sanitizeObjectKey(key)}`,
  );
}

function createClient(credentials: R2Credentials): AwsClient {
  return new AwsClient({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    service: "s3",
    region: "auto",
  });
}

async function sign(
  credentials: R2Credentials,
  key: string,
  method: "GET" | "PUT",
  contentType: string | undefined,
  expiresInSeconds: number,
): Promise<string> {
  const url = objectUrl(credentials, key);
  url.searchParams.set("X-Amz-Expires", String(expiresInSeconds));

  const headers: Record<string, string> = {};
  if (method === "PUT" && contentType) {
    headers["content-type"] = contentType;
  }

  const client = createClient(credentials);
  const signed = await client.sign(url.toString(), {
    method,
    headers,
    aws: { signQuery: true },
  });

  return signed.url;
}

export function createR2Storage(credentials: R2Credentials): StorageService {
  return {
    async createUpload(input) {
      const expiresInSeconds = input.expiresInSeconds ?? 60 * 15;
      const uploadUrl = await sign(
        credentials,
        input.key,
        "PUT",
        input.contentType,
        expiresInSeconds,
      );

      const signed: SignedUpload = {
        uploadUrl,
        method: "PUT",
        headers: {
          "content-type": input.contentType,
        },
      };
      return signed;
    },
    async getReadUrl(key: string, expiresInSeconds = 60 * 60) {
      if (credentials.publicBaseUrl) {
        const base = credentials.publicBaseUrl.replace(/\/$/, "");
        return `${base}/${sanitizeObjectKey(key)}`;
      }
      return sign(credentials, key, "GET", undefined, expiresInSeconds);
    },
    async deleteObject(key) {
      const client = createClient(credentials);
      const signed = await client.sign(objectUrl(credentials, key).toString(), {
        method: "DELETE",
      });
      const response = await fetch(signed);
      if (!response.ok && response.status !== 404) {
        throw new Error(`Unable to delete object (${response.status}).`);
      }
    },
  };
}
