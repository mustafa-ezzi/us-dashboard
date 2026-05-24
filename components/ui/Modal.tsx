"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 animate-fade-in"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col animate-pop-in sm:mx-4">
        {/* Bottom sheet on mobile, centered card on larger screens */}
        <div className="mx-0 max-h-[min(88dvh,720px)] overflow-hidden rounded-t-3xl bg-white shadow-cardHover sm:mx-0 sm:rounded-3xl">
          <div className="flex justify-center pt-2.5 sm:hidden">
            <span className="h-1 w-10 rounded-full bg-line" aria-hidden />
          </div>
          <div className="flex items-center justify-between border-b border-line/60 px-5 pb-3 pt-2 sm:border-0 sm:pb-0 sm:pt-5">
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-rose-50 text-ink-soft hover:bg-rose-100"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 sm:pb-5">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
