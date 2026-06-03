"use client";

import { useStore } from "@/lib/store";
import { Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function KindActsHistory() {
  const { state, partner } = useStore();
  const { her, him } = state.settings;

  const kindActs = [...state.kindActs].sort(
    (a, b) => new Date(b.createdISO).getTime() - new Date(a.createdISO).getTime()
  );

  if (kindActs.length === 0) {
    return (
      <section className="card p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose">
            <Heart size={20} />
          </span>
          <p className="text-sm text-ink-soft">No kind acts logged yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {kindActs.map((act) => {
        const byName = act.by === "her" ? her.name : act.by === "him" ? him.name : "";
        const emoji = act.by === "her" ? her.emoji : act.by === "him" ? him.emoji : "";

        return (
          <div key={act.id} className="card p-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-rose-100 text-rose">
                <Heart size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="stat-label">
                    {emoji} {byName}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {formatDistanceToNow(new Date(act.createdISO), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-ink-soft break-words">
                  "{act.text}"
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
