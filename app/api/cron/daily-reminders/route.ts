import {
  currentDateInTimezone,
  currentTimeInTimezone,
  normalizeReminderTime,
} from "@/lib/reminder-time";
import { sendPushToMany } from "@/lib/push/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const DEFAULT_TZ = process.env.CRON_TIMEZONE || "Asia/Karachi";

/** Daily mood check-in reminders. Must be called every minute (cron-job.org). */
export async function GET(req: Request) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const admin = getSupabaseAdmin();

  const { data: members } = await admin
    .from("couple_members")
    .select(
      "user_id, daily_reminder_time, reminder_timezone, last_reminder_date"
    )
    .eq("push_enabled", true);

  const due: Array<{
    user_id: string;
    timezone: string;
    today: string;
  }> = [];

  for (const member of members ?? []) {
    const tz = member.reminder_timezone || DEFAULT_TZ;
    const currentTime = currentTimeInTimezone(now, tz);
    const today = currentDateInTimezone(now, tz);
    const reminderTime = normalizeReminderTime(
      member.daily_reminder_time ?? "20:00"
    );

    if (reminderTime !== currentTime) continue;
    if (member.last_reminder_date === today) continue;

    due.push({ user_id: member.user_id, timezone: tz, today });
  }

  if (due.length === 0) {
    return Response.json({
      ok: true,
      sent: 0,
      message: "No reminders due this minute",
      checkedAt: now.toISOString(),
    });
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

    if (sent > 0) {
      totalSent += sent;
      await admin
        .from("couple_members")
        .update({ last_reminder_date: member.today })
        .eq("user_id", member.user_id);
    }

    allStale.push(...stale);
  }

  if (allStale.length) {
    await admin.from("push_subscriptions").delete().in("endpoint", allStale);
  }

  return Response.json({
    ok: true,
    sent: totalSent,
    dueUsers: due.length,
    checkedAt: now.toISOString(),
  });
}
