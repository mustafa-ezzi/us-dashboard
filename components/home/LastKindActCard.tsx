"use client";

import { useStore } from "@/lib/store";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatDistanceToNow } from "date-fns";
import type { PartnerKey } from "@/lib/types";

export function LastKindActCard() {
  const { state, partner, logKindAct } = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  // Default to "I did this" — current partner. Toggle if it was them.
  const [by, setBy] = useState<PartnerKey>(partner ?? "her");

  const last = state.kindActs[0];
  const { her, him } = state.settings;
  const byName =
    last?.by === "her" ? her.name : last?.by === "him" ? him.name : "";

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-rose">
            <Heart size={16} />
          </span>
          <div>
            <p className="stat-label">Last kind act</p>
            <p className="text-sm text-ink-soft">
              {last
                ? `${byName} · ${formatDistanceToNow(new Date(last.createdISO), {
                    addSuffix: true,
                  })}`
                : "Nothing logged yet"}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setOpen(true);
            setBy(partner ?? "her");
          }}
          className="grid h-9 w-9 place-items-center rounded-full bg-rose-100 text-rose hover:bg-rose-200"
          aria-label="Log kind act"
        >
          <Plus size={16} />
        </button>
      </div>
      {last && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-ink-soft">
          "{last.text}"
        </p>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setText("");
        }}
        title="Log a kind act"
      >
        <p className="label">By</p>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setBy("her")}
            className={
              "rounded-xl border px-3 py-2 text-sm transition " +
              (by === "her"
                ? "border-rose bg-rose-50 text-rose-700 font-semibold"
                : "border-line bg-white text-ink-soft")
            }
          >
            {her.emoji} {her.name}
          </button>
          <button
            type="button"
            onClick={() => setBy("him")}
            className={
              "rounded-xl border px-3 py-2 text-sm transition " +
              (by === "him"
                ? "border-rose bg-rose-50 text-rose-700 font-semibold"
                : "border-line bg-white text-ink-soft")
            }
          >
            {him.emoji} {him.name}
          </button>
        </div>
        <textarea
          className="input mt-3 min-h-[88px] resize-none"
          placeholder="What did they do?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={240}
        />
        <div className="mt-4 flex gap-2">
          <button
            className="btn-ghost flex-1"
            onClick={() => {
              setOpen(false);
              setText("");
            }}
          >
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            disabled={!text.trim()}
            onClick={async () => {
              await logKindAct(text.trim(), by);
              setOpen(false);
              setText("");
            }}
          >
            Save
          </button>
        </div>
      </Modal>
    </section>
  );
}
