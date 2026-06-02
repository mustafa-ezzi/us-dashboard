"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Heart } from "lucide-react";
import {
  BIRTHDAY_NOTE,
  ENGAGEMENT_NOTE,
  type SplashOccasion,
} from "@/lib/birthday";

type ConfettiPiece = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: number;
  color: string;
  opacity: number;
  rotate: number;
};

// Standard confetti for birthday
const BIRTHDAY_CONFETTI: ConfettiPiece[] = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17) % 100}%`,
  delay: `${(i * 0.13) % 2.4}s`,
  duration: `${2.8 + (i % 5) * 0.35}s`,
  size: 6 + (i % 4) * 2,
  color: ["#E91E8C", "#F472A8", "#C8167A", "#FBCFE0", "#FFD166"][i % 5],
  opacity: 0.8,
  rotate: 0,
}));

// Enhanced confetti for engagement with diamond/sparkle effect
const ENGAGEMENT_CONFETTI: ConfettiPiece[] = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${(i * 13) % 100}%`,
  delay: `${(i * 0.09) % 2.2}s`,
  duration: `${3.2 + (i % 6) * 0.4}s`,
  size: 4 + (i % 5) * 2.5,
  color: [
    "#0EA5E9", // bright cyan
    "#06B6D4", // cyan
    "#0891B2", // dark cyan
    "#3B82F6", // blue
    "#1E40AF", // dark blue
    "#E0F2FE", // light blue
    "#BAE6FD", // lighter blue
  ][i % 7],
  opacity: 0.7 + (i % 3) * 0.15,
  rotate: (i * 45) % 360,
}));

// Floating light orbs for engagement backdrop
const FLOAT_ORBS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  size: 60 + (i % 3) * 40,
  left: `${(i * 18) % 100}%`,
  top: `${(i * 25) % 70}%`,
  duration: `${12 + i * 2}s`,
  delay: `${i * 0.5}s`,
}));

