"use client";

import { useMemo } from "react";
import { Waves } from "lucide-react";

/** Soft floating ocean accents behind the app on one-year day. */
export function OneYearAtmosphere() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${6 + ((i * 8) % 88)}%`,
        size: 8 + (i % 4) * 4,
        duration: `${12 + (i % 5) * 2}s`,
        delay: `${(i * 0.7) % 8}s`,
      })),
    []
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="engagement-heart absolute bottom-[-20px] rounded-full bg-rose/25"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: b.duration,
            animationDelay: b.delay,
          }}
        />
      ))}
      <Waves
        size={48}
        className="absolute bottom-24 right-6 text-secondary/20 animate-float"
      />
    </div>
  );
}
