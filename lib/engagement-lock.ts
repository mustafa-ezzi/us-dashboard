/**
 * Timed engagement-day construction lock.
 * Locks:  24 Jul 2026, 11:00 PM Asia/Karachi
 * Unlocks: 25 Jul 2026,  8:00 PM Asia/Karachi
 *
 * Preview (before / outside the window):
 *   - Add to .env.local: NEXT_PUBLIC_ENGAGEMENT_LOCK_PREVIEW=true  (restart server)
 *   - Or open any page with ?preview_lock=1
 *
 * Exit for yourself only (7× hammer tap):
 *   - Uses sessionStorage on THIS device only — she stays on the lock screen
 *   - Closing / reopening the app clears the bypass → preview/lock shows again
 *
 * Permanent skip while building:
 *   - NEXT_PUBLIC_ENGAGEMENT_LOCK_BYPASS=true
 */

export const ENGAGEMENT_LOCK = {
  /** Inclusive start — lock begins at this instant */
  startISO: "2026-07-24T23:00:00+05:00",
  /** Exclusive end — app unlocks at this instant */
  endISO: "2026-07-25T20:00:00+05:00",
  bypassKey: "engagement_lock_bypass",
  previewQuery: "preview_lock",
} as const;

export function getEngagementLockStart(): Date {
  return new Date(ENGAGEMENT_LOCK.startISO);
}

export function getEngagementLockEnd(): Date {
  return new Date(ENGAGEMENT_LOCK.endISO);
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

/** Session-only, this device only — does not affect her phone. */
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
    // Drop any old persistent bypass so reopen always restores the lock/preview
    localStorage.removeItem(ENGAGEMENT_LOCK.bypassKey);
    if (on) sessionStorage.setItem(ENGAGEMENT_LOCK.bypassKey, "1");
    else sessionStorage.removeItem(ENGAGEMENT_LOCK.bypassKey);
  } catch {
    // ignore
  }
}

/** True when the lock screen should cover the app. */
export function shouldShowEngagementLock(now: Date = new Date()): boolean {
  if (isEngagementLockBypassed()) return false;
  if (isEngagementLockPreviewForced()) return true;
  return isInEngagementLockWindow(now);
}
