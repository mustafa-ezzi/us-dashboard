"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const SEEN_KEY = "seen_splash";

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
    localStorage.setItem(SEEN_KEY, "true");
    setLeaving(true);
    setTimeout(() => setVisible(false), 480);
  };

  useEffect(() => {
    setMounted(true);

    if (localStorage.getItem(SEEN_KEY)) {
      return;
    }

    setVisible(true);

    autoTimerRef.current = setTimeout(() => {
      localStorage.setItem(SEEN_KEY, "true");
      setLeaving(true);
      setTimeout(() => setVisible(false), 480);
    }, 4500);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className={
        "fixed inset-0 z-[200] min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#050A2E] " +
        (leaving ? "animate-splash-out" : "animate-splash-in")
      }
      role="dialog"
      aria-modal="true"
      aria-label="Welcome splash"
    >
      {/* === ANIMATED GRADIENT BACKGROUND === */}
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

      {/* === BOKEH / FLOATING PARTICLES === */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
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

      {/* === MAIN CONTENT === */}
      <div className="z-10 flex flex-col items-center text-center px-6 w-full max-w-sm">
        {/* Animated Infinity Heart SVG */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative mb-8"
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
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
            />
          </svg>
        </motion.div>

        {/* Logo Wordmark */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-6xl font-extrabold tracking-tighter text-white mb-4 drop-shadow-md"
          style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
        >
          us.
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-lg text-blue-200/80 mb-12 font-medium tracking-wide"
        >
          Your world. Just the two of you.
        </motion.p>

        {/* CTA Button with shimmer */}
        <motion.button
          type="button"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={dismiss}
          className="relative overflow-hidden group px-8 py-4 rounded-full bg-[#FF006E] text-white font-bold text-lg shadow-[0_0_20px_rgba(255,0,110,0.4)] transition-shadow hover:shadow-[0_0_30px_rgba(255,0,110,0.6)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Get Started <Heart size={20} className="fill-white" />
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-splash-shimmer pointer-events-none" />
        </motion.button>
      </div>
    </div>,
    document.body
  );
}
