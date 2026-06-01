"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { todayKey } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { MOOD_META } from "./moodMeta";
import type { MoodScore, PartnerKey } from "@/lib/types";
import { format, subDays } from "date-fns";
import { MoodChart } from "./MoodChart";
import { Clock3, Eye } from "lucide-react";

export function MoodScreen() {
  const { state, partner, upsertTodayMood } = useStore();
  const key = todayKey();

  const today = useMemo(() => {
    const her = state.moods.find(
      (m) => m.partner === "her" && m.dateISO === key
    );
    const him = state.moods.find(
      (m) => m.partner === "him" && m.dateISO === key
    );
    return { her, him };
  }, [state.moods, key]);

  const last7 = useMemo(() => {
    const days: Array<{
      dateISO: string;
      label: string;
      her: number | null;
      him: number | null;
    }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const k = todayKey(d);
      const her = state.moods.find(
        (m) => m.partner === "her" && m.dateISO === k
      );
      const him = state.moods.find(
        (m) => m.partner === "him" && m.dateISO === k
      );
      days.push({
        dateISO: k,
        label: format(d, "EEE"),
        her: her?.score ?? null,
        him: him?.score ?? null,
      });
    }
    return days;
  }, [state.moods]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mood"
        subtitle="A 30-second check-in. Just be honest."
      />

      <PartnerCard
        who="her"
        currentUser={partner}
        name={state.settings.her.name}
        emoji={state.settings.her.emoji}
        currentScore={today.her?.score}
        currentNote={today.her?.note}
        currentCreatedISO={today.her?.createdISO}
        onSave={(score, note) => upsertTodayMood(score, note)}
      />
      <PartnerCard
        who="him"
        currentUser={partner}
        name={state.settings.him.name}
        emoji={state.settings.him.emoji}
        currentScore={today.him?.score}
        currentNote={today.him?.note}
        currentCreatedISO={today.him?.createdISO}
        onSave={(score, note) => upsertTodayMood(score, note)}
      />

      <section className="card p-4">
        <p className="stat-label mb-2">Last 7 days</p>
        <MoodChart
          data={last7}
          herName={state.settings.her.name}
          himName={state.settings.him.name}
        />
      </section>
    </div>
  );
}

function MoodNoteModal({
  open,
  onClose,
  name,
  emoji,
  note,
  loggedAt,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  emoji: string;
  note?: string;
  loggedAt?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Mood note">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-ink">
            <span className="mr-1.5">{emoji}</span>
            {name}
          </p>
          {loggedAt && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
              <Clock3 size={13} />
              Logged {loggedAt}
            </p>
          )}
        </div>
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-ink-soft">
          {note || "No note added."}
        </p>
      </div>
    </Modal>
  );
}

function formatLoggedAt(
  iso: string | undefined,
  variant: "short" | "long"
) {
  if (!iso) return undefined;
  const loggedAt = new Date(iso);
  if (Number.isNaN(loggedAt.getTime())) return undefined;

  return format(
    loggedAt,
    variant === "short" ? "h:mm a" : "MMM d, yyyy 'at' h:mm a"
  );
}

function PartnerCard({
  who,
  currentUser,
  name,
  emoji,
  currentScore,
  currentNote,
  currentCreatedISO,
  onSave,
}: {
  who: PartnerKey;
  currentUser: PartnerKey | null;
  name: string;
  emoji: string;
  currentScore?: MoodScore;
  currentNote?: string;
  currentCreatedISO?: string;
  onSave: (score: MoodScore, note?: string) => Promise<void>;
}) {
  const isMe = currentUser === who;
  const [score, setScore] = useState<MoodScore | undefined>(currentScore);
  const [note, setNote] = useState(currentNote ?? "");
  const [noteOpen, setNoteOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const loggedLabel = formatLoggedAt(currentCreatedISO, "short");
  const loggedFull = formatLoggedAt(currentCreatedISO, "long");

  useEffect(() => {
    setScore(currentScore);
    setNote(currentNote ?? "");
  }, [currentScore, currentNote]);

  // Read-only view of the other partner's mood
  if (!isMe) {
    const meta = currentScore
      ? MOOD_META.find((m) => m.score === currentScore)
      : null;
    return (
      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">
            <span className="mr-1.5">{emoji}</span>
            {name}
          </p>
          <span className="text-[11px] font-medium text-ink-muted">
            {currentScore && loggedLabel
              ? `Logged ${loggedLabel}`
              : currentScore
                ? "Today"
                : "Not logged yet"}
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50/60 p-4">
          <span className="text-3xl" aria-hidden>
            {meta?.emoji ?? "·"}
          </span>
          <div className="min-w-0">
            <p className="text-base font-medium text-ink">
              {meta?.label ?? "—"}
            </p>
            {currentNote && (
              <div className="mt-1 space-y-2">
                <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm leading-5 text-ink-muted">
                  "{currentNote}"
                </p>
                <button
                  type="button"
                  onClick={() => setNoteOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700"
                >
                  <Eye size={14} />
                  Read full note
                </button>
              </div>
            )}
          </div>
        </div>
        <MoodNoteModal
          open={noteOpen}
          onClose={() => setNoteOpen(false)}
          name={name}
          emoji={emoji}
          note={currentNote}
          loggedAt={loggedFull}
        />
      </section>
    );
  }

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          <span className="mr-1.5">{emoji}</span>
          {name} <span className="text-ink-subtle font-normal">· you</span>
        </p>
        {currentScore && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
            <Clock3 size={12} />
            {loggedLabel ? `Logged ${loggedLabel}` : "Logged today"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {MOOD_META.map((m) => {
          const active = score === m.score;
          return (
            <button
              key={m.score}
              type="button"
              onClick={() => {
                setScore(m.score as MoodScore);
                setSaved(false);
              }}
              className={
                "flex flex-col items-center gap-1 rounded-2xl border py-3 text-xs transition active:scale-[0.97] " +
                (active
                  ? "border-rose bg-rose-50"
                  : "border-line bg-white hover:bg-rose-50/60")
              }
              aria-label={`${m.label} (${m.score} of 5)`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span
                className={
                  active ? "font-semibold text-rose-700" : "text-ink-muted"
                }
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>

      <textarea
        className="input mt-3"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        maxLength={1000}
        rows={3}
      />

      {currentNote && (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700"
        >
          <Eye size={14} />
          Read saved note
        </button>
      )}

      <button
        className="btn-primary mt-3 w-full"
        disabled={!score || busy}
        onClick={async () => {
          if (!score) return;
          setBusy(true);
          try {
            await onSave(score, note.trim() || undefined);
            setSaved(true);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy
          ? "Saving…"
          : saved
            ? "Saved ✓"
            : currentScore
              ? "Update"
              : "Log mood"}
      </button>
      <MoodNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        name={name}
        emoji={emoji}
        note={currentNote}
        loggedAt={loggedFull}
      />
    </section>
  );
}
