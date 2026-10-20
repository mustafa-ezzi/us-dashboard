"use client";

import { useEffect, useState } from "react";
import { ONE_YEAR_ROMANCE } from "@/lib/birthday";
import { Gift, Heart, Lock, Sparkles, Waves } from "lucide-react";

export function OneYearRomanceCards() {
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
          {ONE_YEAR_ROMANCE.lockedTitle}
        </p>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-soft">
          {ONE_YEAR_ROMANCE.lockedBody}
        </p>
      </section>

      <section className="card flex flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary-100 text-secondary">
            <Waves size={14} />
          </span>
          <p className="stat-label text-secondary">Ocean day</p>
        </div>
        <p className="mt-3 text-sm font-semibold leading-snug text-ink">
          One full year
        </p>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-soft">
          Soft teal waters for the woman who feels like home.
        </p>
      </section>
    </div>
  );
}

export function OneYearQuotes() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setI((n) => (n + 1) % ONE_YEAR_ROMANCE.quotes.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-rose">
          <Sparkles size={14} />
        </span>
        <p className="font-semibold text-ink">Words for you</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft italic">
        &ldquo;{ONE_YEAR_ROMANCE.quotes[i]}&rdquo;
      </p>
      <div className="mt-3 flex gap-1.5">
        {ONE_YEAR_ROMANCE.quotes.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            className={
              "h-1.5 flex-1 rounded-full transition " +
              (idx === i ? "bg-rose" : "bg-rose-100")
            }
            aria-label={`Quote ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export function OneYearGifts() {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-white">
          <Gift size={14} />
        </span>
        <p className="font-semibold text-ink">{ONE_YEAR_ROMANCE.giftsTitle}</p>
      </div>
      <ul className="mt-3 space-y-2.5">
        {ONE_YEAR_ROMANCE.gifts.map((gift) => (
          <li
            key={gift.name}
            className="rounded-xl bg-rose-50 px-3 py-2.5"
          >
            <p className="text-sm font-semibold text-rose-700">{gift.name}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
              {gift.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OneYearPeriodCare() {
  return (
    <section className="card border-secondary/25 p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary-100 text-secondary">
          <Heart size={14} className="fill-secondary" />
        </span>
        <p className="font-semibold text-ink">
          {ONE_YEAR_ROMANCE.periodCareTitle}
        </p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft whitespace-pre-wrap">
        {ONE_YEAR_ROMANCE.periodCare}
      </p>
    </section>
  );
}

export function OneYearMoodBanner() {
  return (
    <section className="card overflow-hidden">
      <div className="bg-rose px-4 py-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
          Today&apos;s mood
        </p>
        <p className="mt-1 text-lg font-semibold">
          {ONE_YEAR_ROMANCE.moodTitle}
        </p>
        <p className="mt-1 text-sm text-white/90">
          {ONE_YEAR_ROMANCE.moodSubhead}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/15 px-3 py-2 text-center">
            <p className="text-2xl" aria-hidden>
              🥰
            </p>
            <p className="mt-0.5 text-xs font-medium">Extra happy</p>
          </div>
          <div className="rounded-xl bg-white/15 px-3 py-2 text-center">
            <p className="text-2xl" aria-hidden>
              🥰
            </p>
            <p className="mt-0.5 text-xs font-medium">Extra happy</p>
          </div>
        </div>
      </div>
    </section>
  );
}
