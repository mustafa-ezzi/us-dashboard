"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ENGAGEMENT_DAY_ROMANCE } from "@/lib/birthday";
import { Heart, Send } from "lucide-react";

/** One-tap soft note that logs as a kind act — engagement day only. */
export function EngagementSoftNote() {
  const { logKindAct, partner } = useStore();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await logKindAct(text.trim(), partner ?? "him");
      setText("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-white">
          <Heart size={14} className="fill-white" />
        </span>
        <div>
          <p className="font-semibold text-ink">
            {ENGAGEMENT_DAY_ROMANCE.softNoteTitle}
          </p>
          <p className="text-[11px] text-ink-muted">
            {ENGAGEMENT_DAY_ROMANCE.softNoteHint}
          </p>
        </div>
      </div>

      <textarea
        className="input mt-3 min-h-[88px] resize-none"
        placeholder={ENGAGEMENT_DAY_ROMANCE.softNotePlaceholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={240}
      />

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || saving}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          <Send size={14} />
          {saving ? "Sending…" : "Send softly"}
        </button>
        {saved && (
          <p className="text-xs font-medium text-secondary">Saved ✓</p>
        )}
      </div>
    </section>
  );
}
