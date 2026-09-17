import { NextResponse } from "next/server";
import { unauthorizedUnlessAdmin } from "@/lib/admin";
import { requestVideoUpload } from "@/lib/climbs-service";
import { isClimbGrade } from "@/lib/types/climbing";

export async function POST(request: Request) {
  const unauthorized = await unauthorizedUnlessAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fileName = typeof body.fileName === "string" ? body.fileName : "";
    const contentType = typeof body.contentType === "string" ? body.contentType : "";
    const grade = typeof body.grade === "string" ? body.grade : "";
    const date = typeof body.date === "string" ? body.date : "";

    if (!fileName) throw new Error("fileName is required.");
    if (!contentType) throw new Error("contentType is required.");
    if (!isClimbGrade(grade)) throw new Error("Invalid grade.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date.");

    const authorization = await requestVideoUpload({
      fileName,
      contentType,
      grade,
      date,
    });

    return NextResponse.json(authorization);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to authorize upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
