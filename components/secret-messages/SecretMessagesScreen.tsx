"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Clock, Lock, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useConfirmDialog } from "@/components/ui/useConfirmDialog";
import { useStore } from "@/lib/store";
import type { SecretMessage } from "@/lib/types";
import { todayKey } from "@/lib/utils";

const moodOptions = [
  "Happy",
  "Missing you",
  "Grateful",
  "Playful",
  "Soft",
  "Heavy",
  "Hopeful",
];

export function SecretMessagesScreen() {
  const { state, partner, addSecretMessage, removeSecretMessage } = useStore();
  const [dateISO, setDateISO] = useState(todayKey());
  const [time, setTime] = useState(currentTime());
  const [mood, setMood] = useState(moodOptions[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const { mine, partnerMessages } = useMemo(() => {
    const sorted = [...state.secretMessages].sort(
      (a, b) => b.dateISO.localeCompare(a.dateISO) || b.time.localeCompare(a.time)
    );
    return {
      mine: sorted.filter((message) => message.createdBy === partner),
      partnerMessages: sorted.filter((message) => message.createdBy !== partner),
    };
  }, [partner, state.secretMessages]);

  const reset = () => {
    setDateISO(todayKey());
    setTime(currentTime());
    setMood(moodOptions[0]);
    setNote("");
  };

  return (
    <div>
      <PageHeader
        title="Secret Messages"
        subtitle="Notes that unlock on the first day of the next month."
      />

      <section className="card p-4">
        <div className="mb-3 flex items-center gap-2 text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-100 text-rose">
            <Send size={17} />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Write a secret note</h3>
            <p className="text-xs text-ink-muted">
              Your partner can read it from {unlockLabel(dateISO, "MMM d, yyyy")}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input mt-1.5"
              value={dateISO}
              onChange={(event) => setDateISO(event.target.value)}
            />
          </div>
          <div>
            <label className="label">Time</label>
            <input
              type="time"
              className="input mt-1.5"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
        </div>

        <label className="label mt-3 block">Mood</label>
        <select
          className="input mt-1.5"
          value={mood}
          onChange={(event) => setMood(event.target.value)}
        >
          {moodOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="label mt-3 block">Note</label>
        <textarea
          className="input mt-1.5 min-h-[132px] resize-none"
          placeholder="Write what only future-them should read..."
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={1200}
        />

        <div className="mt-4 flex gap-2">
          <button className="btn-ghost flex-1" onClick={reset} disabled={busy}>
            Reset
          </button>
          <button
            className="btn-primary flex-1"
            disabled={!note.trim() || !dateISO || !time || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await addSecretMessage({
                  dateISO,
                  time,
                  mood,
                  note: note.trim(),
                });
                reset();
              } finally {
                setBusy(false);
              }
            }}
          >
            <Plus size={16} />
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        {partnerMessages.length > 0 && (
          <MessageSection
            title="Unlocked for you"
            messages={partnerMessages}
            onDelete={removeSecretMessage}
          />
        )}

        {mine.length > 0 ? (
          <MessageSection
            title="Your secret notes"
            messages={mine}
            onDelete={removeSecretMessage}
            showUnlock
          />
        ) : (
          <EmptyState
            icon={Lock}
            title="No secret notes yet"
            description="Write something today and it will unlock for your partner next month."
          />
        )}
      </div>
    </div>
  );
}

function MessageSection({
  title,
  messages,
  onDelete,
  showUnlock,
}: {
  title: string;
  messages: SecretMessage[];
  onDelete: (id: string) => Promise<void>;
  showUnlock?: boolean;
}) {
  const { state, partner } = useStore();
  const { askConfirm, ConfirmDialog } = useConfirmDialog();

  return (
    <section>
      <p className="stat-label mb-2">
        {title} · {messages.length}
      </p>
      <ul className="space-y-3">
        {messages.map((message) => {
          const creator = state.settings[message.createdBy];
          const canDelete = message.createdBy === partner;

          return (
            <li key={message.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip !bg-rose-50">
                      <Sparkles size={12} />
                      {message.mood}
                    </span>
                    {showUnlock && (
                      <span className="chip !bg-amber-50 !text-amber-800">
                        <Lock size={12} />
                        Unlocks {unlockLabel(message.dateISO, "MMM d")}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">
                    {message.note}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={13} className="text-rose" />
                      {format(new Date(message.dateISO), "MMM d, yyyy")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} className="text-rose" />
                      {formatTime12h(message.time)}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-ink-subtle">
                    Written by {creator.emoji} {creator.name}
                  </p>
                </div>

                {canDelete && (
                  <button
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-subtle hover:bg-rose-50 hover:text-rose"
                    aria-label="Delete secret message"
                    onClick={async () => {
                      const ok = await askConfirm({
                        title: "Delete this secret note?",
                        message: "This note will be removed for both of you.",
                        confirmLabel: "Delete",
                        variant: "danger",
                      });
                      if (ok) await onDelete(message.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <ConfirmDialog />
    </section>
  );
}

function unlockDate(dateISO: string): Date {
  const [year, month] = dateISO.split("-").map(Number);
  return new Date(year, month, 1);
}

function unlockLabel(dateISO: string, pattern: string): string {
  if (!dateISO) return "next month";
  const date = unlockDate(dateISO);
  return Number.isNaN(date.getTime()) ? "next month" : format(date, pattern);
}

function currentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
}

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
