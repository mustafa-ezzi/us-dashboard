"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { isOneYearDay } from "@/lib/birthday";
import { todayKey } from "@/lib/utils";

/**
 * On one-year day, auto-set the current partner's mood to 5 (Great / extra happy)
 * once per calendar day. Display for both is handled by OneYearMoodBanner.
 */
export function OneYearAutoHappyMood() {
  const { state, upsertTodayMood, partner } = useStore();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (!partner) return;
    if (!isOneYearDay(state.settings.anniversaryISO)) return;

    const key = `us-dashboard:oneyear-mood:${todayKey()}:${partner}`;
    try {
      if (localStorage.getItem(key) === "1") return;
    } catch {
      // continue
    }

    ran.current = true;
    void (async () => {
      await upsertTodayMood(5, "Extra happy — one year of us 🌊");
      try {
        localStorage.setItem(key, "1");
      } catch {
        // ignore
      }
    })();
  }, [partner, state.settings.anniversaryISO, upsertTodayMood]);

  return null;
}
