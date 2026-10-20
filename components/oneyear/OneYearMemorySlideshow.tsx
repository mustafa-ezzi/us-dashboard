"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ONE_YEAR_ROMANCE } from "@/lib/birthday";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

type Slide =
  | { kind: "title"; text: string; sub?: string }
  | { kind: "memory"; text: string; imageUrl?: string; date?: string }
  | { kind: "end"; text: string; sub?: string };

/** How long to linger after the slide (and its image) is ready */
const DWELL_MS_TITLE = 5500;
const DWELL_MS_MEMORY = 9000;
const DWELL_MS_END = 6000;

function dwellFor(slide: Slide): number {
  if (slide.kind === "title") return DWELL_MS_TITLE;
  if (slide.kind === "end") return DWELL_MS_END;
  return DWELL_MS_MEMORY;
}

export function OneYearMemorySlideshow() {
  const { state } = useStore();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [imageReady, setImageReady] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slides = useMemo<Slide[]>(() => {
    const memories = [...state.memories]
      .sort(
        (a, b) =>
          new Date(a.memoryDateISO).getTime() -
          new Date(b.memoryDateISO).getTime()
      )
      .slice(0, 24);

    const memorySlides: Slide[] = memories.map((m) => ({
      kind: "memory" as const,
      text: m.text,
      imageUrl: m.imageUrl,
      date: m.memoryDateISO,
    }));

    if (memorySlides.length === 0) {
      memorySlides.push({
        kind: "memory",
        text: "One year of quiet moments, loud laughs, and choosing each other.",
      });
    }

    return [
      {
        kind: "title",
        text: ONE_YEAR_ROMANCE.slideshowFrom,
        sub: "365 days of us",
      },
      ...memorySlides,
      {
        kind: "end",
        text: ONE_YEAR_ROMANCE.slideshowTo,
        sub: "always yours",
      },
    ];
  }, [state.memories]);

  const slide = slides[index];

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const goTo = useCallback(
    (next: number) => {
      clearTimer();
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length]
  );

  // When slide changes: reset ready state; text-only slides are ready immediately
  useEffect(() => {
    if (!slide) return;
    const needsImage = slide.kind === "memory" && Boolean(slide.imageUrl);
    setImageReady(!needsImage);
  }, [slide, index]);

  // Preload the upcoming image so the next slide is smoother
  useEffect(() => {
    if (typeof window === "undefined" || slides.length < 2) return;
    const upcoming = slides[(index + 1) % slides.length];
    if (upcoming?.kind === "memory" && upcoming.imageUrl) {
      const img = new window.Image();
      img.src = upcoming.imageUrl;
    }
  }, [index, slides]);

  // Advance only after image is ready + dwell time
  useEffect(() => {
    clearTimer();
    if (!playing || !slide || !imageReady || slides.length < 2) return;

    timerRef.current = setTimeout(() => {
      goTo(index + 1);
    }, dwellFor(slide));

    return clearTimer;
  }, [playing, slide, imageReady, index, slides.length, goTo]);

  if (!slide) return null;

  const go = (dir: -1 | 1) => {
    setPlaying(false);
    goTo(index + dir);
  };

  return (
    <section className="card overflow-hidden">
      <div className="relative aspect-[4/5] w-full bg-rose text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.kind}-${index}`}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col"
          >
            {slide.kind === "memory" && slide.imageUrl ? (
              <>
                <div className="relative min-h-0 flex-1 bg-rose-800/40">
                  {!imageReady && (
                    <div className="absolute inset-0 z-[1] grid place-items-center">
                      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    </div>
                  )}
                  <Image
                    src={slide.imageUrl}
                    alt="Memory"
                    fill
                    priority={index < 3}
                    className={
                      "object-cover transition-opacity duration-500 " +
                      (imageReady ? "opacity-100" : "opacity-0")
                    }
                    sizes="(max-width: 640px) 100vw, 420px"
                    unoptimized={slide.imageUrl.startsWith("data:")}
                    onLoad={() => setImageReady(true)}
                    onError={() => setImageReady(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  {slide.date && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                      {slide.date}
                    </p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-white line-clamp-4">
                    {slide.text}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                {(slide.kind === "title" || slide.kind === "end") && (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      {slide.sub}
                    </p>
                    <p className="mt-4 font-serif text-3xl font-semibold leading-snug tracking-tight">
                      {slide.text}
                    </p>
                  </>
                )}
                {slide.kind === "memory" && (
                  <p className="text-base leading-relaxed text-white/95">
                    &ldquo;{slide.text}&rdquo;
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
          <p className="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
            {index + 1} / {slides.length}
          </p>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="grid h-8 w-8 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm"
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>

        <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-1">
          <button
            type="button"
            onClick={() => go(-1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 z-10 flex items-center pr-1">
          <button
            type="button"
            onClick={() => go(1)}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
