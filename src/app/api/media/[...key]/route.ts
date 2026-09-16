import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/env";
import { readLocalObject } from "@/lib/storage/mock-storage";

const CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  m4v: "video/x-m4v",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  if (getDataSource() !== "mock") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { key } = await context.params;
  const objectKey = key.join("/");
  const bytes = await readLocalObject(objectKey);

  if (!bytes) {
    return NextResponse.json({ error: "Object not found." }, { status: 404 });
  }

  const extension = objectKey.split(".").at(-1)?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=3600",
    },
  });
}
