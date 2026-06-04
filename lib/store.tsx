"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, hasSupabaseConfig } from "./supabase/client";
import { notifyPartnerDatePlanned, notifyPartnerDateResponse } from "./push/client";
import {
  type AppState,
  type DatePlanStatus,
  type MoodScore,
  type PartnerKey,
  type RuleStatus,
} from "./types";
import { todayKey } from "./utils";
import { getDeviceTimezone } from "./reminder-time";

// ---------- Row shapes (kept here so the store stays self-contained) ----------
interface CoupleRow {
  id: string;
  anniversary: string;
  engagement_date: string | null;
  her_name: string;
  her_emoji: string;
  him_name: string;
  him_emoji: string;
}
interface MemberRow {
  user_id: string;
  couple_id: string;
  partner: PartnerKey;
  push_enabled: boolean;
  daily_reminder_time: string;
  reminder_timezone: string;
}
interface PlannedDateRow {
  id: string;
  title: string;
  date_iso: string;
  time: string;
  location: string;
  created_by: PartnerKey;
  notes: string | null;
  status: DatePlanStatus;
  response_reason: string | null;
  responded_by: PartnerKey | null;
  responded_at: string | null;
  created_at: string;
}

function mapPlannedDateRow(d: PlannedDateRow) {
  return {
    id: d.id,
    title: d.title,
    dateISO: d.date_iso,
    time: d.time,
    location: d.location,
    createdBy: d.created_by,
    status: d.status ?? "pending",
    responseReason: d.response_reason ?? undefined,
    respondedBy: d.responded_by ?? undefined,
    respondedAtISO: d.responded_at ?? undefined,
    notes: d.notes ?? undefined,
    createdISO: d.created_at,
  };
}
interface MoodRow {
  id: string;
  partner: PartnerKey;
  date_iso: string;
  score: number;
  note: string | null;
  created_at: string;
}
interface RuleRow {
  id: string;
  title: string;
  description: string | null;
  proposed_by: PartnerKey;
  status: RuleStatus;
  created_at: string;
}
interface ViolationRow {
  id: string;
  rule_id: string;
  violator: PartnerKey;
  note: string | null;
  created_at: string;
}
interface ApologyRow {
  id: string;
  apologizer: PartnerKey;
  note: string | null;
  created_at: string;
}
interface ImmaturityRow {
  id: string;
  note: string | null;
  created_at: string;
}
interface KindActRow {
  id: string;
  by_partner: PartnerKey;
  text: string;
  created_at: string;
}
interface MemoryRow {
  id: string;
  text: string;
  image_url: string | null;
  tags: string[];
  memory_date: string;
  created_at: string;
}

type AuthStatus = "loading" | "no-config" | "signed-out" | "signed-in";

interface StoreValue {
  authStatus: AuthStatus;
  user: User | null;
  partner: PartnerKey | null; // who am I?
  ready: boolean; // data loaded for the signed-in user
  state: AppState;
  // auth
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // settings
  updatePartnerName: (key: PartnerKey, name: string) => Promise<void>;
  updatePartnerEmoji: (key: PartnerKey, emoji: string) => Promise<void>;
  setAnniversary: (iso: string) => Promise<void>;
  setEngagementDate: (iso: string | null) => Promise<void>;
  updateNotificationPrefs: (patch: {
    pushEnabled?: boolean;
    dailyReminderTime?: string;
  }) => Promise<void>;
  // date planner
  addPlannedDate: (input: {
    title: string;
    dateISO: string;
    time: string;
    location: string;
    notes?: string;
  }) => Promise<void>;
  removePlannedDate: (id: string) => Promise<void>;
  respondToPlannedDate: (
    id: string,
    response: "accepted" | "rejected",
    reason?: string
  ) => Promise<void>;
  // moods
  upsertTodayMood: (score: MoodScore, note?: string) => Promise<void>;
  // contract
  addRule: (input: {
    title: string;
    description?: string;
    status?: RuleStatus;
  }) => Promise<void>;
  setRuleStatus: (id: string, status: RuleStatus) => Promise<void>;
  removeRule: (id: string) => Promise<void>;
  addViolation: (input: {
    ruleId: string;
    violator: PartnerKey;
    note?: string;
  }) => Promise<void>;
  removeViolation: (id: string) => Promise<void>;
  // stats (apologizer / kind-act-by are auto-set to current partner)
  logApology: (note?: string) => Promise<void>;
  removeApology: (id: string) => Promise<void>;
  logImmaturity: (note?: string) => Promise<void>;
  removeImmaturity: (id: string) => Promise<void>;
  logKindAct: (text: string, by?: PartnerKey) => Promise<void>;
  // memories
  addMemory: (input: {
    text: string;
    memoryDateISO: string;
    tags: string[];
    imageFile?: File;
  }) => Promise<void>;
  removeMemory: (id: string) => Promise<void>;
  // util
  refresh: () => Promise<void>;
}

