"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { BIRTHDAY_NOTE } from "@/lib/birthday";

type ConfettiPiece = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: number;
  color: string;
};

const BIRTHDAY_CONFETTI: ConfettiPiece[] = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17) % 100}%`,
  delay: `${(i * 0.13) % 2.4}s`,
  duration: `${2.8 + (i % 5) * 0.35}s`,
  size: 6 + (i % 4) * 2,
  color: ["#E91E8C", "#F472A8", "#C8167A", "#FBCFE0", "#FFD166"][i % 5],
}));

export function BirthdaySplash() {
  const note = BIRTHDAY_NOTE;
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVisible(true);
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
      <style>{`
        @keyframes splash-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes splash-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes float-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-splash-in {
          animation: splash-in 0.6s ease-out;
        }

        .animate-splash-out {
          animation: splash-out 0.48s ease-in forwards;
        }

        .animate-birthday-rise {
          animation: float-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        .birthday-confetti-piece {
          animation: confetti-fall linear forwards !important;
        }

        .birthday-splash-bg {
          background: linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #f97316 100%);
        }
      `}</style>

      <div className="birthday-splash-bg absolute inset-0" />

      <div className="birthday-confetti pointer-events-none absolute inset-0 overflow-hidden">
        {BIRTHDAY_CONFETTI.map((c) => (
          <span
            key={c.id}
            className="birthday-confetti-piece absolute rounded-full"
            style={{
              left: c.left,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              opacity: 0.8,
              animationDelay: c.delay,
              animationDuration: c.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div
            className="animate-birthday-rise text-center"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-600">
              <Sparkles size={12} />
              Us Dashboard
            </span>
          </div>

          <h1
            className="animate-birthday-rise mt-6 text-center text-[2rem] font-bold leading-tight tracking-tight text-white drop-shadow-lg"
            style={{ animationDelay: "0.2s" }}
          >
            {note.headline}
          </h1>

          <p
            className="animate-birthday-rise mt-3 text-center text-sm text-white/85"
            style={{ animationDelay: "0.3s" }}
          >
            {note.subhead}
          </p>

          <div
            className="animate-birthday-rise mt-8 space-y-3"
            style={{ animationDelay: "0.45s" }}
          >
            <blockquote className="rounded-3xl border border-white/30 bg-white p-6 shadow-md">
              <p className="text-[16px] font-medium leading-relaxed text-slate-800">
                {note.about}
              </p>
            </blockquote>

            <blockquote className="rounded-3xl border border-white/30 bg-white p-6 shadow-md">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-cyan-600">
                From Mustafa
              </p>
              <p className="mt-3 text-[16px] font-medium leading-relaxed text-slate-800">
                {note.fromMustafa}
              </p>
            </blockquote>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="animate-birthday-rise mt-8 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:bg-cyan-600"
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
