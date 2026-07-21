"use client";

import { useStore } from "@/lib/store";
import { isEngagementDay, ENGAGEMENT_DAY_ROMANCE } from "@/lib/birthday";
import { DaysTogetherCard } from "./DaysTogetherCard";
import { ApologyScoreboardCard } from "./ApologyScoreboardCard";
import { ImmaturityCounterCard } from "./ImmaturityCounterCard";
import {
  EngagementRomanceCards,
  EngagementRomanceExtras,
} from "./EngagementRomanceCards";
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
            {ENGAGEMENT_DAY_ROMANCE.bannerTitle}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {ENGAGEMENT_DAY_ROMANCE.bannerBody}
          </p>
        </section>
      )}

      <DaysTogetherCard />

      <EngagementTimerCard />

      {engagementDay ? (
        <>
          <EngagementRomanceCards />
          <EngagementRomanceExtras />
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <ApologyScoreboardCard her={her} him={him} />
          <ImmaturityCounterCard him={him} />
        </div>
      )}

      <TodayMoodCard />

      <LastKindActCard />

      <MemoryJarCard />

      <QuickActions />
    </div>
  );
}
