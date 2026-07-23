"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { isEngagementDay } from "@/lib/birthday";
import { timeUntilDate } from "@/lib/utils";
import { format } from "date-fns";
import { Gem, Heart, Sparkles } from "lucide-react";

function formatEngagementDay(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso.slice(0, 10);
  return format(new Date(y, m - 1, d), "MMM d, yyyy");
}

export function EngagementTimerCard() {
  const { state } = useStore();
  const engagementISO = state.settings.engagementISO;
  const [now, setNow] = useState(() => new Date());
  const todayIsTheDay = isEngagementDay(engagementISO);

  useEffect(() => {
    if (!engagementISO || todayIsTheDay) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [engagementISO, todayIsTheDay]);

  if (!engagementISO) {
    return (
      <section className="card p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose">
            <Gem size={18} />
          </span>
          <div>
            <p className="stat-label">Engagement countdown</p>
            <p className="mt-1 text-sm text-ink-soft">
              Set the day you plan to get engaged in{" "}
              <Link
                href="/settings"
                className="font-semibold text-rose-700 underline-offset-2 hover:underline"
              >
                Settings
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    );
  }

  const target = formatEngagementDay(engagementISO);

  if (todayIsTheDay) {
    return (
      <section className="card overflow-hidden">
        <div className="bg-rose px-5 py-6 text-white">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/90">
            <Sparkles size={12} />
            It&apos;s today
          </p>
          <p className="mt-2 text-2xl font-semibold leading-tight">
            Happy Engagement Day
          </p>
          <p className="mt-2 text-sm text-white/90">
            The countdown is over. The promise has a date — and the date is
            today.
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-secondary-50">
            <Heart size={12} className="fill-secondary text-secondary" />
            <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-white">
              {target}
            </span>
          </p>
        </div>
      </section>
    );
  }

  const remaining = timeUntilDate(engagementISO, now);

  if (!remaining) {
    return (
      <section className="card overflow-hidden">
        <div className="bg-rose px-5 py-5 text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
            Engagement countdown
          </p>
          <p className="mt-2 text-xl font-semibold">That day has arrived ✓</p>
          <p className="mt-1 text-sm text-white/80">Planned for {target}</p>
          <Link
            href="/settings"
            className="mt-3 inline-block text-xs font-medium text-white underline-offset-2 hover:underline"
          >
            Update in Settings
          </Link>
        </div>
      </section>
    );
  }

  const dayLabel = remaining.days === 1 ? "day" : "days";

  return (
    <section className="card overflow-hidden">
      <div className="bg-rose px-5 py-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
              Until engagement
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {remaining.days}
              <span className="ml-1 text-lg font-medium text-white/85">
                {dayLabel}
              </span>
            </p>
            <p className="mt-2 font-mono text-sm tabular-nums text-white/90">
              {String(remaining.hours).padStart(2, "0")}:
              {String(remaining.minutes).padStart(2, "0")}:
              {String(remaining.seconds).padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-white/70">Planned for {target}</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
            <Gem size={20} />
          </span>
        </div>
      </div>
    </section>
  );
}
