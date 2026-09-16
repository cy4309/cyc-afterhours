import { NextResponse } from "next/server";
import { getClimbWithMedia } from "@/lib/climbs-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const climb = await getClimbWithMedia(id);

  if (!climb) {
    return NextResponse.json({ error: "Climb not found." }, { status: 404 });
  }

  return NextResponse.json({ climb });
}
