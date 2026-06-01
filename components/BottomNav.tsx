"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Home, CalendarHeart, SmilePlus, ScrollText, BarChart3 } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dates", label: "Dates", icon: CalendarHeart },
  { href: "/mood", label: "Mood", icon: SmilePlus },
  { href: "/contract", label: "Contract", icon: ScrollText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
] as const;

type AlertKey = "dates" | "mood" | "contract";
type SeenMap = Partial<Record<AlertKey, string>>;

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  const { partner, state, user } = useStore();
  const storageKey = user ? `us-dashboard:tab-seen:${user.id}` : null;
  const [seen, setSeen] = useState<SeenMap>({});

  const tabUpdates = useMemo(() => {
    if (!partner) return emptyTabUpdates();

    const dateUpdates = state.plannedDates.flatMap((date) => [
      ...(date.createdBy !== partner ? [date.createdISO] : []),
      ...(date.respondedBy && date.respondedBy !== partner && date.respondedAtISO
        ? [date.respondedAtISO]
        : []),
    ]);

    const moodUpdates = state.moods
      .filter((mood) => mood.partner !== partner)
      .map((mood) => mood.createdISO);

    const contractUpdates = [
      ...state.rules
        .filter((rule) => rule.proposedBy !== partner)
        .map((rule) => rule.createdISO),
      ...state.violations
        .filter((violation) => violation.violator === partner)
        .map((violation) => violation.createdISO),
    ];

    return {
      dates: summarizeUpdates(dateUpdates, seen.dates),
      mood: summarizeUpdates(moodUpdates, seen.mood),
      contract: summarizeUpdates(contractUpdates, seen.contract),
    };
  }, [partner, seen.contract, seen.dates, seen.mood, state.moods, state.plannedDates, state.rules, state.violations]);

  useEffect(() => {
    if (!storageKey) return;

    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        setSeen(JSON.parse(raw) as SeenMap);
        return;
      } catch {
        // Fall through and reset malformed local state.
      }
    }

    const initialSeen = {
      dates: new Date().toISOString(),
      mood: new Date().toISOString(),
      contract: new Date().toISOString(),
    };
    window.localStorage.setItem(storageKey, JSON.stringify(initialSeen));
    setSeen(initialSeen);
  }, [storageKey]);

  useEffect(() => {
    const activeKey = getAlertKey(pathname);
    if (!activeKey || !storageKey) return;

    const seenISO = tabUpdates[activeKey].latestISO ?? new Date().toISOString();
    setSeen((current) => {
      if (current[activeKey] === seenISO) return current;
      const next = { ...current, [activeKey]: seenISO };
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [pathname, storageKey, tabUpdates]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md">
      <div className="mx-3 mb-3 rounded-3xl border border-line bg-white/95 shadow-card backdrop-blur-md pb-safe">
        <ul className="grid grid-cols-5 px-2 py-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            const alertKey = getAlertKey(href);
            const alertCount = alertKey ? tabUpdates[alertKey].count : 0;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-all duration-200 active:scale-95",
                    active
                      ? "text-rose"
                      : "text-ink-muted hover:text-ink-soft"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "relative grid h-9 w-9 place-items-center rounded-2xl transition-all duration-200",
                      active ? "bg-rose-100 scale-105" : "bg-transparent"
                    )}
                  >
                    <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                    {alertCount > 0 && !active && (
                      <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[10px] font-bold leading-none text-white shadow-card ring-2 ring-white">
                        {alertCount > 9 ? "9+" : alertCount}
                      </span>
                    )}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function getAlertKey(href: string): AlertKey | null {
  if (href.startsWith("/dates")) return "dates";
  if (href.startsWith("/mood")) return "mood";
  if (href.startsWith("/contract")) return "contract";
  return null;
}

function summarizeUpdates(updates: Array<string | undefined>, seenISO?: string) {
  const seenMs = seenISO ? new Date(seenISO).getTime() : Date.now();
  const validUpdates = updates
    .filter((iso): iso is string => Boolean(iso))
    .map((iso) => ({ iso, ms: new Date(iso).getTime() }))
    .filter((update) => Number.isFinite(update.ms));

  const latest = validUpdates.reduce<{ iso?: string; ms: number }>(
    (current, update) => (update.ms > current.ms ? update : current),
    { ms: 0 }
  );

  return {
    count: validUpdates.filter((update) => update.ms > seenMs).length,
    latestISO: latest.iso,
  };
}

function emptyTabUpdates() {
  return {
    dates: { count: 0, latestISO: undefined },
    mood: { count: 0, latestISO: undefined },
    contract: { count: 0, latestISO: undefined },
  };
}
