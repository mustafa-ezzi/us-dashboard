"use client";

import Link from "next/link";
import { Settings as SettingsIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "Us",
  "/dates": "Date Planner",
  "/mood": "Mood",
  "/contract": "Contract",
  "/settings": "Settings",
};

export function TopBar() {
  const { state } = useStore();
  const pathname = usePathname();
  const title = titles[pathname ?? "/"] ?? "Us";

  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 pt-safe pb-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-2xl bg-rose text-white text-base font-bold shadow-card"
          >
            U
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              {state.settings.her.name} & {state.settings.him.name}
            </p>
            <h1 className="text-base font-semibold text-ink">{title}</h1>
          </div>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink-soft transition active:scale-95 hover:bg-rose-50"
        >
          <SettingsIcon size={18} />
        </Link>
      </div>
    </header>
  );
}
