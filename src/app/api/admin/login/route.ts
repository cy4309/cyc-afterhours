import { NextResponse } from "next/server";
import { adminLoginResponse, getAdminPassword, passwordMatches } from "@/lib/admin";

export async function POST(request: Request) {
  const password = await getAdminPassword();
  if (!password) {
    return NextResponse.json({ error: "Admin password is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const submitted = typeof body?.password === "string" ? body.password : "";

  if (!(await passwordMatches(submitted))) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  return adminLoginResponse();
}
