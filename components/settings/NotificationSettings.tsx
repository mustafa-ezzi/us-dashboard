"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push/client";
import { Bell, BellOff, Loader2 } from "lucide-react";

export function NotificationSettings() {
  const { state, updateNotificationPrefs } = useStore();
  const { pushEnabled, dailyReminderTime } = state.notificationPrefs;

  const [reminderTime, setReminderTime] = useState(dailyReminderTime);
  const [busy, setBusy] = useState(false);
  const [savingTime, setSavingTime] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const supported = isPushSupported();
  const timeDirty = reminderTime !== dailyReminderTime;

  useEffect(() => {
    setReminderTime(dailyReminderTime);
  }, [dailyReminderTime]);

  const enable = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const ok = await subscribeToPush();
      if (ok) {
        await updateNotificationPrefs({ pushEnabled: true });
        setMsg("Notifications enabled ✓");
      } else {
        setMsg("Permission denied or not supported.");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not enable notifications.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await unsubscribeFromPush();
      await updateNotificationPrefs({ pushEnabled: false });
      setMsg("Notifications turned off.");
    } catch {
      setMsg("Could not disable notifications.");
    } finally {
      setBusy(false);
    }
  };

  const saveReminderTime = async () => {
    setSavingTime(true);
    setMsg(null);
    try {
      await updateNotificationPrefs({ dailyReminderTime: reminderTime });
      setMsg("Reminder time saved ✓");
    } catch {
      setMsg("Could not save reminder time.");
    } finally {
      setSavingTime(false);
    }
  };

  return (
    <section className="card p-4">
      <p className="stat-label mb-3">Notifications</p>

      {!supported ? (
        <p className="text-sm text-ink-muted">
          Push notifications aren&apos;t supported in this browser. Install the
          app to your home screen (Safari → Share → Add to Home Screen).
        </p>
      ) : (
        <>
          <p className="text-sm text-ink-soft">
            Get a daily mood reminder and an instant alert when your partner plans
            a date.
          </p>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-rose-50 px-3 py-3">
            <div className="flex items-center gap-2">
              {pushEnabled ? (
                <Bell size={18} className="text-rose" />
              ) : (
                <BellOff size={18} className="text-ink-subtle" />
              )}
              <span className="text-sm font-medium text-ink">
                {pushEnabled ? "On" : "Off"}
              </span>
            </div>
            <button
              disabled={busy}
              onClick={pushEnabled ? disable : enable}
              className={
                pushEnabled
                  ? "rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink-soft"
                  : "btn-primary !px-4 !py-2 text-xs"
              }
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : pushEnabled ? (
                "Turn off"
              ) : (
                "Enable"
              )}
            </button>
          </div>

          {pushEnabled && (
            <div className="mt-4">
              <label className="label">Daily mood reminder</label>
              <input
                type="time"
                className="input mt-1.5"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
              <p className="mt-1.5 text-[11px] text-ink-subtle">
                Tap save after picking a time. Uses{" "}
                {Intl.DateTimeFormat().resolvedOptions().timeZone} on the server
                after deploy.
              </p>
              <button
                type="button"
                onClick={saveReminderTime}
                disabled={!timeDirty || savingTime}
                className="btn-primary mt-3 w-full !py-2.5 disabled:opacity-50"
              >
                {savingTime ? "Saving…" : "Save reminder time"}
              </button>
            </div>
          )}

          {msg && <p className="mt-3 text-xs text-rose-700">{msg}</p>}
        </>
      )}
    </section>
  );
}
