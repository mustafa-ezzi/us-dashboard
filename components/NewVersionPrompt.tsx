"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

type VersionResponse = {
  version: string;
  shortVersion?: string;
};

export function NewVersionPrompt() {
  const loadedVersionRef = useRef<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<VersionResponse | null>(
    null
  );
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkVersion = async () => {
      try {
        const response = await fetch(`/api/version?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const data = (await response.json()) as VersionResponse;
        if (!data.version || cancelled) return;

        if (!loadedVersionRef.current) {
          loadedVersionRef.current = data.version;
          return;
        }

        if (
          data.version !== loadedVersionRef.current &&
          data.version !== dismissedVersion
        ) {
          setLatestVersion(data);
        }
      } catch {
        // Version checks are intentionally quiet.
      }
    };

    checkVersion();
    const timer = window.setInterval(checkVersion, CHECK_INTERVAL_MS);
    const onFocus = () => checkVersion();
    const onVisible = () => {
      if (document.visibilityState === "visible") checkVersion();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [dismissedVersion]);

  if (!latestVersion) return null;

  const restartApp = async () => {
    const registrations = await navigator.serviceWorker?.getRegistrations?.();
    await Promise.all(
      registrations?.map((registration) => registration.update()) ?? []
    );
    window.location.reload();
  };

  const dismiss = () => {
    setDismissedVersion(latestVersion.version);
    setLatestVersion(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-24 z-[120] mx-auto w-full max-w-md px-4">
      <div className="animate-pop-in rounded-3xl border border-rose-100 bg-white p-4 shadow-cardHover">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose">
            <Sparkles size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">New version is up</p>
            <p className="mt-1 text-sm leading-5 text-ink-soft">
              Restart your app to experience the new Memory jar Experience 💝
            </p>
            {latestVersion.shortVersion && (
              <p className="mt-1 text-[11px] text-ink-subtle">
                Version {latestVersion.shortVersion}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-subtle hover:bg-rose-50 hover:text-rose"
            aria-label="Dismiss version update"
          >
            <X size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={restartApp}
          className="btn-primary mt-4 w-full"
        >
          <RefreshCw size={16} />
          Restart app
        </button>
      </div>
    </div>
  );
}
