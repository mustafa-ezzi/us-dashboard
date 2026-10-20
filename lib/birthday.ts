import { daysBetween, todayKey } from "./utils";

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

/**
 * True on the day "days together" hits 365.
 * Preview anytime: NEXT_PUBLIC_ONE_YEAR_PREVIEW=true
 */
export function isOneYearDay(
  anniversaryISO: string | null | undefined
): boolean {
  if (process.env.NEXT_PUBLIC_ONE_YEAR_PREVIEW === "true") return true;
  if (!anniversaryISO) return false;
  return daysBetween(anniversaryISO) === 365;
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

/** One-year-together celebration (ocean theme). */
export const ONE_YEAR_ROMANCE = {
  bannerTitle: "365 days of us",
  bannerBody:
    "Scoreboards are closed. Moods are set to extra happy. The ocean theme is yours for the whole day — from mahila mitra to pasandida aurat.",
  slideshowFrom: "from mahila mitra",
  slideshowTo: "to pasandida aurat",
  quotes: [
    "Even if I master every language in the world, I would still be lost for words to describe your beauty.",
    "If I were able to write my own destiny I would simply write your name and break the pen.",
    "I fell in love with a pair of eyes, and then I became blind to all other eyes.",
  ],
  giftsTitle: "Little gifts, just for you",
  gifts: [
    {
      name: "Beauty Secret Serum",
      note: "For the glow that already lives in you — a little extra soft care.",
    },
    {
      name: "Ultimate Night Glow",
      note: "Nighttime calm for the woman who makes every evening feel like home.",
    },
    {
      name: "Her Ease",
      note: "For the days that ask more from your body — relief, rest, and someone who notices.",
    },
  ],
  periodCareTitle: "Soft words for today",
  periodCare: `I know you're on your periods, and I don't want you to push through alone. Rest when you need to. Ask for heat packs, chocolate, quiet, or my hand — whatever helps. You don't owe anyone a brave face today. I'm proud of how strong you are, and I'm here for the soft parts too. Take it slow, jaan. I've got you.`,
  lockedTitle: "Paused for our year",
  lockedBody:
    "Apologies & immaturity stay locked. One year of choosing each other is the only score that matters.",
  moodTitle: "Extra happy — both of us",
  moodSubhead: "Today the mood dial goes all the way up. 365 days deserves that.",
} as const;

export const BIRTHDAY_NOTE = {
  headline: "Happy Birthday, Ummehani",
  subhead: "A small thing built with care.",
  about: `This app isn't about being romantic. It's about being present. It's about saying  with data, design, and effort  "I pay attention to us." That's probably the most mature, most practical, most Ummehani-approved kind of love there is.`,
  fromMustafa: `I'm not immature, and I'm not irresponsible  I just get nervous when something matters. I'm working on that, and I'm committed to showing up as someone you can always count on.`,
} as const;
