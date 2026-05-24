/** Format HH:MM in a timezone (24h, zero-padded). */
export function currentTimeInTimezone(
  date: Date,
  timeZone: string
): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return normalizeReminderTime(`${hour}:${minute}`);
}

/** Format YYYY-MM-DD in a timezone. */
export function currentDateInTimezone(
  date: Date,
  timeZone: string
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function normalizeReminderTime(value: string): string {
  const [h = "0", m = "0"] = value.slice(0, 5).split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

export function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";
  } catch {
    return "Asia/Karachi";
  }
}
