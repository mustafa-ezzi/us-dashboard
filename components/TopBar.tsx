"use client";

import Link from "next/link";
import Image from "next/image";
import { Send, Settings as SettingsIcon, Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "Us",
  "/dates": "Date Planner",
  "/mood": "Mood",
  "/contract": "Contract",
  "/settings": "Settings",
  "/reports": "Reports",
  "/secret-messages": "Secret Messages",
};

export function TopBar({ engagementDay = false }: { engagementDay?: boolean }) {
  const { state } = useStore();
  const pathname = usePathname();
  const title = titles[pathname ?? "/"] ?? "Us";

  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-cream/85 backdrop-blur-md transition-colors duration-500">
      <div className="flex items-center justify-between px-4 pt-safe pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-2xl bg-white shadow-card">
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
          {engagementDay && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <Heart size={10} className="fill-white" />
              Today
            </span>
          )}
          <Link
            href="/secret-messages"
            aria-label="Secret messages"
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink-soft transition active:scale-95 hover:bg-rose-50"
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
      {engagementDay && (
        <div className="border-t border-line/50 bg-secondary-50 px-4 py-1.5 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-secondary">
            Engagement Day — light sky &amp; hot pink
          </p>
        </div>
      )}
    </header>
  );
}
