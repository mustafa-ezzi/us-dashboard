"use client";

import Link from "next/link";
import { CalendarHeart, ScrollText, SmilePlus } from "lucide-react";

const actions = [
  { href: "/dates", label: "Plan date", icon: CalendarHeart },
  { href: "/mood", label: "Log mood", icon: SmilePlus },
  { href: "/contract", label: "Add rule", icon: ScrollText },
];

export function QuickActions() {
  return (
    <section className="card p-4">
      <p className="stat-label mb-3">Quick actions</p>
      <div className="grid grid-cols-3 gap-2">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-2 py-3 text-center text-xs font-medium text-ink-soft transition active:scale-[0.98] hover:bg-rose-50"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-rose">
              <Icon size={18} />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
