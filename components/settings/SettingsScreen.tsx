"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Heart, LogOut, RefreshCw } from "lucide-react";

export function SettingsScreen() {
  const {
    state,
    user,
    partner,
    updatePartnerName,
    updatePartnerEmoji,
    setAnniversary,
    setEngagementDate,
    signOut,
    refresh,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const anniversaryValue = state.settings.anniversaryISO.slice(0, 10);
  const engagementValue = state.settings.engagementISO?.slice(0, 10) ?? "";

  const meName =
    partner === "her" ? state.settings.her.name : state.settings.him.name;
  const meEmoji =
    partner === "her" ? state.settings.her.emoji : state.settings.him.emoji;

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Make this app feel like yours." />

      <section className="card p-4">
        <p className="stat-label mb-3">Signed in</p>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50 px-3 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {meEmoji} {meName}
            </p>
            <p className="truncate text-xs text-ink-muted">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-medium text-ink-soft hover:bg-white"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
        <button
          onClick={async () => {
            setRefreshing(true);
            try {
              await refresh();
            } finally {
              setRefreshing(false);
            }
          }}
          className="btn-ghost mt-3 w-full"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh from Supabase"}
        </button>
      </section>

      <NotificationSettings />

      <section className="card p-4">
        <p className="stat-label mb-3">The two of you</p>

        <label className="label">Her name</label>
        <div className="mt-1.5 flex gap-2">
          <input
            className="input flex-1"
            defaultValue={state.settings.her.name}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== state.settings.her.name) updatePartnerName("her", v);
            }}
            maxLength={32}
          />
          <input
            className="input w-16 text-center text-xl"
            defaultValue={state.settings.her.emoji}
            onBlur={(e) => {
              const v = e.target.value;
              if (v && v !== state.settings.her.emoji)
                updatePartnerEmoji("her", v);
            }}
            maxLength={4}
          />
        </div>

        <label className="label mt-4 block">His name</label>
        <div className="mt-1.5 flex gap-2">
          <input
            className="input flex-1"
            defaultValue={state.settings.him.name}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== state.settings.him.name) updatePartnerName("him", v);
            }}
            maxLength={32}
          />
          <input
            className="input w-16 text-center text-xl"
            defaultValue={state.settings.him.emoji}
            onBlur={(e) => {
              const v = e.target.value;
              if (v && v !== state.settings.him.emoji)
                updatePartnerEmoji("him", v);
            }}
            maxLength={4}
          />
        </div>

        <label className="label mt-4 block">Together since</label>
        <input
          type="date"
          className="input mt-1.5"
          value={anniversaryValue}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) =>
            setAnniversary(new Date(e.target.value).toISOString())
          }
        />

        <label className="label mt-4 block">Engagement date</label>
        <p className="mt-1 text-xs text-ink-muted">
          Starts the engagement timer on Home. Only editable here.
        </p>
        <input
          type="date"
          className="input mt-1.5"
          value={engagementValue}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => {
            const v = e.target.value;
            setEngagementDate(v ? new Date(v).toISOString() : null);
          }}
        />
        {engagementValue && (
          <button
            type="button"
            onClick={() => setEngagementDate(null)}
            className="mt-2 text-xs font-medium text-rose-700 underline-offset-2 hover:underline"
          >
            Clear engagement date
          </button>
        )}

        <p className="mt-3 text-[11px] text-ink-subtle">
          Changes save automatically when you tap away from a field.
        </p>
      </section>

      <p className="pt-2 text-center text-xs text-ink-subtle">
        Made with <Heart size={11} className="inline text-rose" /> for the two
        of you.
      </p>
    </div>
  );
}
