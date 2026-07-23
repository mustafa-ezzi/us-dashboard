"use client";

import { useEffect, useState } from "react";
import { ENGAGEMENT_DAY_ROMANCE } from "@/lib/birthday";
import { todayKey } from "@/lib/utils";
import { Check, Circle, Sparkles } from "lucide-react";

type RitualId = (typeof ENGAGEMENT_DAY_ROMANCE.rituals)[number]["id"];

function storageKey() {
  return `us-dashboard:engagement-rituals:${todayKey()}`;
}

export function EngagementDayRitual() {
  const [done, setDone] = useState<Partial<Record<RitualId, boolean>>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey());
      if (raw) setDone(JSON.parse(raw) as Partial<Record<RitualId, boolean>>);
    } catch {
      // ignore malformed local state
    }
  }, []);

  const toggle = (id: RitualId) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(storageKey(), JSON.stringify(next));
      return next;
    });
  };

  const completed = ENGAGEMENT_DAY_ROMANCE.rituals.filter((r) => done[r.id]).length;
  const total = ENGAGEMENT_DAY_ROMANCE.rituals.length;

  return (
    <section className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary-100 text-secondary">
              <Sparkles size={14} />
            </span>
            <p className="font-semibold text-ink">
              {ENGAGEMENT_DAY_ROMANCE.ritualsTitle}
            </p>
          </div>
          <p className="mt-1.5 text-xs text-ink-soft">
            {ENGAGEMENT_DAY_ROMANCE.ritualsSubtitle}
          </p>
        </div>
        <p className="shrink-0 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-rose-700">
          {completed}/{total}
        </p>
      </div>

      <ul className="mt-3 space-y-2">
        {ENGAGEMENT_DAY_ROMANCE.rituals.map((ritual) => {
          const isDone = Boolean(done[ritual.id]);
          return (
            <li key={ritual.id}>
              <button
                type="button"
                onClick={() => toggle(ritual.id)}
                className={
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition active:scale-[0.99] " +
                  (isDone
                    ? "border-secondary/30 bg-secondary-50 text-ink"
                    : "border-line bg-white text-ink-soft hover:border-rose hover:bg-rose-50")
                }
              >
                {isDone ? (
                  <Check
                    size={16}
                    className="shrink-0 rounded-full bg-secondary p-0.5 text-white"
                  />
                ) : (
                  <Circle size={16} className="shrink-0 text-ink-subtle" />
                )}
                <span className={isDone ? "font-medium" : ""}>{ritual.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
