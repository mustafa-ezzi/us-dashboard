"use client";

import { useStore } from "@/lib/store";
import { todayKey } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MOOD_META } from "@/components/mood/moodMeta";

export function TodayMoodCard() {
  const { state } = useStore();
  const key = todayKey();
  const her = state.moods.find(
    (m) => m.partner === "her" && m.dateISO === key
  );
  const him = state.moods.find(
    (m) => m.partner === "him" && m.dateISO === key
  );

  return (
    <Link
      href="/mood"
      className="card card-hover block p-4"
      aria-label="Go to mood"
    >
      <div className="flex items-center justify-between">
        <p className="stat-label">Today's mood</p>
        <ArrowRight size={16} className="text-ink-subtle" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <MoodSlot label={state.settings.her.name} score={her?.score} />
        <MoodSlot label={state.settings.him.name} score={him?.score} />
      </div>
    </Link>
  );
}

function MoodSlot({ label, score }: { label: string; score?: number }) {
  const meta = score ? MOOD_META[score - 1] : null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5">
      <span className="text-2xl" aria-hidden>
        {meta?.emoji ?? "·"}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{label}</p>
        <p className="truncate text-xs text-ink-muted">
          {meta ? meta.label : "Not logged"}
        </p>
      </div>
    </div>
  );
}