export function BirthdaySplash({
  occasion = "birthday",
}: {
  occasion?: SplashOccasion;
}) {
  const note = occasion === "engagement" ? ENGAGEMENT_NOTE : BIRTHDAY_NOTE;
  const isEngagement = occasion === "engagement";
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

  const confetti = isEngagement ? ENGAGEMENT_CONFETTI : BIRTHDAY_CONFETTI;

  return createPortal(
    <div
      className={
        "birthday-splash fixed inset-0 z-[200] flex flex-col overflow-hidden " +
        (leaving ? "animate-splash-out" : "animate-splash-in")
      }
      role="dialog"
      aria-modal="true"
      aria-label={
        occasion === "engagement" ? "Engagement day message" : "Birthday message"
      }
    >
      <style>{`
        @keyframes splash-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes splash-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes birthday-rise {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes float-orbit {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(30px, -30px);
          }
          66% {
            transform: translate(-20px, 20px);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.5),
                        0 0 40px rgba(14, 165, 233, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(6, 182, 212, 0.8),
                        0 0 80px rgba(14, 165, 233, 0.5);
          }
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
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

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes scale-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
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

        ${isEngagement ? `
          .birthday-splash-bg {
            background: linear-gradient(135deg, #0a1e2e 0%, #0f3460 30%, #16213e 60%, #0a1e2e 100%);
            position: relative;
          }

          .float-orb {
            animation: float-orbit linear infinite;
          }

          .glow-pulse-effect {
            animation: glow-pulse 4s ease-in-out infinite;
          }

          .shine-text {
            color: #e0f2fe;
            font-weight: 700;
            text-shadow: 0 0 20px rgba(14, 165, 233, 0.4);
          }

          .engagement-badge {
            background: rgba(6, 182, 212, 0.15);
            border: 1.5px solid #0ea5e9;
            box-shadow: 0 4px 16px rgba(14, 165, 233, 0.15);
          }

          .engagement-quote {
            background: rgba(15, 23, 42, 0.7);
            border: 1.5px solid rgba(14, 165, 233, 0.4);
            box-shadow: 0 8px 24px rgba(14, 165, 233, 0.15);
            backdrop-filter: blur(8px);
          }

          .engagement-btn {
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
            box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
          }

          .engagement-btn:hover {
            box-shadow: 0 8px 40px rgba(6, 182, 212, 0.5),
                        0 0 30px rgba(14, 165, 233, 0.4);
            transform: translateY(-3px);
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          }
        ` : `
          .birthday-splash-bg {
            background: linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #f97316 100%);
          }
        `}
      `}</style>

      {/* Animated background */}
      <div className="birthday-splash-bg absolute inset-0" />

      {/* Engagement floating orbs */}
      {isEngagement && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {FLOAT_ORBS.map((orb) => (
            <div
              key={`orb-${orb.id}`}
              className="float-orb glow-pulse-effect absolute rounded-full"
              style={{
                width: orb.size,
                height: orb.size,
                left: orb.left,
                top: orb.top,
                background: `radial-gradient(circle at 30% 30%, rgba(14, 165, 233, 0.3), rgba(6, 182, 212, 0.1))`,
                animation: `float-orbit ${orb.duration} linear infinite`,
                animationDelay: orb.delay,
                filter: "blur(1px)",
              }}
            />
          ))}
        </div>
      )}

      {/* Confetti */}
      <div className="birthday-confetti pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="birthday-confetti-piece absolute rounded-full"
            style={{
              left: c.left,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              opacity: isEngagement ? c.opacity : 0.8,
              animationDelay: c.delay,
              animationDuration: c.duration,
              transform: isEngagement ? `rotate(${c.rotate}deg)` : "none",
              boxShadow: isEngagement
                ? `0 0 ${c.size * 2}px ${c.color}80`
                : "none",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          {/* Badge */}
          <div
            className="animate-birthday-rise text-center"
            style={{ animationDelay: "0.1s" }}
          >
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] " +
                (isEngagement
                  ? "engagement-badge text-cyan-200"
                  : "bg-white text-sky-600")
              }
            >
              {isEngagement ? (
                <>
                  <Heart size={12} className="text-cyan-300" />
                  Us Dashboard
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  Us Dashboard
                </>
              )}
            </span>
          </div>

          {/* Headline */}
          <h1
            className={
              "animate-birthday-rise mt-6 text-center font-bold tracking-tight drop-shadow-lg " +
              (isEngagement
                ? "shine-text text-5xl leading-tight"
                : "text-white text-[2rem] leading-tight")
            }
            style={{ animationDelay: "0.2s" }}
          >
            {note.headline}
          </h1>

          {/* Subheading */}
          <p
            className={
              "animate-birthday-rise mt-3 text-center text-sm " +
              (isEngagement ? "text-cyan-100/90" : "text-white/85")
            }
            style={{ animationDelay: "0.3s" }}
          >
            {note.subhead}
          </p>

          {/* Quotes */}
          <div
            className="animate-birthday-rise mt-8 space-y-3"
            style={{ animationDelay: "0.45s" }}
          >
            {/* Main note */}
            <blockquote
              className={
                "rounded-3xl p-6 shadow-md transition-all duration-300 " +
                (isEngagement
                  ? "engagement-quote"
                  : "border border-white/30 bg-white")
              }
            >
              <p
                className={
                  "text-[16px] font-medium leading-relaxed " +
                  (isEngagement ? "text-cyan-50" : "text-slate-800")
                }
              >
                {note.about}
              </p>
            </blockquote>

            {/* From message */}
            <blockquote
              className={
                "rounded-3xl p-6 shadow-md transition-all duration-300 " +
                (isEngagement
                  ? "engagement-quote"
                  : "border border-white/30 bg-white")
              }
            >
              <p
                className={
                  "text-[12px] font-semibold uppercase tracking-wider letter-spacing-1 " +
                  (isEngagement ? "text-cyan-300" : "text-cyan-600")
                }
              >
                {isEngagement ? "💙 From Mustafa" : "From Mustafa"}
              </p>
              <p
                className={
                  "mt-3 text-[16px] font-medium leading-relaxed " +
                  (isEngagement ? "text-cyan-50" : "text-slate-800")
                }
              >
                {note.fromMustafa}
              </p>
            </blockquote>
          </div>

          {/* CTA Button */}
          <button
            type="button"
            onClick={dismiss}
            className={
              "animate-birthday-rise mt-8 w-full py-3 px-4 rounded-xl font-semibold text-white uppercase tracking-wide transition-all duration-300 " +
              (isEngagement
                ? "engagement-btn"
                : "bg-cyan-500 hover:bg-cyan-600")
            }
            style={{ animationDelay: "0.6s" }}
          >
            {isEngagement ? "💍 Open your dashboard" : "Open your dashboard"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}