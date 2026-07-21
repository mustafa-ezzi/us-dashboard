"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Image from "next/image";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { LoginScreen } from "./auth/LoginScreen";
import { BirthdaySplash } from "./birthday/BirthdaySplash";
import { EngagementSplash } from "./birthday/EngagementSplash";
import {
  isBirthdaySplashEnabled,
  isEngagementDay,
} from "@/lib/birthday";
import { useStore } from "@/lib/store";
import { Loader2, AlertTriangle } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { authStatus, ready, partner, state } = useStore();

  if (authStatus === "no-config") {
    return <ConfigMissingScreen />;
  }

  if (authStatus === "loading") {
    return <FullScreenLoader />;
  }

  if (authStatus === "signed-out") {
    return <LoginScreen />;
  }

  if (!ready) return <FullScreenLoader />;

  if (!partner) return <NotEnrolledScreen />;

  const engagementDay = isEngagementDay(state.settings.engagementISO);
  const showBirthdaySplash = !engagementDay && isBirthdaySplashEnabled();

  return (
    <EngagementDayChrome active={engagementDay}>
      {engagementDay && <EngagementSplash />}
      {showBirthdaySplash && <BirthdaySplash />}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-cream transition-colors duration-500">
        {engagementDay && <EngagementDayAtmosphere />}
        <TopBar engagementDay={engagementDay} />
        <main className="relative z-10 flex-1 px-4 pb-28 pt-4">
          <div className="animate-slide-up">{children}</div>
        </main>
        <BottomNav />
      </div>
    </EngagementDayChrome>
  );
}

/** Sets html[data-theme=engagement] so CSS vars recolor the whole app for the day. */
function EngagementDayChrome({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    if (active) {
      root.setAttribute("data-theme", "engagement");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#FF006E");
    } else {
      root.removeAttribute("data-theme");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#E91E8C");
    }
    return () => {
      root.removeAttribute("data-theme");
    };
  }, [active]);

  return <>{children}</>;
}

/** Soft floating orbs behind the dashboard on engagement day. */
function EngagementDayAtmosphere() {
  const orbs = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        size: 48 + (i % 4) * 28,
        left: `${(i * 13 + 5) % 90}%`,
        top: `${(i * 17 + 8) % 75}%`,
        duration: 10 + (i % 5) * 2,
        delay: i * 0.4,
        pink: i % 2 === 0,
      })),
    []
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {orbs.map((orb) => (
        <span
          key={orb.id}
          className="absolute rounded-full opacity-40 blur-2xl animate-float"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.left,
            top: orb.top,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
            background: orb.pink
              ? "radial-gradient(circle, rgba(255,0,110,0.35), transparent 70%)"
              : "radial-gradient(circle, rgba(14,165,233,0.4), transparent 70%)",
          }}
        />
      ))}
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream text-ink-muted">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-card animate-float">
          <Image
            src="/logo.png"
            alt="Loading"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 grid place-items-center">
            <Loader2 size={22} className="animate-spin text-white drop-shadow-lg" />
          </div>
        </div>
        <span className="animate-pulse-soft text-sm">Loading…</span>
      </div>
    </div>
  );
}

function ConfigMissingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="card max-w-sm p-5 text-sm">
        <div className="mb-2 flex items-center gap-2 text-rose-700">
          <AlertTriangle size={18} />
          <h2 className="font-semibold">Supabase not configured</h2>
        </div>
        <p className="text-ink-soft">
          Add these to <code className="rounded bg-rose-50 px-1.5">.env.local</code>{" "}
          and restart the dev server:
        </p>
        <pre className="mt-3 overflow-auto rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
          {`NEXT_PUBLIC_SUPABASE_URL=https://twdimkclschgxhxmwaff.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste your anon key>`}
        </pre>
        <p className="mt-3 text-ink-muted">
          The anon key lives at <em>Project Settings → API</em>.
        </p>
      </div>
    </div>
  );
}

function NotEnrolledScreen() {
  const { user, signOut } = useStore();
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="card max-w-sm p-5 text-sm">
        <div className="mb-2 flex items-center gap-2 text-rose-700">
          <AlertTriangle size={18} />
          <h2 className="font-semibold">Not part of any couple yet</h2>
        </div>
        <p className="text-ink-soft">
          The user{" "}
          <span className="font-semibold text-ink">{user?.email}</span> isn&apos;t
          linked to a couple in the database. Run the seed block from{" "}
          <code className="rounded bg-rose-50 px-1.5">supabase/schema.sql</code>{" "}
          (after both auth users exist) to create the couple and link them.
        </p>
        <button onClick={signOut} className="btn-ghost mt-4 w-full">
          Sign out
        </button>
      </div>
    </div>
  );
}
