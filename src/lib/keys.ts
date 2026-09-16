import type { ClimbGrade } from "@/lib/types/climbing";

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function buildClimbObjectKey(input: {
  grade: ClimbGrade;
  date: string;
  id: string;
  extension: string;
}): string {
  const [year, month] = input.date.split("-");
  const compactDate = input.date.replaceAll("-", "");
  const grade = input.grade.toLowerCase();
  const shortId = input.id.replaceAll("-", "").slice(0, 8);
  return `climbing/${year}/${month}/${grade}-${compactDate}-${shortId}.${input.extension}`;
}

export function extensionFromFileName(fileName: string, fallback: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return fallback;
  const ext = parts.at(-1)?.toLowerCase();
  return ext && /^[a-z0-9]+$/.test(ext) ? ext : fallback;
}

export function sanitizeObjectKey(key: string): string {
  const segments = key.replaceAll("\\", "/").split("/").filter((segment) => {
    return segment.length > 0 && segment !== "." && segment !== "..";
  });

  if (segments.length === 0) {
    throw new Error("Invalid object key.");
  }

  return segments.join("/");
}
