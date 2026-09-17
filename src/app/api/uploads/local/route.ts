import { NextResponse } from "next/server";
import { unauthorizedUnlessAdmin } from "@/lib/admin";
import { getDataSource } from "@/lib/env";
import { writeLocalObject } from "@/lib/storage/mock-storage";

const MAX_BYTES = 200 * 1024 * 1024;

export async function PUT(request: Request) {
  const unauthorized = await unauthorizedUnlessAdmin(request);
  if (unauthorized) return unauthorized;

  if (getDataSource() !== "mock") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key." }, { status: 400 });
  }

  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.byteLength === 0) {
    return NextResponse.json({ error: "Empty file." }, { status: 400 });
  }
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large." }, { status: 413 });
  }

  await writeLocalObject(key, bytes);
  return new NextResponse(null, { status: 204 });
}
