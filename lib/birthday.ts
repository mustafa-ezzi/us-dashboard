/** Ummehani's birthday — splash shows on this date only (local time). */
export const BIRTHDAY = {
  month: 5,
  day: 31,
  name: "Ummehani",
} as const;

const STORAGE_PREFIX = "us-dashboard-birthday-splash";

function storageKey(year: number): string {
  return `${STORAGE_PREFIX}-${year}`;
}

export function isBirthdayToday(date = new Date()): boolean {
  return (
    date.getMonth() + 1 === BIRTHDAY.month &&
    date.getDate() === BIRTHDAY.day
  );
}

export function isBirthdayPreview(): boolean {
  return process.env.NEXT_PUBLIC_BIRTHDAY_PREVIEW === "true";
}

export function shouldShowBirthdaySplash(date = new Date()): boolean {
  if (typeof window === "undefined") return false;
  if (!isBirthdayToday(date) && !isBirthdayPreview()) return false;
  return localStorage.getItem(storageKey(date.getFullYear())) !== "seen";
}

export function markBirthdaySplashSeen(date = new Date()): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(date.getFullYear()), "seen");
}

export const BIRTHDAY_NOTE = {
  headline: "Happy Birthday, Ummehani",
  subhead: "May 31 — a small thing built with care.",
  about: `This app isn't about being romantic. It's about being present. It's about saying — with data, design, and effort — "I pay attention to us." That's probably the most mature, most practical, most Ummehani-approved kind of love there is.`,
  fromMustafa: `I'm not immature, and I'm not irresponsible — I just get nervous when something matters. I'm working on that, and I'm committed to showing up as someone you can always count on.`,
} as const;
