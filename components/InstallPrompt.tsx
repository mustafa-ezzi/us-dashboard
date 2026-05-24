"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { isStandalonePWA } from "@/lib/push/client";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (isStandalonePWA()) return;

    const isApple =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(isApple);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (isStandalonePWA() || dismissed) return null;

  if (isIOS) {
    return (
      <div className="fixed inset-x-0 bottom-[5.5rem] z-40 mx-3 animate-fade-in">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-cardHover">
          <p className="text-sm font-semibold text-ink">Install Us Dashboard</p>
          <p className="mt-1 text-xs text-ink-muted">
            Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> for
            the full app + notifications.
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="btn-ghost mt-3 w-full !py-2 text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  if (!deferred) return null;

  return (
    <div className="fixed inset-x-0 bottom-[5.5rem] z-40 mx-3 animate-fade-in">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-cardHover">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose text-white">
          <Download size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Install Us Dashboard</p>
          <p className="text-xs text-ink-muted">Add to home screen for push alerts.</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-subtle hover:bg-rose-50"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
      <button
        onClick={async () => {
          await deferred.prompt();
          setDeferred(null);
          setDismissed(true);
        }}
        className="btn-primary mt-2 w-full !py-2.5"
      >
        Install app
      </button>
    </div>
  );
}
