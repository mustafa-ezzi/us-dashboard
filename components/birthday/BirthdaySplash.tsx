"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { BIRTHDAY_NOTE, isBirthdaySplashEnabled } from "@/lib/birthday";

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17) % 100}%`,
  delay: `${(i * 0.13) % 2.4}s`,
  duration: `${2.8 + (i % 5) * 0.35}s`,
  size: 6 + (i % 4) * 2,
  color: ["#E91E8C", "#F472A8", "#C8167A", "#FBCFE0", "#FFD166"][
    i % 5
  ],
}));

export function BirthdaySplash() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isBirthdaySplashEnabled()) setVisible(true);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => setVisible(false), 480);
  };

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className={
        "birthday-splash fixed inset-0 z-[200] flex flex-col overflow-hidden " +
        (leaving ? "animate-splash-out" : "animate-splash-in")
      }
      role="dialog"
      aria-modal="true"
      aria-label="Birthday message"
    >
      <div className="birthday-splash-bg absolute inset-0" />

      <div className="birthday-confetti pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c) => (
          <span
            key={c.id}
            className="birthday-confetti-piece absolute rounded-full opacity-80"
            style={{
              left: c.left,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              animationDelay: c.delay,
              animationDuration: c.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="animate-birthday-rise text-center" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
              <Sparkles size={12} /> Us Dashboard
            </span>
          </div>

          <h1
            className="animate-birthday-rise mt-5 text-center text-[2rem] font-semibold leading-tight tracking-tight text-white drop-shadow-sm"
            style={{ animationDelay: "0.2s" }}
          >
            {BIRTHDAY_NOTE.headline}
          </h1>

          <p
            className="animate-birthday-rise mt-2 text-center text-sm text-white/85"
            style={{ animationDelay: "0.3s" }}
          >
            {BIRTHDAY_NOTE.subhead}
          </p>

          <div
            className="animate-birthday-rise mt-8 space-y-4"
            style={{ animationDelay: "0.45s" }}
          >
            <blockquote className="rounded-3xl border border-white/20 bg-white/95 p-5 shadow-card backdrop-blur-sm">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                {BIRTHDAY_NOTE.about}
              </p>
            </blockquote>

            <blockquote className="rounded-3xl border border-rose-200/60 bg-rose-50/95 p-5 shadow-card backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-700">
                From Mustafa
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                {BIRTHDAY_NOTE.fromMustafa}
              </p>
            </blockquote>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="animate-birthday-rise btn-primary mt-8 w-full !bg-white !text-rose !shadow-cardHover hover:!bg-rose-50"
            style={{ animationDelay: "0.6s" }}
          >
            Open your dashboard
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
