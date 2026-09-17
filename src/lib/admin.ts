import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "cyc_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function timingSafeEqual(left: string, right: string): boolean {
  const max = Math.max(left.length, right.length);
  let mismatch = left.length === right.length ? 0 : 1;
  for (let index = 0; index < max; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(signature);
}

export async function getAdminPassword(): Promise<string | undefined> {
  const fromProcess = process.env.ADMIN_PASSWORD?.trim();
  if (fromProcess) return fromProcess;

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const fromWorker = (env as CloudflareEnv).ADMIN_PASSWORD?.trim();
    return fromWorker || undefined;
  } catch {
    return undefined;
  }
}

async function createSessionToken(password: string): Promise<string> {
  const payload = `v1.${Date.now() + SESSION_MAX_AGE * 1000}`;
  const signature = await hmacHex(password, payload);
  return `${payload}.${signature}`;
}

async function isValidSession(token: string, password: string): Promise<boolean> {
  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return false;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const [, expiry] = payload.split(".");
  if (!expiry || Number(expiry) < Date.now()) return false;

  const expected = await hmacHex(password, payload);
  return timingSafeEqual(signature, expected);
}

function readCookie(header: string, name: string): string | undefined {
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    return decodeURIComponent(trimmed.slice(name.length + 1));
  }
  return undefined;
}

export async function passwordMatches(password: string): Promise<boolean> {
  const expected = await getAdminPassword();
  if (!expected) return false;
  return timingSafeEqual(password, expected);
}

export async function isAdminRequest(request: Request): Promise<boolean> {
  const password = await getAdminPassword();
  const token = readCookie(request.headers.get("cookie") ?? "", ADMIN_COOKIE);
  if (!password || !token) return false;
  return isValidSession(token, password);
}

export async function isAdmin(): Promise<boolean> {
  const password = await getAdminPassword();
  if (!password) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return isValidSession(token, password);
}

export async function unauthorizedUnlessAdmin(request: Request): Promise<NextResponse | null> {
  if (await isAdminRequest(request)) return null;
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function adminLoginResponse(): Promise<NextResponse> {
  const password = await getAdminPassword();
  if (!password) {
    return NextResponse.json({ error: "Admin password is not configured." }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: await createSessionToken(password),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

export function adminLogoutResponse(): NextResponse {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
