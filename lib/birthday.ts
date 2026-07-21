import { todayKey } from "./utils";

/** Celebration splash copy + manual birthday on/off via env. */
export const BIRTHDAY = {
  name: "Ummehani",
} as const;

/**
 * Splash shows on every app open while enabled.
 * After her birthday, set in Vercel + .env.local:
 *   NEXT_PUBLIC_BIRTHDAY_SPLASH=false
 * then redeploy.
 */
export function isBirthdaySplashEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BIRTHDAY_SPLASH !== "false";
}

export function isEngagementSplashEnabled(
  engagementISO: string | null | undefined
): boolean {
  if (!engagementISO) return false;
  return engagementISO.slice(0, 10) === todayKey();
}

export const BIRTHDAY_NOTE = {
  headline: "Happy Birthday, Ummehani",
  subhead: "A small thing built with care.",
  about: `This app isn't about being romantic. It's about being present. It's about saying — with data, design, and effort — "I pay attention to us." That's probably the most mature, most practical, most Ummehani-approved kind of love there is.`,
  fromMustafa: `I'm not immature, and I'm not irresponsible — I just get nervous when something matters. I'm working on that, and I'm committed to showing up as someone you can always count on.`,
} as const;