const emptyState: AppState = {
  settings: {
    anniversaryISO: new Date().toISOString(),
    engagementISO: null,
    her: { key: "her", name: "Her", emoji: "🌷" },
    him: { key: "him", name: "Him", emoji: "🐻" },
  },
  notificationPrefs: {
    pushEnabled: false,
    dailyReminderTime: "20:00",
    reminderTimezone: "Asia/Karachi",
  },
  plannedDates: [],
  moods: [],
  rules: [],
  violations: [],
  apologies: [],
  immaturity: [],
  kindActs: [],
  memories: [],
  weeklyHealthScores: [],
  reports: [],
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const configured = hasSupabaseConfig();

  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    configured ? "loading" : "no-config"
  );
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<PartnerKey | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);

  const fetchAllRef = useRef<(opts?: { silent?: boolean }) => Promise<void>>(
    async () => { }
  );

  // ---------- Auth bootstrap ----------
  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      applySession(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      applySession(session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };

    function applySession(session: Session | null) {
      if (session?.user) {
        setUser(session.user);
        setAuthStatus("signed-in");
      } else {
        setUser(null);
        setPartner(null);
        setCoupleId(null);
        setState(emptyState);
        setReady(false);
        setAuthStatus("signed-out");
      }
    }
  }, [configured]);

  // ---------- Load couple + data after sign-in ----------
  const fetchAll = useCallback(async (opts?: { silent?: boolean }) => {
    if (!configured || !user) return;
    const supabase = getSupabase();
    if (!opts?.silent) setReady(false);

    const memberRes = await supabase
      .from("couple_members")
      .select(
        "couple_id, partner, push_enabled, daily_reminder_time, reminder_timezone"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const member = memberRes.data as MemberRow | null;
    if (memberRes.error || !member) {
      setReady(true);
      return;
    }

    setCoupleId(member.couple_id);
    setPartner(member.partner);

    const notificationPrefs = {
      pushEnabled: member.push_enabled ?? false,
      dailyReminderTime: (member.daily_reminder_time ?? "20:00").slice(0, 5),
      reminderTimezone: member.reminder_timezone ?? "Asia/Karachi",
    };

    const cid = member.couple_id;
    const [
      coupleRes,
      plannedDatesRes,
      moodsRes,
      rulesRes,
      violationsRes,
      apologiesRes,
      immaturityRes,
      kindActsRes,
      memoriesRes,
    ] = await Promise.all([
      supabase.from("couples").select("*").eq("id", cid).single(),
      supabase
        .from("planned_dates")
        .select("*")
        .eq("couple_id", cid)
        .order("date_iso", { ascending: true })
        .order("time", { ascending: true }),
      supabase.from("moods").select("*").eq("couple_id", cid),
      supabase
        .from("rules")
        .select("*")
        .eq("couple_id", cid)
        .order("created_at", { ascending: false }),
      supabase
        .from("violations")
        .select("*")
        .eq("couple_id", cid)
        .order("created_at", { ascending: false }),
      supabase
        .from("apologies")
        .select("*")
        .eq("couple_id", cid)
        .order("created_at", { ascending: false }),
      supabase
        .from("immaturity")
        .select("*")
        .eq("couple_id", cid)
        .order("created_at", { ascending: false }),
      supabase
        .from("kind_acts")
        .select("*")
        .eq("couple_id", cid)
        .order("created_at", { ascending: false }),
      supabase
        .from("memories")
        .select("*")
        .eq("couple_id", cid)
        .order("memory_date", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

    const couple = coupleRes.data as CoupleRow | null;
    setState({
      settings: {
        anniversaryISO: couple
          ? new Date(couple.anniversary).toISOString()
          : new Date().toISOString(),
        engagementISO: couple?.engagement_date
          ? new Date(couple.engagement_date).toISOString()
          : null,
        her: {
          key: "her",
          name: couple?.her_name ?? "Her",
          emoji: couple?.her_emoji ?? "🌷",
        },
        him: {
          key: "him",
          name: couple?.him_name ?? "Him",
          emoji: couple?.him_emoji ?? "🐻",
        },
      },
      notificationPrefs,
      plannedDates: ((plannedDatesRes.data ?? []) as PlannedDateRow[]).map(
        mapPlannedDateRow
      ),
      moods: ((moodsRes.data ?? []) as MoodRow[]).map((m) => ({
        id: m.id,
        partner: m.partner,
        dateISO: m.date_iso,
        score: m.score as MoodScore,
        note: m.note ?? undefined,
        createdISO: m.created_at,
      })),
      rules: ((rulesRes.data ?? []) as RuleRow[]).map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description ?? undefined,
        proposedBy: r.proposed_by,
        status: r.status,
        createdISO: r.created_at,
      })),
      violations: ((violationsRes.data ?? []) as ViolationRow[]).map((v) => ({
        id: v.id,
        ruleId: v.rule_id,
        violator: v.violator,
        note: v.note ?? undefined,
        createdISO: v.created_at,
      })),
      apologies: ((apologiesRes.data ?? []) as ApologyRow[]).map((a) => ({
        id: a.id,
        apologizer: a.apologizer,
        note: a.note ?? undefined,
        createdISO: a.created_at,
      })),
      immaturity: ((immaturityRes.data ?? []) as ImmaturityRow[]).map((i) => ({
        id: i.id,
        note: i.note ?? undefined,
        createdISO: i.created_at,
      })),
      kindActs: ((kindActsRes.data ?? []) as KindActRow[]).map((k) => ({
        id: k.id,
        by: k.by_partner,
        text: k.text,
        createdISO: k.created_at,
      })),
      memories: ((memoriesRes.data ?? []) as MemoryRow[]).map((m) => ({
        id: m.id,
        text: m.text,
        imageUrl: m.image_url ?? undefined,
        tags: (m.tags ?? []) as any,
        memoryDateISO: m.memory_date,
        createdISO: m.created_at,
      })),
      weeklyHealthScores: [],
      reports: [],
    });

    setReady(true);
  }, [configured, user]);

  fetchAllRef.current = fetchAll;

  useEffect(() => {
    if (authStatus === "signed-in") {
      fetchAll();
    }
  }, [authStatus, fetchAll]);

  // Silent background refresh when returning to the tab — no full-screen loader.
  useEffect(() => {
    if (authStatus !== "signed-in") return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fetchAllRef.current({ silent: true });
      }, 400);
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "signed-in" || !coupleId) return;

    const sb = getSupabase();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refreshSoon = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fetchAllRef.current({ silent: true });
      }, 350);
    };

    const channel = sb
      .channel(`couple-updates-${coupleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "planned_dates",
          filter: `couple_id=eq.${coupleId}`,
        },
        refreshSoon
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "moods",
          filter: `couple_id=eq.${coupleId}`,
        },
        refreshSoon
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rules",
          filter: `couple_id=eq.${coupleId}`,
        },
        refreshSoon
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "violations",
          filter: `couple_id=eq.${coupleId}`,
        },
        refreshSoon
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "apologies",
          filter: `couple_id=eq.${coupleId}`,
        },
        refreshSoon
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "immaturity",
          filter: `couple_id=eq.${coupleId}`,
        },
        refreshSoon
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kind_acts",
          filter: `couple_id=eq.${coupleId}`,
        },
        refreshSoon
      )
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void sb.removeChannel(channel);
    };
  }, [authStatus, coupleId]);

  // ---------- Mutations ----------
  const supabaseRequired = useCallback(() => {
    if (!coupleId) throw new Error("Not signed in to a couple yet.");
    return getSupabase();
  }, [coupleId]);

  const me = (): PartnerKey => {
    if (!partner) throw new Error("No partner key for current user.");
    return partner;
  };

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      if (!configured) {
        return { error: "Supabase is not configured. Check .env.local." };
      }
      const { error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? error.message : null };
    },
    [configured]
  );

  const signOut = useCallback(async () => {
    if (!configured) return;
    await getSupabase().auth.signOut();
  }, [configured]);

  const updatePartnerName = useCallback(
    async (key: PartnerKey, name: string) => {
      const sb = supabaseRequired();
      const patch =
        key === "her" ? { her_name: name } : { him_name: name };
      await sb.from("couples").update(patch).eq("id", coupleId!);
      setState((s) => ({
        ...s,
        settings: {
          ...s.settings,
          [key]: { ...s.settings[key], name },
        },
      }));
    },
    [coupleId, supabaseRequired]
  );

  const updatePartnerEmoji = useCallback(
    async (key: PartnerKey, emoji: string) => {
      const sb = supabaseRequired();
      const safe = emoji.trim() || (key === "her" ? "🌷" : "🐻");
      const patch =
        key === "her" ? { her_emoji: safe } : { him_emoji: safe };
      await sb.from("couples").update(patch).eq("id", coupleId!);
      setState((s) => ({
        ...s,
        settings: {
          ...s.settings,
          [key]: { ...s.settings[key], emoji: safe },
        },
      }));
    },
    [coupleId, supabaseRequired]
  );

  const setAnniversary = useCallback(
    async (iso: string) => {
      const sb = supabaseRequired();
      const day = iso.slice(0, 10);
      await sb.from("couples").update({ anniversary: day }).eq("id", coupleId!);
      setState((s) => ({
        ...s,
        settings: { ...s.settings, anniversaryISO: new Date(day).toISOString() },
      }));
    },
    [coupleId, supabaseRequired]
  );

  const setEngagementDate = useCallback(
    async (iso: string | null) => {
      const sb = supabaseRequired();
      const day = iso ? iso.slice(0, 10) : null;
      await sb
        .from("couples")
        .update({ engagement_date: day })
        .eq("id", coupleId!);
      setState((s) => ({
        ...s,
        settings: {
          ...s.settings,
          engagementISO: day ? new Date(day).toISOString() : null,
        },
      }));
    },
    [coupleId, supabaseRequired]
  );

  const updateNotificationPrefs = useCallback<
    StoreValue["updateNotificationPrefs"]
  >(async (patch) => {
    const sb = supabaseRequired();
    const dbPatch: Record<string, unknown> = {};
    if (patch.pushEnabled !== undefined) {
      dbPatch.push_enabled = patch.pushEnabled;
      if (patch.pushEnabled) {
        dbPatch.reminder_timezone = getDeviceTimezone();
      }
    }
    if (patch.dailyReminderTime !== undefined) {
      dbPatch.daily_reminder_time = patch.dailyReminderTime;
      dbPatch.reminder_timezone = getDeviceTimezone();
    }

    const { error } = await sb
      .from("couple_members")
      .update(dbPatch)
      .eq("user_id", user!.id);

    if (error) throw new Error(error.message);

    setState((s) => ({
      ...s,
      notificationPrefs: {
        ...s.notificationPrefs,
        ...(patch.pushEnabled !== undefined && {
          pushEnabled: patch.pushEnabled,
        }),
        ...(patch.dailyReminderTime !== undefined && {
          dailyReminderTime: patch.dailyReminderTime,
          reminderTimezone: getDeviceTimezone(),
        }),
      },
    }));
  }, [supabaseRequired, user]);

  const addPlannedDate = useCallback<StoreValue["addPlannedDate"]>(
    async ({ title, dateISO, time, location, notes }) => {
      const sb = supabaseRequired();
      const res = await sb
        .from("planned_dates")
        .insert({
          couple_id: coupleId!,
          created_by: me(),
          title,
          date_iso: dateISO,
          time,
          location,
          notes: notes ?? null,
        })
        .select("*")
        .single();
      const data = res.data as PlannedDateRow | null;
      if (res.error || !data) return;
      setState((s) => ({
        ...s,
        plannedDates: [
          ...s.plannedDates,
          mapPlannedDateRow(data),
        ].sort(
          (a, b) =>
            a.dateISO.localeCompare(b.dateISO) || a.time.localeCompare(b.time)
        ),
      }));

      void notifyPartnerDatePlanned({
        title,
        dateISO,
        time,
        location,
      });
    },
    [coupleId, supabaseRequired, partner]
  );

  const removePlannedDate = useCallback(
    async (id: string) => {
      const sb = supabaseRequired();
      await sb.from("planned_dates").delete().eq("id", id);
      setState((s) => ({
        ...s,
        plannedDates: s.plannedDates.filter((d) => d.id !== id),
      }));
    },
    [supabaseRequired]
  );

  const respondToPlannedDate = useCallback<StoreValue["respondToPlannedDate"]>(
    async (id, response, reason) => {
      const sb = supabaseRequired();
      const partnerKey = me();
      const planned = state.plannedDates.find((d) => d.id === id);
      if (!planned) return;
      if (planned.createdBy === partnerKey) return;
      if (planned.status !== "pending") return;
      if (response === "rejected" && !reason?.trim()) {
        throw new Error("Please give a reason for declining.");
      }

      const res = await sb
        .from("planned_dates")
        .update({
          status: response,
          response_reason:
            response === "rejected" ? reason!.trim() : null,
          responded_by: partnerKey,
          responded_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();
      const data = res.data as PlannedDateRow | null;
      if (res.error || !data) {
        throw new Error(res.error?.message ?? "Could not update date plan.");
      }

      const updated = mapPlannedDateRow(data);
      setState((s) => ({
        ...s,
        plannedDates: s.plannedDates.map((d) =>
          d.id === id ? updated : d
        ),
      }));

      void notifyPartnerDateResponse({
        type: response === "accepted" ? "date_accepted" : "date_rejected",
        plannedDateId: id,
        title: planned.title,
        dateISO: planned.dateISO,
        time: planned.time,
        reason: response === "rejected" ? reason!.trim() : undefined,
      });
    },
    [supabaseRequired, partner, state.plannedDates]
  );

  const upsertTodayMood = useCallback<StoreValue["upsertTodayMood"]>(
    async (score, note) => {
      const sb = supabaseRequired();
      const day = todayKey();
      const partnerKey = me();
      const res = await sb
        .from("moods")
        .upsert(
          {
            couple_id: coupleId!,
            partner: partnerKey,
            date_iso: day,
            score,
            note: note ?? null,
          },
          { onConflict: "couple_id,partner,date_iso" }
        )
        .select("*")
        .single();
      const data = res.data as MoodRow | null;
      if (res.error || !data) return;
      setState((s) => {
        const idx = s.moods.findIndex(
          (m) => m.partner === partnerKey && m.dateISO === day
        );
        const entry = {
          id: data.id,
          partner: data.partner,
          dateISO: data.date_iso,
          score: data.score as MoodScore,
          note: data.note ?? undefined,
          createdISO: data.created_at,
        };
        const next = [...s.moods];
        if (idx >= 0) next[idx] = entry;
        else next.unshift(entry);
        return { ...s, moods: next };
      });
    },
    [coupleId, supabaseRequired, partner]
  );

  const addRule = useCallback<StoreValue["addRule"]>(
    async ({ title, description, status }) => {
      const sb = supabaseRequired();
      const res = await sb
        .from("rules")
        .insert({
          couple_id: coupleId!,
          proposed_by: me(),
          title,
          description: description ?? null,
          status: status ?? "Under Review",
        })
        .select("*")
        .single();
      const data = res.data as RuleRow | null;
      if (res.error || !data) return;
      setState((s) => ({
        ...s,
        rules: [
          {
            id: data.id,
            title: data.title,
            description: data.description ?? undefined,
            proposedBy: data.proposed_by,
            status: data.status,
            createdISO: data.created_at,
          },
          ...s.rules,
        ],
      }));
    },
    [coupleId, supabaseRequired, partner]
  );

  const setRuleStatus = useCallback(
    async (id: string, status: RuleStatus) => {
      const sb = supabaseRequired();
      await sb.from("rules").update({ status }).eq("id", id);
      setState((s) => ({
        ...s,
        rules: s.rules.map((r) => (r.id === id ? { ...r, status } : r)),
      }));
    },
    [supabaseRequired]
  );

  const removeRule = useCallback(
    async (id: string) => {
      const sb = supabaseRequired();
      await sb.from("rules").delete().eq("id", id);
      setState((s) => ({
        ...s,
        rules: s.rules.filter((r) => r.id !== id),
        violations: s.violations.filter((v) => v.ruleId !== id),
      }));
    },
    [supabaseRequired]
  );

  const addViolation = useCallback<StoreValue["addViolation"]>(
    async ({ ruleId, violator, note }) => {
      const sb = supabaseRequired();
      const res = await sb
        .from("violations")
        .insert({
          couple_id: coupleId!,
          rule_id: ruleId,
          violator,
          note: note ?? null,
        })
        .select("*")
        .single();
      const data = res.data as ViolationRow | null;
      if (res.error || !data) return;
      setState((s) => ({
        ...s,
        violations: [
          {
            id: data.id,
            ruleId: data.rule_id,
            violator: data.violator,
            note: data.note ?? undefined,
            createdISO: data.created_at,
          },
          ...s.violations,
        ],
      }));
    },
    [coupleId, supabaseRequired]
  );

  const removeViolation = useCallback(
    async (id: string) => {
      const sb = supabaseRequired();
      await sb.from("violations").delete().eq("id", id);
      setState((s) => ({
        ...s,
        violations: s.violations.filter((v) => v.id !== id),
      }));
    },
    [supabaseRequired]
  );

  const logApology = useCallback<StoreValue["logApology"]>(
    async (note) => {
      const sb = supabaseRequired();
      const res = await sb
        .from("apologies")
        .insert({
          couple_id: coupleId!,
          apologizer: me(),
          note: note ?? null,
        })
        .select("*")
        .single();
      const data = res.data as ApologyRow | null;
      if (res.error || !data) return;
      setState((s) => ({
        ...s,
        apologies: [
          {
            id: data.id,
            apologizer: data.apologizer,
            note: data.note ?? undefined,
            createdISO: data.created_at,
          },
          ...s.apologies,
        ],
      }));
    },
    [coupleId, supabaseRequired, partner]
  );

  const logImmaturity = useCallback<StoreValue["logImmaturity"]>(
    async (note) => {
      const sb = supabaseRequired();
      const res = await sb
        .from("immaturity")
        .insert({ couple_id: coupleId!, note: note ?? null })
        .select("*")
        .single();
      const data = res.data as ImmaturityRow | null;
      if (res.error || !data) return;
      setState((s) => ({
        ...s,
        immaturity: [
          {
            id: data.id,
            note: data.note ?? undefined,
            createdISO: data.created_at,
          },
          ...s.immaturity,
        ],
      }));
    },
    [coupleId, supabaseRequired]
  );

  const removeImmaturity = useCallback<StoreValue["removeImmaturity"]>(
    async (id) => {
      const sb = supabaseRequired();
      await sb.from("immaturity").delete().eq("id", id);
      setState((s) => ({
        ...s,
        immaturity: s.immaturity.filter((i) => i.id !== id),
      }));
    },
    [supabaseRequired]
  );

  const removeApology = useCallback<StoreValue["removeApology"]>(
    async (id) => {
      const sb = supabaseRequired();
      await sb.from("apologies").delete().eq("id", id);
      setState((s) => ({
        ...s,
        apologies: s.apologies.filter((a) => a.id !== id),
      }));
    },
    [supabaseRequired]
  );

  const logKindAct = useCallback<StoreValue["logKindAct"]>(
    async (text, by) => {
      const sb = supabaseRequired();
      const res = await sb
        .from("kind_acts")
        .insert({
          couple_id: coupleId!,
          by_partner: by ?? me(),
          text,
        })
        .select("*")
        .single();
      const data = res.data as KindActRow | null;
      if (res.error || !data) return;
      setState((s) => ({
        ...s,
        kindActs: [
          {
            id: data.id,
            by: data.by_partner,
            text: data.text,
            createdISO: data.created_at,
          },
          ...s.kindActs,
        ],
      }));
    },
    [coupleId, supabaseRequired, partner]
  );

  const addMemory = useCallback<StoreValue["addMemory"]>(
    async ({ text, memoryDateISO, tags, imageFile }) => {
      const sb = supabaseRequired();
      let imageUrl: string | undefined;

      // Upload image if provided
      if (imageFile && coupleId) {
        const fileName = `${coupleId}/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await sb.storage
          .from("memories")
          .upload(fileName, imageFile);
        if (!uploadError) {
          const { data } = sb.storage.from("memories").getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }
      }

      const res = await sb
        .from("memories")
        .insert({
          couple_id: coupleId!,
          text,
          memory_date: memoryDateISO,
          tags,
          image_url: imageUrl ?? null,
        })
        .select("*")
        .single();
      const data = res.data as MemoryRow | null;
      if (res.error || !data) return;
      setState((s) => ({
        ...s,
        memories: [
          {
            id: data.id,
            text: data.text,
            imageUrl: data.image_url ?? undefined,
            tags: (data.tags ?? []) as any,
            memoryDateISO: data.memory_date,
            createdISO: data.created_at,
          },
          ...s.memories,
        ],
      }));
    },
    [coupleId, supabaseRequired]
  );

  const removeMemory = useCallback<StoreValue["removeMemory"]>(
    async (id) => {
      const sb = supabaseRequired();
      await sb.from("memories").delete().eq("id", id);
      setState((s) => ({
        ...s,
        memories: s.memories.filter((m) => m.id !== id),
      }));
    },
    [supabaseRequired]
  );

  const refresh = useCallback(async () => {
    await fetchAllRef.current();
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      authStatus,
      user,
      partner,
      ready,
      state,
      signInWithPassword,
      signOut,
      updatePartnerName,
      updatePartnerEmoji,
      setAnniversary,
      setEngagementDate,
      updateNotificationPrefs,
      addPlannedDate,
      removePlannedDate,
      respondToPlannedDate,
      upsertTodayMood,
      addRule,
      setRuleStatus,
      removeRule,
      addViolation,
      removeViolation,
      logApology,
      removeApology,
      logImmaturity,
      removeImmaturity,
      logKindAct,
      addMemory,
      removeMemory,
      refresh,
    }),
    [
      authStatus,
      user,
      partner,
      ready,
      state,
      signInWithPassword,
      signOut,
      updatePartnerName,
      updatePartnerEmoji,
      setAnniversary,
      setEngagementDate,
      updateNotificationPrefs,
      addPlannedDate,
      removePlannedDate,
      respondToPlannedDate,
      upsertTodayMood,
      addRule,
      setRuleStatus,
      removeRule,
      addViolation,
      removeViolation,
      logApology,
      removeApology,
      logImmaturity,
      removeImmaturity,
      logKindAct,
      addMemory,
      removeMemory,
      refresh,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a <StoreProvider>");
  }
  return ctx;
}
