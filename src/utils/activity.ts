export const RECURRENCES = ["No repetir", "Diariamente", "Semanalmente", "Mensualmente", "Anualmente"] as const;
export const LISTS = ["Personal", "Escuela", "Trabajo"] as const;
export const REMINDERS = ["Sin recordatorio", "A la hora", "5 minutos antes", "15 minutos antes", "30 minutos antes", "1 hora antes"] as const;

export type SavedActivity = {
  id: string;
  title: string;
  date: string;
  time: string;
  reminder: typeof REMINDERS[number];
  recurrence: typeof RECURRENCES[number];
  list: typeof LISTS[number];
};

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseActivityDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function occursOn(activity: SavedActivity, date: Date) {
  const key = dateKey(date);
  if (key < activity.date) return false;
  const [year, month, day] = activity.date.split("-").map(Number);
  const start = new Date(year, month - 1, day, 12);
  switch (activity.recurrence) {
    case "Diariamente": return true;
    case "Semanalmente": return date.getDay() === start.getDay();
    case "Mensualmente": return date.getDate() === day;
    case "Anualmente": return date.getMonth() === month - 1 && date.getDate() === day;
    default: return key === activity.date;
  }
}
