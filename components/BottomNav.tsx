"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarHeart, SmilePlus, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dates", label: "Dates", icon: CalendarHeart },
  { href: "/mood", label: "Mood", icon: SmilePlus },
  { href: "/contract", label: "Contract", icon: ScrollText },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md">
      <div className="mx-3 mb-3 rounded-3xl border border-line bg-white/95 shadow-card backdrop-blur-md pb-safe">
        <ul className="grid grid-cols-4 px-2 py-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
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
                      "grid h-9 w-9 place-items-center rounded-2xl transition-all duration-200",
                      active ? "bg-rose-100 scale-105" : "bg-transparent"
                    )}
                  >
                    <Icon size={20} strokeWidth={active ? 2.4 : 2} />
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
