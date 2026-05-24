import { format } from "date-fns";
import { getUserFromRequest } from "@/lib/push/auth";
import { sendPushToMany } from "@/lib/push/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PartnerKey } from "@/lib/types";

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

type NotifyBody = {
  type?: string;
  title?: string;
  dateISO?: string;
  time?: string;
  location?: string;
  plannedDateId?: string;
  reason?: string;
};

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: NotifyBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = body.type;
  if (
    !type ||
    !["date_planned", "date_accepted", "date_rejected"].includes(type)
  ) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { data: me } = await admin
    .from("couple_members")
    .select("couple_id, partner")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!me) {
    return Response.json({ error: "Not in a couple" }, { status: 403 });
  }

  const { data: members } = await admin
    .from("couple_members")
    .select("user_id, partner, push_enabled")
    .eq("couple_id", me.couple_id);

  const { data: couple } = await admin
    .from("couples")
    .select("her_name, him_name")
    .eq("id", me.couple_id)
    .single();

  const partnerName = (key: PartnerKey) =>
    key === "her" ? couple?.her_name : couple?.him_name;

  let recipientUserId: string | null = null;
  let pushTitle = "";
  let pushBody = "";
  let tag = "date-planned";

  if (type === "date_planned") {
    if (!body.title || !body.dateISO || !body.time) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const partnerMember = members?.find((m) => m.user_id !== user.id);
    if (!partnerMember?.push_enabled) {
      return Response.json({ ok: true, skipped: "partner notifications off" });
    }
    recipientUserId = partnerMember.user_id;

    const dateLabel = format(new Date(body.dateISO), "EEE, MMM d");
    const timeLabel = formatTime12h(body.time);
    const loc = body.location ? ` · ${body.location}` : "";

    pushTitle = "New date to review 📅";
    pushBody = `${partnerName(me.partner) ?? "Your partner"} planned: ${body.title} — ${dateLabel} at ${timeLabel}${loc}. Tap to accept or decline.`;
    tag = "date-planned";
  } else {
    if (!body.plannedDateId || !body.title || !body.dateISO || !body.time) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (type === "date_rejected" && !body.reason?.trim()) {
      return Response.json({ error: "Reason required" }, { status: 400 });
    }

    const { data: planned } = await admin
      .from("planned_dates")
      .select("created_by, couple_id")
      .eq("id", body.plannedDateId)
      .maybeSingle();

    if (!planned || planned.couple_id !== me.couple_id) {
      return Response.json({ error: "Date not found" }, { status: 404 });
    }
    if (planned.created_by === me.partner) {
      return Response.json({ error: "Cannot notify yourself" }, { status: 400 });
    }

    const creatorMember = members?.find((m) => m.partner === planned.created_by);
    if (!creatorMember?.push_enabled) {
      return Response.json({ ok: true, skipped: "planner notifications off" });
    }
    recipientUserId = creatorMember.user_id;

    const dateLabel = format(new Date(body.dateISO), "EEE, MMM d");
    const timeLabel = formatTime12h(body.time);
    const responder = partnerName(me.partner) ?? "Your partner";

    if (type === "date_accepted") {
      pushTitle = "Date accepted 💕";
      pushBody = `${responder} accepted: ${body.title} — ${dateLabel} at ${timeLabel}`;
      tag = "date-accepted";
    } else {
      pushTitle = "Date declined";
      pushBody = `${responder} declined: ${body.title} — "${body.reason!.trim()}"`;
      tag = "date-rejected";
    }
  }

  if (!recipientUserId) {
    return Response.json({ ok: true, skipped: "no recipient" });
  }

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", recipientUserId);

  if (!subs?.length) {
    return Response.json({ ok: true, skipped: "no subscription" });
  }

  const { sent, stale } = await sendPushToMany(subs, {
    title: pushTitle,
    body: pushBody,
    url: "/dates",
    tag,
  });

  if (stale.length) {
    await admin.from("push_subscriptions").delete().in("endpoint", stale);
  }

  return Response.json({ ok: true, sent });
}
