"use client";

import { useStore } from "@/lib/store";
import { daysBetween } from "@/lib/utils";
import { isEngagementDay, isOneYearDay } from "@/lib/birthday";
import { format } from "date-fns";
import { Heart, Sparkles, Waves } from "lucide-react";

export function DaysTogetherCard() {
  const { state } = useStore();
  const { anniversaryISO, her, him, engagementISO } = state.settings;
  const days = daysBetween(anniversaryISO);
  const since = format(new Date(anniversaryISO), "MMM d, yyyy");
  const engagementDay = isEngagementDay(engagementISO);
  const oneYearDay = !engagementDay && isOneYearDay(anniversaryISO);

  return (
    <section className="card overflow-hidden">
      <div
        className={
          "relative px-5 py-6 text-white " +
          (engagementDay || oneYearDay ? "bg-secondary" : "bg-rose")
        }
      >
        <div className="absolute right-4 top-4 opacity-30">
          {oneYearDay ? (
            <Waves size={28} />
          ) : engagementDay ? (
            <Sparkles size={28} />
          ) : (
            <Heart size={28} fill="white" stroke="white" />
          )}
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
          {oneYearDay
            ? "One year complete"
            : engagementDay
              ? "Every day led here"
              : "Days together"}
        </p>
        <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
          {days.toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-white/85">
          {her.name} {her.emoji} & {him.name} {him.emoji}
          <span className="text-white/60"> · since {since}</span>
        </p>
        {engagementDay && (
          <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
            And today, the promise gets its day
          </p>
        )}
        {oneYearDay && (
          <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
            365 days · from mahila mitra to pasandida aurat
          </p>
        )}
      </div>
    </section>
  );
}
