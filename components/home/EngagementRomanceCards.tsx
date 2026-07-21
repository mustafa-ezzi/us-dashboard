"use client";

import { useState } from "react";
import { ENGAGEMENT_DAY_ROMANCE } from "@/lib/birthday";
import { Heart, Lock, Mail, Sparkles } from "lucide-react";

/** Replaces apology + immaturity counters on engagement day. */
export function EngagementRomanceCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <section className="card flex flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-rose">
            <Lock size={14} />
          </span>
          <p className="stat-label">Paused today</p>
        </div>
        <p className="mt-3 text-sm font-semibold leading-snug text-ink">
          No scoreboards
        </p>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-soft">
          Apologies &amp; immaturity stay locked. Softness keeps the tally.
        </p>
      </section>

      <section className="card flex flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary-100 text-secondary">
            <Heart size={14} className="fill-secondary" />
          </span>
          <p className="stat-label text-secondary">Vow</p>
        </div>
        <p className="mt-3 text-sm font-semibold leading-snug text-ink">
          {ENGAGEMENT_DAY_ROMANCE.vowTitle}
        </p>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-soft">
          {ENGAGEMENT_DAY_ROMANCE.vow}
        </p>
      </section>
    </div>
  );
}

/** Full-width romantic extras: openable letter + reasons. */
export function EngagementRomanceExtras() {
  const [letterOpen, setLetterOpen] = useState(false);
  const [hearted, setHearted] = useState(0);

  return (
    <div className="space-y-3">
      <section className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setLetterOpen((v) => !v)}
          className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-rose-50/60"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary text-white">
            <Mail size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
              {ENGAGEMENT_DAY_ROMANCE.letterEyebrow}
            </p>
            <p className="mt-0.5 font-semibold text-ink">
              {ENGAGEMENT_DAY_ROMANCE.letterTitle}
            </p>
          </div>
          <span className="text-xs font-medium text-rose">
            {letterOpen ? "Close" : "Open"}
          </span>
        </button>

        {letterOpen && (
          <div className="border-t border-line bg-cream px-4 pb-4 pt-3">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-soft">
              {ENGAGEMENT_DAY_ROMANCE.letter}
            </pre>
            <button
              type="button"
              onClick={() => setHearted((n) => Math.min(n + 1, 12))}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
            >
              <Heart size={16} className="fill-white" />
              {hearted === 0
                ? "Send a heartbeat"
                : hearted === 1
                  ? "1 heartbeat sent"
                  : `${hearted} heartbeats sent`}
            </button>
          </div>
        )}
      </section>

      <section className="card p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-rose">
            <Sparkles size={14} />
          </span>
          <p className="font-semibold text-ink">
            {ENGAGEMENT_DAY_ROMANCE.reasonsTitle}
          </p>
        </div>
        <ul className="mt-3 space-y-2.5">
          {ENGAGEMENT_DAY_ROMANCE.reasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-3 py-2.5 text-sm leading-relaxed text-ink-soft"
            >
              <Heart
                size={14}
                className="mt-0.5 shrink-0 fill-secondary text-secondary"
              />
              {reason}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
