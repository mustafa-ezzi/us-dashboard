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

/** Home replacements for apology / immaturity counters on engagement day. */
export const ENGAGEMENT_DAY_ROMANCE = {
  bannerTitle: "Today is only for softness",
  bannerBody:
    "Scoreboards are closed. The whole app is dressed in sky blue and hot pink  just for the two of you.",
  vowTitle: "A quiet vow",
  vow: "I choose you on the ordinary Tuesdays and on the days that rewrite the calendar. Today is one of those.",
  letterTitle: "A letter, just for today",
  letterEyebrow: "Tap to open",
  letter: `Ummehani 

If this app usually measures moods and kind acts, today it gets to measure something quieter: how lucky I feel that the future has your name in it.

I don't need a perfect day. I need a true one  the kind where we laugh, get a little nervous, hold hands through the not-knowing, and still choose each other.

Thank you for being my soft place and my brave place.
Today belongs to us.

 Mustafa/Saheli`,
  reasonsTitle: "Why this day feels like forever",
  reasons: [
    "You make ordinary plans feel like a life.",
    "I trust the person I'm becoming beside you.",
    "Our love is patient, practical, and still a little magic.",
    "Home isn't a place  it's how you look at me when I'm trying.",
  ],
  ritualsTitle: "Our day, gently",
  ritualsSubtitle: "Tap each one as you live it  no pressure, just presence.",
  rituals: [
    { id: "hold", label: "Hold hands without rushing" },
    { id: "say", label: "Say the real reason you're glad" },
    { id: "photo", label: "Take one photo for the memory jar" },
    { id: "plan", label: "Pick one tiny plan for after today" },
    { id: "rest", label: "Rest together, even for ten minutes" },
  ],
  softNoteTitle: "Leave her a soft note",
  softNoteHint: "Saved as a kind act  she'll see it on Home.",
  softNotePlaceholder: "Something true. Something small. Something hers.",
} as const;

export const BIRTHDAY_NOTE = {
  headline: "Happy Birthday, Ummehani",
  subhead: "A small thing built with care.",
  about: `This app isn't about being romantic. It's about being present. It's about saying  with data, design, and effort  "I pay attention to us." That's probably the most mature, most practical, most Ummehani-approved kind of love there is.`,
  fromMustafa: `I'm not immature, and I'm not irresponsible  I just get nervous when something matters. I'm working on that, and I'm committed to showing up as someone you can always count on.`,
} as const;
