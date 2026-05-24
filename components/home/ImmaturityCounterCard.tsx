"use client";

import { useStore } from "@/lib/store";
import type { Partner } from "@/lib/types";
import { ChevronDown, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function ImmaturityCounterCard({ him }: { him: Partner }) {
  const { state, logImmaturity } = useStore();
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [note, setNote] = useState("");

  const count = state.immaturity.length;
  const last = state.immaturity[0];
  const recent = useMemo(() => state.immaturity.slice(0, 5), [state.immaturity]);

  return (
    <section className="card p-4">
      <div className="flex items-start justify-between">
        <p className="stat-label">Immaturity</p>
        <button
          onClick={() => setOpen(true)}
          className="grid h-7 w-7 place-items-center rounded-full bg-rose-100 text-rose hover:bg-rose-200"
          aria-label="Log immature moment"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-3xl font-semibold tabular-nums">{count}</p>
        <Sparkles size={16} className="text-rose-400" />
      </div>
      <p className="mt-1 text-xs text-ink-muted">moments by {him.name}</p>

      {last ? (
        <div className="mt-3 rounded-xl bg-rose-50/80 px-3 py-2">
          <p className="text-[11px] font-medium text-ink-muted">
            Latest ·{" "}
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
        <p className="mt-3 text-[11px] text-ink-subtle">
          Tap + when he earns one
        </p>
      )}

      {recent.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-[11px] font-medium text-rose-700"
          >
            Recent moments
            <ChevronDown
              size={14}
              className={cn("transition", historyOpen && "rotate-180")}
            />
          </button>
          {historyOpen && (
            <ul className="mt-1 space-y-1.5">
              {recent.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-line bg-white px-2.5 py-2 text-[11px]"
                >
                  <p className="font-medium text-ink">
                    {him.emoji} {him.name}
                    <span className="ml-1 font-normal text-ink-subtle">
                      ·{" "}
                      {formatDistanceToNow(new Date(entry.createdISO), {
                        addSuffix: true,
                      })}
                    </span>
                  </p>
                  {entry.note && (
                    <p className="mt-0.5 text-ink-soft">"{entry.note}"</p>
                  )}
                </li>
              ))}
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
        title="Log an immature moment"
      >
        <textarea
          className="input min-h-[88px] resize-none"
          placeholder="What did he do this time? (optional)"
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
              await logImmaturity(note.trim() || undefined);
              setOpen(false);
              setNote("");
            }}
          >
            Log it
          </button>
        </div>
      </Modal>
    </section>
  );
}
