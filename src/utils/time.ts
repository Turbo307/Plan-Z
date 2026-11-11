/** Accepts saved HH:mm values and times selected with AM/PM. */
export function parseTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):([0-5]\d)(?:\s+(AM|PM))?$/i.exec(value.trim());
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (match[3]) {
    if (hour < 1 || hour > 12) return null;
    hour = hour % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
  } else if (hour > 23) return null;
  return { hour, minute };
}

export function formatTime(value: string): string {
  const parsed = parseTime(value);
  if (!parsed) return value;
  return `${parsed.hour % 12 || 12}:${String(parsed.minute).padStart(2, "0")} ${parsed.hour >= 12 ? "PM" : "AM"}`;
}

/** Keep existing storage and chronological ordering compatible. */
export function timeForStorage(value: string): string | null {
  const parsed = parseTime(value);
  return parsed ? `${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute).padStart(2, "0")}` : null;
}
