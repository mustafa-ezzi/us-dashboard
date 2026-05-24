"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { PartnerKey, RuleStatus } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { useConfirmDialog } from "@/components/ui/useConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CheckCircle2,
  CircleDashed,
  AlertTriangle,
  Plus,
  ScrollText,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_META: Record<
  RuleStatus,
  { label: string; cls: string; icon: typeof CheckCircle2 }
> = {
  Active: {
    label: "Active",
    cls: "bg-rose-100 text-rose-700",
    icon: CheckCircle2,
  },
  "Under Review": {
    label: "Under Review",
    cls: "bg-amber-50 text-amber-700",
    icon: CircleDashed,
  },
  Retired: {
    label: "Retired",
    cls: "bg-gray-100 text-gray-600",
    icon: AlertTriangle,
  },
};

export function ContractScreen() {
  const {
    state,
    partner,
    addRule,
    setRuleStatus,
    removeRule,
    addViolation,
    removeViolation,
  } = useStore();

  const [openRule, setOpenRule] = useState(false);
  const [openViolation, setOpenViolation] = useState<string | null>(null);
  const { askConfirm, ConfirmDialog } = useConfirmDialog();

  const rulesByStatus = useMemo(() => {
    const groups: Record<RuleStatus, typeof state.rules> = {
      Active: [],
      "Under Review": [],
      Retired: [],
    };
    for (const r of state.rules) groups[r.status].push(r);
    return groups;
  }, [state.rules]);

  const violationCount = (ruleId: string) =>
    state.violations.filter((v) => v.ruleId === ruleId).length;

  const lastViolation = (ruleId: string) =>
    state.violations.find((v) => v.ruleId === ruleId);

  return (
    <div>
      <PageHeader
        title="Couple Contract"
        subtitle="Rules you both signed off on."
        action={
          <button
            onClick={() => setOpenRule(true)}
            className="btn-primary !px-4 !py-2.5"
          >
            <Plus size={16} /> Rule
          </button>
        }
      />

      {state.rules.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No rules yet"
          description="Propose the first one. The other can accept, counter, or retire it later."
          action={
            <button onClick={() => setOpenRule(true)} className="btn-primary">
              <Plus size={16} /> Add a rule
            </button>
          }
        />
      ) : (
        <div className="space-y-5">
          {(["Active", "Under Review", "Retired"] as RuleStatus[]).map(
            (status) => {
              const list = rulesByStatus[status];
              if (list.length === 0) return null;
              return (
                <section key={status}>
                  <p className="stat-label mb-2">
                    {status} · {list.length}
                  </p>
                  <ul className="space-y-3">
                    {list.map((r) => {
                      const meta = STATUS_META[r.status];
                      const Icon = meta.icon;
                      const proposer =
                        r.proposedBy === "her"
                          ? state.settings.her
                          : state.settings.him;
                      const vCount = violationCount(r.id);
                      const lv = lastViolation(r.id);
                      return (
                        <li key={r.id} className="card p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span
                                  className={
                                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium " +
                                    meta.cls
                                  }
                                >
                                  <Icon size={12} /> {meta.label}
                                </span>
                                <span className="text-[11px] text-ink-subtle">
                                  by {proposer.emoji} {proposer.name}
                                </span>
                              </div>
                              <p className="text-[15px] font-semibold text-ink">
                                {r.title}
                              </p>
                              {r.description && (
                                <p className="mt-1 text-sm text-ink-soft">
                                  {r.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                const ok = await askConfirm({
                                  title: "Delete this rule?",
                                  message: (
                                    <>
                                      <strong className="text-ink">{r.title}</strong>{" "}
                                      and all of its violations will be removed. This
                                      can&apos;t be undone.
                                    </>
                                  ),
                                  confirmLabel: "Delete rule",
                                  variant: "danger",
                                });
                                if (ok) await removeRule(r.id);
                              }}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-subtle hover:bg-rose-50 hover:text-rose"
                              aria-label="Delete rule"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2">
                            <div className="text-xs text-ink-soft">
                              <span className="font-semibold text-rose-700">
                                {vCount}
                              </span>{" "}
                              violations
                              {lv && (
                                <>
                                  {" "}
                                  · last{" "}
                                  {formatDistanceToNow(new Date(lv.createdISO), {
                                    addSuffix: true,
                                  })}
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => setOpenViolation(r.id)}
                              className="text-xs font-semibold text-rose-700 underline-offset-2 hover:underline"
                            >
                              + Log violation
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {(["Active", "Under Review", "Retired"] as RuleStatus[])
                              .filter((s) => s !== r.status)
                              .map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setRuleStatus(r.id, s)}
                                  className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-medium text-ink-soft hover:bg-rose-50"
                                >
                                  Move to {s}
                                </button>
                              ))}
                          </div>

                          {vCount > 0 && (
                            <ViolationsList
                              ruleId={r.id}
                              onDelete={removeViolation}
                              askConfirm={askConfirm}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            }
          )}
        </div>
      )}

      <AddRuleModal
        open={openRule}
        onClose={() => setOpenRule(false)}
        onSubmit={async (input) => {
          await addRule(input);
          setOpenRule(false);
        }}
      />

      <AddViolationModal
        ruleId={openViolation}
        defaultViolator={partner === "her" ? "him" : "her"}
        onClose={() => setOpenViolation(null)}
        onSubmit={async (input) => {
          await addViolation(input);
          setOpenViolation(null);
        }}
      />

      <ConfirmDialog />
    </div>
  );
}

function ViolationsList({
  ruleId,
  onDelete,
  askConfirm,
}: {
  ruleId: string;
  onDelete: (id: string) => Promise<void>;
  askConfirm: ReturnType<typeof useConfirmDialog>["askConfirm"];
}) {
  const { state } = useStore();
  const list = state.violations.filter((v) => v.ruleId === ruleId).slice(0, 5);

  if (list.length === 0) return null;

  return (
    <ul className="mt-3 space-y-1.5">
      {list.map((v) => {
        const who =
          v.violator === "her" ? state.settings.her : state.settings.him;
        return (
          <li
            key={v.id}
            className="flex items-start justify-between gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs"
          >
            <div className="min-w-0 flex-1">
              <p className="text-ink-soft">
                <span className="font-semibold text-ink">
                  {who.emoji} {who.name}
                </span>
                {v.note ? ` — ${v.note}` : ""}
              </p>
              <p className="text-[10px] text-ink-subtle">
                {formatDistanceToNow(new Date(v.createdISO), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <button
              onClick={async () => {
                const ok = await askConfirm({
                  title: "Remove this violation?",
                  message: (
                    <>
                      This violation log for{" "}
                      <strong className="text-ink">
                        {who.emoji} {who.name}
                      </strong>{" "}
                      will be deleted.
                    </>
                  ),
                  confirmLabel: "Remove",
                  variant: "danger",
                });
                if (ok) await onDelete(v.id);
              }}
              className="text-ink-subtle hover:text-rose"
              aria-label="Delete violation"
            >
              <Trash2 size={12} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function AddRuleModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    description?: string;
    status?: RuleStatus;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RuleStatus>("Under Review");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setStatus("Under Review");
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Propose a rule"
    >
      <label className="label">Rule</label>
      <input
        className="input mt-1.5"
        placeholder="e.g. Reply within 1 hour during the day"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
      />

      <label className="label mt-3 block">Why this rule? (optional)</label>
      <textarea
        className="input mt-1.5 min-h-[72px] resize-none"
        placeholder="Context that future-you will thank you for…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={400}
      />

      <label className="label mt-3 block">Start as</label>
      <select
        className="input mt-1.5"
        value={status}
        onChange={(e) => setStatus(e.target.value as RuleStatus)}
      >
        <option value="Under Review">Under Review</option>
        <option value="Active">Active</option>
        <option value="Retired">Retired</option>
      </select>

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
          disabled={!title.trim() || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSubmit({
                title: title.trim(),
                description: description.trim() || undefined,
                status,
              });
              reset();
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Propose"}
        </button>
      </div>
    </Modal>
  );
}

function AddViolationModal({
  ruleId,
  defaultViolator,
  onClose,
  onSubmit,
}: {
  ruleId: string | null;
  defaultViolator: PartnerKey;
  onClose: () => void;
  onSubmit: (input: {
    ruleId: string;
    violator: PartnerKey;
    note?: string;
  }) => Promise<void>;
}) {
  const { state } = useStore();
  const [violator, setViolator] = useState<PartnerKey>(defaultViolator);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const open = !!ruleId;
  const rule = state.rules.find((r) => r.id === ruleId);

  const reset = () => {
    setViolator(defaultViolator);
    setNote("");
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title={rule ? `Violation: ${rule.title}` : "Log violation"}
    >
      <label className="label">Who broke it?</label>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setViolator("her")}
          className={
            "rounded-xl border px-2 py-3 text-sm transition " +
            (violator === "her"
              ? "border-rose bg-rose-50 text-rose-700 font-semibold"
              : "border-line bg-white text-ink-soft")
          }
        >
          {state.settings.her.emoji} {state.settings.her.name}
        </button>
        <button
          type="button"
          onClick={() => setViolator("him")}
          className={
            "rounded-xl border px-2 py-3 text-sm transition " +
            (violator === "him"
              ? "border-rose bg-rose-50 text-rose-700 font-semibold"
              : "border-line bg-white text-ink-soft")
          }
        >
          {state.settings.him.emoji} {state.settings.him.name}
        </button>
      </div>

      <label className="label mt-3 block">Note (optional)</label>
      <textarea
        className="input mt-1.5 min-h-[80px] resize-none"
        placeholder="What happened?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
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
          disabled={busy}
          onClick={async () => {
            if (!ruleId) return;
            setBusy(true);
            try {
              await onSubmit({
                ruleId,
                violator,
                note: note.trim() || undefined,
              });
              reset();
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Log it"}
        </button>
      </div>
    </Modal>
  );
}
