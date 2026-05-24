"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CalendarHeart,
  Check,
  Clock,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { isPlannedDateUpcoming, plannedDateTime, todayKey } from "@/lib/utils";
import type { DatePlanStatus, PlannedDate } from "@/lib/types";

export function DatePlannerScreen() {
  const { state, partner, addPlannedDate, removePlannedDate, respondToPlannedDate } =
    useStore();
  const [open, setOpen] = useState(false);

  const { needsResponse, upcoming, past } = useMemo(() => {
    const sorted = [...state.plannedDates].sort(
      (a, b) =>
        plannedDateTime(a.dateISO, a.time).getTime() -
        plannedDateTime(b.dateISO, b.time).getTime()
    );
    const isUpcoming = (d: PlannedDate) =>
      isPlannedDateUpcoming(d.dateISO, d.time);

    return {
      needsResponse: sorted.filter(
        (d) =>
          isUpcoming(d) &&
          d.status === "pending" &&
          partner &&
          d.createdBy !== partner
      ),
      upcoming: sorted.filter(
        (d) => isUpcoming(d) && d.status !== "rejected"
      ),
      past: sorted.filter((d) => !isUpcoming(d)).reverse(),
    };
  }, [state.plannedDates, partner]);

  return (
    <div>
      <PageHeader
        title="Date Planner"
        subtitle="What's next for the two of you."
        action={
          <button
            onClick={() => setOpen(true)}
            className="btn-primary !px-4 !py-2.5"
          >
            <Plus size={16} /> Plan
          </button>
        }
      />

      {state.plannedDates.length === 0 ? (
        <EmptyState
          icon={CalendarHeart}
          title="No dates planned yet"
          description="Add your next outing — date, time, and where you're going."
          action={
            <button onClick={() => setOpen(true)} className="btn-primary">
              <Plus size={16} /> Plan a date
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {needsResponse.length > 0 && (
            <DateSection
              title="Needs your response"
              dates={needsResponse}
              onDelete={removePlannedDate}
              highlight
            />
          )}
          <DateSection title="Upcoming" dates={upcoming} onDelete={removePlannedDate} />
          {past.length > 0 && (
            <DateSection title="Past" dates={past} onDelete={removePlannedDate} muted />
          )}
        </div>
      )}

      <AddDateModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async (input) => {
          await addPlannedDate(input);
          setOpen(false);
        }}
      />
    </div>
  );
}

