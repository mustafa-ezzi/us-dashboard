/**
 * Timed engagement-day construction lock.
 * Locks:  24 Jul 2026, 11:00 PM Asia/Karachi
 * Unlocks: 25 Jul 2026,  8:00 PM Asia/Karachi
 *
 * Preview (before unlock only):
 *   - NEXT_PUBLIC_ENGAGEMENT_LOCK_PREVIEW=true
 *   - Or ?preview_lock=1
 *   Preview NEVER keeps the app locked after 8:00 PM unlock.
 *
 * Exit for yourself only (7× hammer tap):
 *   - sessionStorage on THIS device — she stays locked
 *   - Reopen app → lock/preview returns
 */

export const ENGAGEMENT_LOCK = {
  startISO: "2026-07-24T23:00:00+05:00",
  endISO: "2026-07-25T20:00:00+05:00",
  bypassKey: "engagement_lock_bypass",
  /** Latches open after unlock so clock jitter can't flip the UI */
  openedKey: "engagement_lock_opened",
  previewQuery: "preview_lock",
} as const;

export function getEngagementLockStart(): Date {
  return new Date(ENGAGEMENT_LOCK.startISO);
}

export function getEngagementLockEnd(): Date {
  return new Date(ENGAGEMENT_LOCK.endISO);
}

export function isPastEngagementUnlock(now: Date = new Date()): boolean {
  return now.getTime() >= getEngagementLockEnd().getTime();
}

export function isInEngagementLockWindow(now: Date = new Date()): boolean {
  const t = now.getTime();
  return (
    t >= getEngagementLockStart().getTime() &&
    t < getEngagementLockEnd().getTime()
  );
}

export function isEngagementLockPreviewForced(): boolean {
  if (process.env.NEXT_PUBLIC_ENGAGEMENT_LOCK_PREVIEW === "true") return true;
  if (typeof window === "undefined") return false;
  try {
    return (
      new URLSearchParams(window.location.search).get(
        ENGAGEMENT_LOCK.previewQuery
      ) === "1"
    );
  } catch {
    return false;
  }
}

export function isEngagementLockBypassed(): boolean {
  if (process.env.NEXT_PUBLIC_ENGAGEMENT_LOCK_BYPASS === "true") return true;
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ENGAGEMENT_LOCK.bypassKey) === "1";
  } catch {
    return false;
  }
}

export function setEngagementLockBypass(on: boolean) {
  try {
    localStorage.removeItem(ENGAGEMENT_LOCK.bypassKey);
    if (on) sessionStorage.setItem(ENGAGEMENT_LOCK.bypassKey, "1");
    else sessionStorage.removeItem(ENGAGEMENT_LOCK.bypassKey);
  } catch {
    // ignore
  }
}

function markEngagementLockOpened() {
  try {
    sessionStorage.setItem(ENGAGEMENT_LOCK.openedKey, "1");
  } catch {
    // ignore
  }
}

function hasEngagementLockOpened(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ENGAGEMENT_LOCK.openedKey) === "1";
  } catch {
    return false;
  }
}

/**
 * True when the construction overlay should cover the app.
 * After 8:00 PM unlock, always false — preview cannot override that.
 */
export function shouldShowEngagementLock(now: Date = new Date()): boolean {
  if (isEngagementLockBypassed()) return false;

  // Already crossed unlock this session — stay open (stops flicker)
  if (hasEngagementLockOpened()) return false;

  if (isPastEngagementUnlock(now)) {
    markEngagementLockOpened();
    return false;
  }

  if (isEngagementLockPreviewForced()) return true;
  return isInEngagementLockWindow(now);
}
