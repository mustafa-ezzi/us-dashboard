"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export type ConfirmVariant = "default" | "danger";

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  busy = false,
  icon,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  busy?: boolean;
  icon?: ReactNode;
}) {
  const Icon =
    icon ??
    (variant === "danger" ? (
      <Trash2 size={22} className="text-rose" />
    ) : (
      <AlertTriangle size={22} className="text-amber-600" />
    ));

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div
          className={
            "mb-4 grid h-14 w-14 place-items-center rounded-2xl " +
            (variant === "danger" ? "bg-rose-50" : "bg-amber-50")
          }
        >
          {Icon}
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">{message}</p>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          className="btn-ghost flex-1"
          disabled={busy}
          onClick={onClose}
        >
          {cancelLabel}
        </button>
        <button
          className={
            "flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-card transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 " +
            (variant === "danger"
              ? "bg-rose hover:bg-rose-600"
              : "bg-rose hover:bg-rose-600")
          }
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
