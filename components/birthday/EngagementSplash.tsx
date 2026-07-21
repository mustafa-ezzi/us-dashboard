"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { ENGAGEMENT_NOTE } from "@/lib/birthday";

type Particle = {
  id: number;
  width: number;
  height: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
};

export function EngagementSplash() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        width: Math.random() * 6 + 2,
        height: Math.random() * 6 + 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 5,
      })),
    []
  );

  const dismiss = () => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    setLeaving(true);
    setTimeout(() => setVisible(false), 480);
  };

  useEffect(() => {
    setMounted(true);
    setVisible(true);

    // Extra time so the note can be read; still auto-continues
    autoTimerRef.current = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => setVisible(false), 480);
    }, 12000);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className={
        "fixed inset-0 z-[200] flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-y-auto overflow-x-hidden bg-[#050A2E] " +
        (leaving ? "animate-splash-out" : "animate-splash-in")
      }
      role="dialog"
      aria-modal="true"
      aria-label="Engagement day splash"
    >
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(26, 10, 94, 0.8) 0%, rgba(5, 10, 46, 1) 50%)",
              "radial-gradient(circle at 80% 70%, rgba(255, 0, 110, 0.4) 0%, rgba(13, 71, 161, 0.6) 40%, rgba(5, 10, 46, 1) 70%)",
              "radial-gradient(circle at 50% 50%, rgba(255, 77, 179, 0.3) 0%, rgba(26, 10, 94, 0.7) 50%, rgba(5, 10, 46, 1) 80%)",
              "radial-gradient(circle at 20% 30%, rgba(26, 10, 94, 0.8) 0%, rgba(5, 10, 46, 1) 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white mix-blend-screen"
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <div className="z-10 flex w-full max-w-sm flex-col items-center px-6 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
          className="relative mb-6"
        >
          <svg
            width="120"
            height="60"
            viewBox="0 0 120 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_15px_rgba(255,0,110,0.5)]"
          >
            <motion.path
              d="M30 15C15 15 5 25 5 40C5 55 15 55 25 55C40 55 50 35 60 35C70 35 80 55 95 55C105 55 115 55 115 40C115 25 105 15 90 15C75 15 65 35 60 35C55 35 45 15 30 15Z"
              stroke="#FF006E"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.4 }}
            />
          </svg>
        </motion.div>

        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7DD3FC]"
        >
          Engagement Day
        </motion.p>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-2 text-5xl font-extrabold tracking-tighter text-white drop-shadow-md"
          style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
        >
          us.
        </motion.h1>

        <motion.h2
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.15 }}
          className="mb-2 text-xl font-semibold text-white"
        >
          {ENGAGEMENT_NOTE.headline}
        </motion.h2>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.35 }}
          className="mb-6 text-base font-medium tracking-wide text-blue-200/80"
        >
          {ENGAGEMENT_NOTE.subhead}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.55 }}
          className="mb-4 w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-left backdrop-blur-sm"
        >
          <p className="text-[14px] leading-relaxed text-blue-50/95">
            {ENGAGEMENT_NOTE.about}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.75 }}
          className="mb-8 w-full rounded-2xl border border-[#FF006E]/30 bg-[#FF006E]/10 p-4 text-left backdrop-blur-sm"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FF4DB3]">
            From Mustafa
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-white/95">
            {ENGAGEMENT_NOTE.fromMustafa}
          </p>
        </motion.div>

        <motion.button
          type="button"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={dismiss}
          className="group relative overflow-hidden rounded-full bg-[#FF006E] px-8 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(255,0,110,0.4)] transition-shadow hover:shadow-[0_0_30px_rgba(255,0,110,0.6)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Open your day <Heart size={20} className="fill-white" />
          </span>
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-splash-shimmer" />
        </motion.button>
      </div>
    </div>,
    document.body
  );
}
