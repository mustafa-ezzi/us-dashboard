"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Hammer, Heart, Sparkles } from "lucide-react";
import {
  getEngagementLockEnd,
  setEngagementLockBypass,
  shouldShowEngagementLock,
} from "@/lib/engagement-lock";

type Particle = {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
};

function useLockActive() {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const next = shouldShowEngagementLock();
      setActive((prev) => (prev === next ? prev : next));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { mounted, active, setActive };
}

function useCountdown(end: Date, enabled: boolean) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [enabled]);

  const diff = Math.max(0, end.getTime() - now.getTime());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds, done: diff <= 0 };
}

function TimerCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[3.4rem] flex-1 flex-col items-center rounded-xl border border-white/10 bg-white/5 px-2 py-2.5">
      <span className="font-mono text-2xl font-bold tabular-nums tracking-tight text-[#7DD3FC]">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </span>
    </div>
  );
}

export function EngagementConstructionLock({
  onUnlocked,
}: {
  onUnlocked?: () => void;
}) {
  const { mounted, active, setActive } = useLockActive();
  const unlockAt = useMemo(() => getEngagementLockEnd(), []);
  const countdown = useCountdown(unlockAt, active);
  const taps = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 11 + 3) % 97}%`,
        top: `${(i * 17 + 5) % 90}%`,
        size: 3 + (i % 4),
        duration: 5 + (i % 6),
        delay: (i % 8) * 0.35,
      })),
    []
  );

  useEffect(() => {
    if (mounted && !active) onUnlocked?.();
  }, [mounted, active, onUnlocked]);

  if (!mounted || !active) return null;

  const handleLogoTap = () => {
    taps.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      taps.current = 0;
    }, 1600);

    if (taps.current >= 7) {
      taps.current = 0;
      // Session + this device only — her phone stays on the lock/preview
      setEngagementLockBypass(true);
      setActive(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#050A2E] px-6"
      role="dialog"
      aria-modal="true"
      aria-label="App under construction"
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.25) 0%, rgba(5,10,46,1) 55%)",
            "radial-gradient(circle at 80% 70%, rgba(255,0,110,0.28) 0%, rgba(5,10,46,1) 55%)",
            "radial-gradient(circle at 40% 60%, rgba(56,189,248,0.2) 0%, rgba(5,10,46,1) 55%)",
            "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.25) 0%, rgba(5,10,46,1) 55%)",
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-50">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white mix-blend-screen"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              filter: "blur(0.5px)",
            }}
            animate={{ y: [0, -40, 0], opacity: [0.15, 0.7, 0.15] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <motion.button
          type="button"
          onClick={handleLogoTap}
          className="relative mb-8 grid h-24 w-24 place-items-center rounded-3xl border border-white/15 bg-white/5 backdrop-blur-sm"
          aria-label="Construction mark"
          whileTap={{ scale: 0.96 }}
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Hammer size={36} className="text-[#38BDF8]" />
          </motion.div>
          <motion.div
            className="absolute -right-1 -top-1"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <Sparkles size={18} className="text-[#FF006E]" />
          </motion.div>
        </motion.button>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7DD3FC]"
        >
          Closed for a little magic
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-extrabold tracking-tight text-white"
        >
          Under construction
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-base leading-relaxed text-blue-100/85"
        >
          The app is closed while we finish something special for{" "}
          <span className="font-semibold text-[#FF4DB3]">Engagement Day</span>.
          Come back when the doors open.
        </motion.p>

        <div className="relative mt-8 h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-[#FF006E]"
            animate={{ width: ["12%", "78%", "38%", "92%", "12%"] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="mt-2 text-[11px] font-medium tracking-wide text-white/50">
          Building the final day…
        </p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-sm"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
            Opens
          </p>
          <p className="mt-1 text-base font-semibold text-white">
            25 Jul 2026 · 8:00 PM
          </p>
          {countdown.done ? (
            <p className="mt-4 text-sm font-medium text-[#7DD3FC]">
              Unlocking…
            </p>
          ) : (
            <div className="mt-4 flex gap-2">
              <TimerCell value={countdown.days} label="Days" />
              <TimerCell value={countdown.hours} label="Hrs" />
              <TimerCell value={countdown.minutes} label="Min" />
              <TimerCell value={countdown.seconds} label="Sec" />
            </div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center gap-1.5 text-xs text-white/40"
        >
          us. <Heart size={10} className="fill-[#FF006E] text-[#FF006E]" /> almost
          ready
        </motion.p>
      </div>
    </div>
  );
}