function DateSection({
  title,
  dates,
  onDelete,
  muted,
  highlight,
}: {
  title: string;
  dates: PlannedDate[];
  onDelete: (id: string) => Promise<void>;
  muted?: boolean;
  highlight?: boolean;
}) {
  const { state, partner, respondToPlannedDate } = useStore();

  if (dates.length === 0) {
    return (
      <section>
        <p className="stat-label mb-2">{title}</p>
        <p className="text-sm text-ink-muted">Nothing here yet.</p>
      </section>
    );
  }

  return (
    <section>
      <p className="stat-label mb-2">
        {title} · {dates.length}
      </p>
      <ul className="space-y-3">
        {dates.map((d) => {
          const creator =
            d.createdBy === "her" ? state.settings.her : state.settings.him;
          const responder =
            d.respondedBy === "her"
              ? state.settings.her
              : d.respondedBy === "him"
                ? state.settings.him
                : null;
          const otherPartner =
            partner === "her" ? state.settings.him : state.settings.her;
          const canRespond =
            d.status === "pending" &&
            partner &&
            d.createdBy !== partner;

          return (
            <li
              key={d.id}
              className={
                "card p-4 " +
                (muted ? "opacity-75" : "") +
                (highlight ? " ring-2 ring-rose/30" : "")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-ink">{d.title}</p>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-ink-soft">
                      <CalendarHeart size={14} className="shrink-0 text-rose" />
                      {format(new Date(d.dateISO), "EEE, MMM d, yyyy")}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-ink-soft">
                      <Clock size={14} className="shrink-0 text-rose" />
                      {formatTime12h(d.time)}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-ink-soft">
                      <MapPin size={14} className="shrink-0 text-rose" />
                      {d.location}
                    </p>
                  </div>
                  {d.notes && (
                    <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-ink-soft">
                      {d.notes}
                    </p>
                  )}
                  {d.status === "rejected" && d.responseReason && (
                    <p className="mt-2 rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-xs text-ink-soft">
                      <span className="font-medium text-ink">
                        {responder?.emoji} {responder?.name} declined:
                      </span>{" "}
                      {d.responseReason}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-ink-subtle">
                    Planned by {creator.emoji} {creator.name}
                    {d.status === "pending" &&
                      partner &&
                      d.createdBy === partner &&
                      ` · Waiting for ${otherPartner.emoji} ${otherPartner.name}`}
                    {d.status === "accepted" &&
                      responder &&
                      ` · Accepted by ${responder.emoji} ${responder.name}`}
                  </p>

                  {canRespond && (
                    <DateResponseActions
                      date={d}
                      onRespond={respondToPlannedDate}
                    />
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (confirm(`Remove "${d.title}"?`)) await onDelete(d.id);
                  }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-subtle hover:bg-rose-50 hover:text-rose"
                  aria-label="Delete planned date"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatusBadge({ status }: { status: DatePlanStatus }) {
  const styles: Record<DatePlanStatus, string> = {
    pending: "bg-amber-50 text-amber-800",
    accepted: "bg-emerald-50 text-emerald-800",
    rejected: "bg-rose-50 text-rose-700",
  };
  const labels: Record<DatePlanStatus, string> = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Declined",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function DateResponseActions({
  date,
  onRespond,
}: {
  date: PlannedDate;
  onRespond: (
    id: string,
    response: "accepted" | "rejected",
    reason?: string
  ) => Promise<void>;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <div className="mt-3 flex gap-2">
        <button
          className="btn-primary !px-3 !py-2 text-sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onRespond(date.id, "accepted");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Check size={14} /> Accept
        </button>
        <button
          className="btn-ghost !px-3 !py-2 text-sm text-rose"
          disabled={busy}
          onClick={() => setRejectOpen(true)}
        >
          <X size={14} /> Decline
        </button>
      </div>

      <RejectDateModal
        open={rejectOpen}
        title={date.title}
        busy={busy}
        onClose={() => setRejectOpen(false)}
        onSubmit={async (reason) => {
          setBusy(true);
          try {
            await onRespond(date.id, "rejected", reason);
            setRejectOpen(false);
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}

function RejectDateModal({
  open,
  title,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");

  const reset = () => setReason("");

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Decline this date?"
    >
      <p className="text-sm text-ink-soft">
        Let them know why you can&apos;t make <strong>{title}</strong>.
      </p>
      <label className="label mt-3 block">Reason</label>
      <textarea
        className="input mt-1.5 min-h-[88px] resize-none"
        placeholder="e.g. I have work that evening…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={240}
      />
      <div className="mt-5 flex gap-2">
        <button
          className="btn-ghost flex-1"
          onClick={() => {
            onClose();
            reset();
          }}
        >
          Cancel
        </button>
        <button
          className="btn-primary flex-1 !bg-rose hover:!bg-rose/90"
          disabled={!reason.trim() || busy}
          onClick={async () => {
            await onSubmit(reason.trim());
            reset();
          }}
        >
          {busy ? "Sending…" : "Decline date"}
        </button>
      </div>
    </Modal>
  );
}

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function AddDateModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    dateISO: string;
    time: string;
    location: string;
    notes?: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [dateISO, setDateISO] = useState(todayKey());
  const [time, setTime] = useState("19:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setTitle("");
    setDateISO(todayKey());
    setTime("19:00");
    setLocation("");
    setNotes("");
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Plan a date"
    >
      <label className="label">What are you doing?</label>
      <input
        className="input mt-1.5"
        placeholder="e.g. Dinner, movie night, walk…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={80}
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input mt-1.5"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Time</label>
          <input
            type="time"
            className="input mt-1.5"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <label className="label mt-3 block">Location</label>
      <input
        className="input mt-1.5"
        placeholder="Where are you going?"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        maxLength={120}
      />

      <label className="label mt-3 block">Notes (optional)</label>
      <textarea
        className="input mt-1.5 min-h-[72px] resize-none"
        placeholder="Reservation name, dress code, anything else…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={240}
      />

      <div className="mt-5 flex gap-2">
        <button
          className="btn-ghost flex-1"
          onClick={() => {
            onClose();
            reset();
          }}
        >
          Cancel
        </button>
        <button
          className="btn-primary flex-1"
          disabled={!title.trim() || !location.trim() || !time || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSubmit({
                title: title.trim(),
                dateISO,
                time,
                location: location.trim(),
                notes: notes.trim() || undefined,
              });
              reset();
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </Modal>
  );
}
