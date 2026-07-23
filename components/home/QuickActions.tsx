"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { isEngagementDay } from "@/lib/birthday";
import {
  BookOpen,
  CalendarHeart,
  Heart,
  ScrollText,
  Send,
  SmilePlus,
} from "lucide-react";

const normalActions = [
  { href: "/dates", label: "Plan date", icon: CalendarHeart },
  { href: "/mood", label: "Log mood", icon: SmilePlus },
  { href: "/contract", label: "Add rule", icon: ScrollText },
] as const;

const engagementActions = [
  { href: "/secret-messages", label: "Secret note", icon: Send },
  { href: "/memories", label: "Memory jar", icon: BookOpen },
  { href: "/dates", label: "Celebrate", icon: CalendarHeart },
] as const;

export function QuickActions() {
  const { state } = useStore();
  const engagementDay = isEngagementDay(state.settings.engagementISO);
  const actions = engagementDay ? engagementActions : normalActions;

  return (
    <section className="card p-4">
      <p className="stat-label mb-3">
        {engagementDay ? (
          <span className="inline-flex items-center gap-1 text-secondary">
            <Heart size={11} className="fill-secondary" />
            Engagement day actions
          </span>
        ) : (
          "Quick actions"
        )}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={
              "flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium transition active:scale-[0.98] " +
              (engagementDay
                ? "border-secondary/25 bg-secondary-50 text-ink-soft hover:border-secondary/50"
                : "border-line bg-white text-ink-soft hover:bg-rose-50")
            }
          >
            <span
              className={
                "grid h-9 w-9 place-items-center rounded-xl " +
                (engagementDay
                  ? "bg-secondary text-white"
                  : "bg-rose-100 text-rose")
              }
            >
              <Icon size={18} />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
