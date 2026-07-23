import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  // Reasonably unique for a 2-user local app
  const rand = Math.random().toString(36).slice(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysBetween(fromISO: string, to: Date = new Date()): number {
  const from = new Date(fromISO);
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.floor((b - a) / 86_400_000));
}

export interface ElapsedTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

/** Elapsed time since an ISO date/datetime (clamped to zero if in the future). */
export function elapsedSince(fromISO: string, now: Date = new Date()): ElapsedTime {
  const from = new Date(fromISO);
  const diff = Math.max(0, now.getTime() - from.getTime());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds, totalMs: diff };
}

/** Countdown to a calendar date. Days are whole calendar days left (not floor of hours). */
export function timeUntilDate(
  dateISO: string,
  now: Date = new Date()
): ElapsedTime | null {
  const [y, m, d] = dateISO.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const targetDay = new Date(y, m - 1, d);
  const calendarDays = Math.round(
    (targetDay.getTime() - startOfToday.getTime()) / 86_400_000
  );

  // Today or already past — callers use isEngagementDay for the "it's today" state.
  if (calendarDays <= 0) return null;

  // Live clock counts down to local midnight on the target date.
  const targetMidnight = new Date(y, m - 1, d, 0, 0, 0, 0);
  const diff = Math.max(0, targetMidnight.getTime() - now.getTime());
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return {
    days: calendarDays,
    hours,
    minutes,
    seconds,
    totalMs: diff,
  };
}

export function isFutureDate(dateISO: string): boolean {
  return timeUntilDate(dateISO) !== null;
}

/** Combine date + HH:MM into a sortable timestamp. */
export function plannedDateTime(dateISO: string, time: string): Date {
  return new Date(`${dateISO}T${time}:00`);
}

export function isPlannedDateUpcoming(dateISO: string, time: string): boolean {
  return plannedDateTime(dateISO, time).getTime() >= Date.now();
}
