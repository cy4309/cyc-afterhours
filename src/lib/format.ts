export function formatClimbDate(value: string): string {
  return value.replaceAll("-", ".");
}

export function formatClimbMonth(value: string): string {
  return value.slice(0, 7).replace("-", ".");
}

export function formatAttempts(attempts?: number): string | undefined {
  if (attempts === undefined) return undefined;
  return String(attempts).padStart(2, "0");
}
