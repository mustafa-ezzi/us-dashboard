"use client";

import Link from "next/link";
import Image from "next/image";
import { Send, Settings as SettingsIcon, Heart, Waves } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import type { CelebrationTheme } from "./AppShell";

const titles: Record<string, string> = {
  "/": "Us",
  "/dates": "Date Planner",
  "/mood": "Mood",
  "/contract": "Contract",
  "/settings": "Settings",
  "/reports": "Reports",
  "/secret-messages": "Secret Messages",
};

export function TopBar({
  celebration = null,
}: {
  celebration?: CelebrationTheme;
}) {
  const { state } = useStore();
  const pathname = usePathname();
  const baseTitle = titles[pathname ?? "/"] ?? "Us";
  const onHome = pathname === "/" || !pathname;
  const title =
    celebration === "engagement" && onHome
      ? "Engagement Day"
      : celebration === "oneyear" && onHome
        ? "One Year"
        : baseTitle;

  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-cream/85 backdrop-blur-md transition-colors duration-500">
      <div className="flex items-center justify-between px-4 pt-safe pb-3">
        <div className="flex items-center gap-2">
          <div
            className={
              "grid h-9 w-9 place-items-center overflow-hidden rounded-2xl bg-white shadow-card " +
              (celebration ? "ring-2 ring-secondary/50" : "")
            }
          >
            <Image
              src="/logo.png"
              alt="Us Dashboard"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              {state.settings.her.name} & {state.settings.him.name}
            </p>
            <h1 className="text-base font-semibold text-ink">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {celebration === "engagement" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <Heart size={10} className="fill-white" />
              Today
            </span>
          )}
          {celebration === "oneyear" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <Waves size={10} />
              365
            </span>
          )}
          <Link
            href="/secret-messages"
            aria-label="Secret messages"
            className={
              "grid h-10 w-10 place-items-center rounded-full border bg-white text-ink-soft transition active:scale-95 hover:bg-rose-50 " +
              (celebration
                ? "border-secondary/40 text-secondary"
                : "border-line")
            }
          >
            <Send size={17} />
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink-soft transition active:scale-95 hover:bg-rose-50"
          >
            <SettingsIcon size={18} />
          </Link>
        </div>
      </div>
      {celebration === "engagement" && (
        <div className="border-t border-line/50 bg-secondary-50 px-4 py-1.5 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-secondary">
            Your world. Just the two of you. · Engagement Day
          </p>
        </div>
      )}
      {celebration === "oneyear" && (
        <div className="border-t border-line/50 bg-secondary-50 px-4 py-1.5 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-secondary">
            One year in the ocean · from mahila mitra
          </p>
        </div>
      )}
    </header>
  );
}
