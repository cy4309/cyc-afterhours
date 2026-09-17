import { NextResponse } from "next/server";
import { unauthorizedUnlessAdmin } from "@/lib/admin";
import { deleteClimb, getClimbWithMedia } from "@/lib/climbs-service";

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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await unauthorizedUnlessAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const deleted = await deleteClimb(id);

  if (!deleted) {
    return NextResponse.json({ error: "Climb not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
