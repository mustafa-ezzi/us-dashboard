"use client";

import { useMemo } from "react";
import { Heart } from "lucide-react";

/** Soft floating hearts behind the whole app on engagement day (flat colors, no gradients). */
export function EngagementDayAtmosphere() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${4 + ((i * 7) % 92)}%`,
        size: 10 + (i % 5) * 3,
        duration: `${14 + (i % 6) * 2.5}s`,
        delay: `${(i * 0.9) % 10}s`,
        pink: i % 3 !== 1,
      })),
    []
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {hearts.map((h) => (
        <Heart
          key={h.id}
          size={h.size}
          className={
            "engagement-heart absolute bottom-[-24px] " +
            (h.pink ? "fill-secondary/40 text-secondary/40" : "fill-rose/35 text-rose/35")
          }
          style={{
            left: h.left,
            animationDuration: h.duration,
            animationDelay: h.delay,
          }}
        />
      ))}
    </div>
  );
}
