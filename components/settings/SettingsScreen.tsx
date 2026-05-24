"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Heart, LogOut, RefreshCw } from "lucide-react";
import { todayKey } from "@/lib/utils";

interface CoupleDraft {
  herName: string;
  herEmoji: string;
  himName: string;
  himEmoji: string;
  anniversary: string;
  engagement: string;
}

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
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [draft, setDraft] = useState<CoupleDraft>(() => ({
    herName: state.settings.her.name,
    herEmoji: state.settings.her.emoji,
    himName: state.settings.him.name,
    himEmoji: state.settings.him.emoji,
    anniversary: state.settings.anniversaryISO.slice(0, 10),
    engagement: state.settings.engagementISO?.slice(0, 10) ?? "",
  }));

  useEffect(() => {
    setDraft({
      herName: state.settings.her.name,
      herEmoji: state.settings.her.emoji,
      himName: state.settings.him.name,
      himEmoji: state.settings.him.emoji,
      anniversary: state.settings.anniversaryISO.slice(0, 10),
      engagement: state.settings.engagementISO?.slice(0, 10) ?? "",
    });
  }, [state.settings]);

  const meName =
    partner === "her" ? state.settings.her.name : state.settings.him.name;
  const meEmoji =
    partner === "her" ? state.settings.her.emoji : state.settings.him.emoji;

  const isDirty =
    draft.herName !== state.settings.her.name ||
    draft.herEmoji !== state.settings.her.emoji ||
    draft.himName !== state.settings.him.name ||
    draft.himEmoji !== state.settings.him.emoji ||
    draft.anniversary !== state.settings.anniversaryISO.slice(0, 10) ||
    draft.engagement !== (state.settings.engagementISO?.slice(0, 10) ?? "");

  const saveCoupleSettings = async () => {
    setSaving(true);
    setMsg(null);
    try {
      if (draft.herName.trim() && draft.herName !== state.settings.her.name) {
        await updatePartnerName("her", draft.herName.trim());
      }
      if (draft.himName.trim() && draft.himName !== state.settings.him.name) {
        await updatePartnerName("him", draft.himName.trim());
      }
      if (draft.herEmoji !== state.settings.her.emoji) {
        await updatePartnerEmoji("her", draft.herEmoji);
      }
      if (draft.himEmoji !== state.settings.him.emoji) {
        await updatePartnerEmoji("him", draft.himEmoji);
      }
      if (draft.anniversary !== state.settings.anniversaryISO.slice(0, 10)) {
        await setAnniversary(new Date(draft.anniversary).toISOString());
      }
      const currentEngagement =
        state.settings.engagementISO?.slice(0, 10) ?? "";
      if (draft.engagement !== currentEngagement) {
        await setEngagementDate(
          draft.engagement
            ? new Date(draft.engagement).toISOString()
            : null
        );
      }
      setMsg("Settings saved ✓");
    } catch {
      setMsg("Could not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

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
            value={draft.herName}
            onChange={(e) =>
              setDraft((d) => ({ ...d, herName: e.target.value }))
            }
            maxLength={32}
          />
          <input
            className="input w-16 text-center text-xl"
            value={draft.herEmoji}
            onChange={(e) =>
              setDraft((d) => ({ ...d, herEmoji: e.target.value }))
            }
            maxLength={4}
          />
        </div>

        <label className="label mt-4 block">His name</label>
        <div className="mt-1.5 flex gap-2">
          <input
            className="input flex-1"
            value={draft.himName}
            onChange={(e) =>
              setDraft((d) => ({ ...d, himName: e.target.value }))
            }
            maxLength={32}
          />
          <input
            className="input w-16 text-center text-xl"
            value={draft.himEmoji}
            onChange={(e) =>
              setDraft((d) => ({ ...d, himEmoji: e.target.value }))
            }
            maxLength={4}
          />
        </div>

        <label className="label mt-4 block">Together since</label>
        <input
          type="date"
          className="input mt-1.5"
          value={draft.anniversary}
          max={todayKey()}
          onChange={(e) =>
            setDraft((d) => ({ ...d, anniversary: e.target.value }))
          }
        />

        <label className="label mt-4 block">Planned engagement date</label>
        <p className="mt-1 text-xs text-ink-muted">
          The countdown on Home ticks down to this day. You&apos;re not engaged
          yet — pick a future date.
        </p>
        <input
          type="date"
          className="input mt-1.5"
          value={draft.engagement}
          min={todayKey()}
          onChange={(e) =>
            setDraft((d) => ({ ...d, engagement: e.target.value }))
          }
        />
        {draft.engagement && (
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, engagement: "" }))}
            className="mt-2 text-xs font-medium text-rose-700 underline-offset-2 hover:underline"
          >
            Clear engagement date
          </button>
        )}

        <button
          type="button"
          onClick={saveCoupleSettings}
          disabled={!isDirty || saving}
          className="btn-primary mt-5 w-full disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>

        {msg && <p className="mt-3 text-xs text-rose-700">{msg}</p>}
      </section>

      <p className="pt-2 text-center text-xs text-ink-subtle">
        Made with <Heart size={11} className="inline text-rose" /> for the two
        of you.
      </p>
    </div>
  );
}
