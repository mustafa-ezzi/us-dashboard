import { sendPushToMany } from "@/lib/push/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Daily mood check-in reminders. Call via free cron (cron-job.org) every hour. */
export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tz = process.env.CRON_TIMEZONE || "Asia/Karachi";
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const currentTime = `${hour}:${minute}`;

  const admin = getSupabaseAdmin();

  const { data: members } = await admin
    .from("couple_members")
    .select("user_id, daily_reminder_time")
    .eq("push_enabled", true);

  const due = (members ?? []).filter(
    (m) => m.daily_reminder_time?.slice(0, 5) === currentTime
  );

  if (due.length === 0) {
    return Response.json({ ok: true, sent: 0, message: "No reminders due" });
  }

  let totalSent = 0;
  const allStale: string[] = [];

  for (const member of due) {
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("user_id", member.user_id);

    if (!subs?.length) continue;

    const { sent, stale } = await sendPushToMany(subs, {
      title: "Daily check-in",
      body: "Take 30 seconds — log your mood for today.",
      url: "/mood",
      tag: "daily-reminder",
    });

    totalSent += sent;
    allStale.push(...stale);
  }

  if (allStale.length) {
    await admin.from("push_subscriptions").delete().in("endpoint", allStale);
  }

  return Response.json({
    ok: true,
    sent: totalSent,
    dueUsers: due.length,
    time: currentTime,
    timezone: tz,
  });
}
