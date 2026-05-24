"use client";

import { useStore } from "@/lib/store";
import { daysBetween } from "@/lib/utils";
import { format } from "date-fns";
import { Heart } from "lucide-react";

export function DaysTogetherCard() {
  const { state } = useStore();
  const { anniversaryISO, her, him } = state.settings;
  const days = daysBetween(anniversaryISO);
  const since = format(new Date(anniversaryISO), "MMM d, yyyy");

  return (
    <section className="card overflow-hidden">
      <div className="relative bg-gradient-to-br from-rose to-rose-700 px-5 py-6 text-white">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-4 top-4 opacity-30">
          <Heart size={28} fill="white" stroke="white" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
          Days together
        </p>
        <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
          {days.toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-white/85">
          {her.name} {her.emoji} & {him.name} {him.emoji}
          <span className="text-white/60"> · since {since}</span>
        </p>
      </div>
    </section>
  );
}
