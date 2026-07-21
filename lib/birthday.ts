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

/** True when today's calendar date matches the stored engagement day. */
export function isEngagementDay(
  engagementISO: string | null | undefined
): boolean {
  if (!engagementISO) return false;
  return engagementISO.slice(0, 10) === todayKey();
}

export const ENGAGEMENT_NOTE = {
  headline: "Happy Engagement Day",
  subhead: "Your world. Just the two of you.",
  about: `This dashboard keeps track of the ordinary things, but today is not ordinary. Today is the day the plan became real, the promise got a date, and the future started feeling less abstract.`,
  fromMustafa: `I want this day to feel remembered, not rushed past. Thank you for being the person I get to build toward, one honest check-in and one intentional day at a time.`,
} as const;

export const BIRTHDAY_NOTE = {
  headline: "Happy Birthday, Ummehani",
  subhead: "A small thing built with care.",
  about: `This app isn't about being romantic. It's about being present. It's about saying — with data, design, and effort — "I pay attention to us." That's probably the most mature, most practical, most Ummehani-approved kind of love there is.`,
  fromMustafa: `I'm not immature, and I'm not irresponsible — I just get nervous when something matters. I'm working on that, and I'm committed to showing up as someone you can always count on.`,
} as const;
