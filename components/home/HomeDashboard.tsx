"use client";

import { useStore } from "@/lib/store";
import { isEngagementDay } from "@/lib/birthday";
import { DaysTogetherCard } from "./DaysTogetherCard";
import { ApologyScoreboardCard } from "./ApologyScoreboardCard";
import { ImmaturityCounterCard } from "./ImmaturityCounterCard";
import { LastKindActCard } from "./LastKindActCard";
import { TodayMoodCard } from "./TodayMoodCard";
import { EngagementTimerCard } from "./EngagementTimerCard";
import { MemoryJarCard } from "./MemoryJarCard";
import { QuickActions } from "./QuickActions";
import { Heart } from "lucide-react";

export function HomeDashboard() {
  const { state } = useStore();
  const { her, him } = state.settings;
  const engagementDay = isEngagementDay(state.settings.engagementISO);

  return (
    <div className="space-y-4 stagger-children">
      {engagementDay && (
        <section className="rounded-2xl border border-secondary/30 bg-secondary-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Heart size={16} className="fill-secondary text-secondary" />
            Light sky &amp; hot pink — just for today
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Primary sky blue, secondary hot pink. Tomorrow the usual rose
            returns.
          </p>
        </section>
      )}

      <DaysTogetherCard />

      <EngagementTimerCard />

      <div className="grid grid-cols-2 gap-3">
        <ApologyScoreboardCard her={her} him={him} />
        <ImmaturityCounterCard him={him} />
      </div>

      <TodayMoodCard />

      <LastKindActCard />

      <MemoryJarCard />

      <QuickActions />
    </div>
  );
}
