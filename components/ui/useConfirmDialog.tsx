"use client";

import { useCallback, useState } from "react";
import {
  ConfirmModal,
  type ConfirmVariant,
} from "@/components/ui/ConfirmModal";
import type { ReactNode } from "react";

type ConfirmOptions = {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [busy, setBusy] = useState(false);

  const askConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const dismiss = useCallback((result: boolean) => {
    setPending((current) => {
      current?.resolve(result);
      return null;
    });
    setBusy(false);
  }, []);

  const ConfirmDialog = useCallback(() => {
    if (!pending) return null;

    return (
      <ConfirmModal
        open
        title={pending.title}
        message={pending.message}
        confirmLabel={pending.confirmLabel}
        cancelLabel={pending.cancelLabel}
        variant={pending.variant}
        busy={busy}
        onClose={() => dismiss(false)}
        onConfirm={async () => {
          setBusy(true);
          dismiss(true);
        }}
      />
    );
  }, [pending, busy, dismiss]);

  return { askConfirm, ConfirmDialog };
}
