"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { elapsedSince } from "@/lib/utils";
import { format } from "date-fns";
import { Gem } from "lucide-react";
import Link from "next/link";

export function EngagementTimerCard() {
  const { state } = useStore();
  const engagementISO = state.settings.engagementISO;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!engagementISO) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [engagementISO]);

  if (!engagementISO) {
    return (
      <section className="card p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose">
            <Gem size={18} />
          </span>
          <div>
            <p className="stat-label">Engagement timer</p>
            <p className="mt-1 text-sm text-ink-soft">
              Not set yet. Add your engagement date in{" "}
              <Link href="/settings" className="font-semibold text-rose-700 underline-offset-2 hover:underline">
                Settings
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    );
  }

  const elapsed = elapsedSince(engagementISO, now);
  const since = format(new Date(engagementISO), "MMM d, yyyy");

  return (
    <section className="card overflow-hidden">
      <div className="relative bg-gradient-to-br from-rose-700 to-rose px-5 py-5 text-white">
        <div className="absolute -left-4 -bottom-4 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
              Engaged for
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {elapsed.days}
              <span className="ml-1 text-lg font-medium text-white/85">days</span>
            </p>
            <p className="mt-2 font-mono text-sm tabular-nums text-white/90">
              {String(elapsed.hours).padStart(2, "0")}:
              {String(elapsed.minutes).padStart(2, "0")}:
              {String(elapsed.seconds).padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-white/70">Since {since}</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
            <Gem size={20} />
          </span>
        </div>
      </div>
    </section>
  );
}
