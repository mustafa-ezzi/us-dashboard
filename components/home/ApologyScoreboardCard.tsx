"use client";

import { useStore } from "@/lib/store";
import type { Partner } from "@/lib/types";
import { ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function ApologyScoreboardCard({
  her,
  him,
}: {
  her: Partner;
  him: Partner;
}) {
  const { state, partner, logApology } = useStore();
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [note, setNote] = useState("");

  const { herCount, himCount, last, recent } = useMemo(() => {
    const herCount = state.apologies.filter((a) => a.apologizer === "her").length;
    const himCount = state.apologies.filter((a) => a.apologizer === "him").length;
    const last = state.apologies[0];
    const recent = state.apologies.slice(0, 5);
    return { herCount, himCount, last, recent };
  }, [state.apologies]);

  const lastName = last
    ? last.apologizer === "her"
      ? her.name
      : him.name
    : null;

  const meName = partner === "her" ? her.name : him.name;

  return (
    <section className="card p-4">
      <div className="flex items-start justify-between">
        <p className="stat-label">Apologies</p>
        <button
          onClick={() => setOpen(true)}
          className="grid h-7 w-7 place-items-center rounded-full bg-rose-100 text-rose hover:bg-rose-200"
          aria-label="Log apology"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold tabular-nums">{herCount}</p>
          <p className="text-xs text-ink-muted">{her.name}</p>
        </div>
        <p className="pb-1 text-xs text-ink-subtle">vs</p>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">{himCount}</p>
          <p className="text-xs text-ink-muted">{him.name}</p>
        </div>
      </div>

      {last ? (
        <div className="mt-3 rounded-xl bg-rose-50/80 px-3 py-2">
          <p className="text-[11px] font-medium text-ink-muted">
            Latest · {lastName} ·{" "}
            {formatDistanceToNow(new Date(last.createdISO), { addSuffix: true })}
          </p>
          {last.note ? (
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              "{last.note}"
            </p>
          ) : (
            <p className="mt-1 text-xs italic text-ink-subtle">No note added</p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-ink-subtle">No apologies yet</p>
      )}

      {recent.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-[11px] font-medium text-rose-700"
          >
            Recent apologies
            <ChevronDown
              size={14}
              className={cn("transition", historyOpen && "rotate-180")}
            />
          </button>
          {historyOpen && (
            <ul className="mt-1 space-y-1.5">
              {recent.map((a) => {
                const who = a.apologizer === "her" ? her : him;
                return (
                  <li
                    key={a.id}
                    className="rounded-lg border border-line bg-white px-2.5 py-2 text-[11px]"
                  >
                    <p className="font-medium text-ink">
                      {who.emoji} {who.name}
                      <span className="ml-1 font-normal text-ink-subtle">
                        ·{" "}
                        {formatDistanceToNow(new Date(a.createdISO), {
                          addSuffix: true,
                        })}
                      </span>
                    </p>
                    {a.note && (
                      <p className="mt-0.5 text-ink-soft">"{a.note}"</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setNote("");
        }}
        title="Say sorry"
      >
        <p className="text-sm text-ink-muted">
          This will be logged as an apology from{" "}
          <span className="font-semibold text-ink">{meName}</span>.
        </p>
        <textarea
          className="input mt-3 min-h-[80px] resize-none"
          placeholder="What for? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={240}
        />
        <div className="mt-4 flex gap-2">
          <button
            className="btn-ghost flex-1"
            onClick={() => {
              setOpen(false);
              setNote("");
            }}
          >
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            onClick={async () => {
              await logApology(note.trim() || undefined);
              setOpen(false);
              setNote("");
            }}
          >
            I'm sorry
          </button>
        </div>
      </Modal>
    </section>
  );
}
