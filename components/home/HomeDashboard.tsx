"use client";

import { useStore } from "@/lib/store";
import { DaysTogetherCard } from "./DaysTogetherCard";
import { ApologyScoreboardCard } from "./ApologyScoreboardCard";
import { ImmaturityCounterCard } from "./ImmaturityCounterCard";
import { LastKindActCard } from "./LastKindActCard";
import { TodayMoodCard } from "./TodayMoodCard";
import { EngagementTimerCard } from "./EngagementTimerCard";
import { QuickActions } from "./QuickActions";

export function HomeDashboard() {
  const { state } = useStore();
  const { her, him } = state.settings;

  return (
    <div className="space-y-4 stagger-children">
      <DaysTogetherCard />

      <EngagementTimerCard />

      <div className="grid grid-cols-2 gap-3">
        <ApologyScoreboardCard her={her} him={him} />
        <ImmaturityCounterCard him={him} />
      </div>

      <TodayMoodCard />

      <LastKindActCard />

      <QuickActions />
    </div>
  );
}
