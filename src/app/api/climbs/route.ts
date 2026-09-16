import { NextResponse } from "next/server";
import { createClimbRecord, listClimbsWithMedia } from "@/lib/climbs-service";
import {
  isClimbGrade,
  parseGradeFilter,
  type CreateClimbInput,
} from "@/lib/types/climbing";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filter = parseGradeFilter(url.searchParams.get("grade") ?? undefined);
  const climbs = await listClimbsWithMedia(filter);
  return NextResponse.json({ climbs });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseCreateClimbInput(body);
    const climb = await createClimbRecord(input);
    return NextResponse.json({ climb }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save climb.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function parseCreateClimbInput(body: Record<string, unknown>): CreateClimbInput {
  const grade = typeof body.grade === "string" ? body.grade : "";
  const date = typeof body.date === "string" ? body.date : "";
  const gym = typeof body.gym === "string" ? body.gym.trim() : "";
  const videoKey = typeof body.videoKey === "string" ? body.videoKey : "";

  if (!isClimbGrade(grade)) throw new Error("Invalid grade.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date.");
  if (!gym) throw new Error("Gym is required.");
  if (!videoKey) throw new Error("videoKey is required.");

  const input: CreateClimbInput = { grade, date, gym, videoKey };

  if (typeof body.location === "string" && body.location.trim()) {
    input.location = body.location.trim();
  }
  if (typeof body.attempts === "number" && Number.isFinite(body.attempts)) {
    input.attempts = Math.max(1, Math.round(body.attempts));
  }
  if (typeof body.posterKey === "string" && body.posterKey) {
    input.posterKey = body.posterKey;
  }
  if (typeof body.duration === "number" && Number.isFinite(body.duration)) {
    input.duration = body.duration;
  }

  return input;
}
