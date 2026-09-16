export const CLIMB_GRADES = ["V1", "V2", "V3", "V4", "V5"] as const;

export type ClimbGrade = (typeof CLIMB_GRADES)[number];

export const FILTER_GRADES = ["V1", "V2", "V3", "V4"] as const;

export type GradeFilter = "ALL" | (typeof FILTER_GRADES)[number];

export interface Climb {
  id: string;
  grade: ClimbGrade;
  date: string;
  gym: string;
  location?: string;
  attempts?: number;
  videoKey: string;
  posterKey?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClimbWithMedia extends Climb {
  videoUrl: string;
  posterUrl?: string;
}

export interface CreateClimbInput {
  id?: string;
  grade: ClimbGrade;
  date: string;
  gym: string;
  location?: string;
  attempts?: number;
  videoKey: string;
  posterKey?: string;
  duration?: number;
}

export interface UploadAuthorization {
  videoKey: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
}

export function isClimbGrade(value: string): value is ClimbGrade {
  return (CLIMB_GRADES as readonly string[]).includes(value);
}

export function isGradeFilter(value: string): value is GradeFilter {
  return value === "ALL" || (FILTER_GRADES as readonly string[]).includes(value);
}

export function parseGradeFilter(value: string | undefined): GradeFilter {
  if (!value) return "ALL";
  return isGradeFilter(value) ? value : "ALL";
}
