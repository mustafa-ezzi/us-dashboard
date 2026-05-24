import { format } from "date-fns";
import { getUserFromRequest } from "@/lib/push/auth";
import { sendPushToMany } from "@/lib/push/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    type?: string;
    title?: string;
    dateISO?: string;
    time?: string;
    location?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.type !== "date_planned" || !body.title || !body.dateISO || !body.time) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
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

  const { data: partnerMember } = await admin
    .from("couple_members")
    .select("user_id, push_enabled")
    .eq("couple_id", me.couple_id)
    .neq("user_id", user.id)
    .maybeSingle();

  if (!partnerMember?.push_enabled) {
    return Response.json({ ok: true, skipped: "partner notifications off" });
  }

  const { data: couple } = await admin
    .from("couples")
    .select("her_name, him_name")
    .eq("id", me.couple_id)
    .single();

  const plannerName =
    me.partner === "her" ? couple?.her_name : couple?.him_name;

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", partnerMember.user_id);

  if (!subs?.length) {
    return Response.json({ ok: true, skipped: "no partner subscription" });
  }

  const dateLabel = format(new Date(body.dateISO), "EEE, MMM d");
  const timeLabel = formatTime12h(body.time);
  const loc = body.location ? ` · ${body.location}` : "";

  const { sent, stale } = await sendPushToMany(subs, {
    title: "New date planned 📅",
    body: `${plannerName ?? "Your partner"} planned: ${body.title} — ${dateLabel} at ${timeLabel}${loc}`,
    url: "/dates",
    tag: "date-planned",
  });

  if (stale.length) {
    await admin.from("push_subscriptions").delete().in("endpoint", stale);
  }

  return Response.json({ ok: true, sent });
}
