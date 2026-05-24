import { getUserFromRequest } from "@/lib/push/auth";
import { sendPushToMany } from "@/lib/push/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Send a test push to the signed-in user (verify subscription + VAPID). */
export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  const { data: member } = await admin
    .from("couple_members")
    .select("push_enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member?.push_enabled) {
    return Response.json(
      { error: "Turn on notifications in Settings first." },
      { status: 400 }
    );
  }

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .eq("user_id", user.id);

  if (!subs?.length) {
    return Response.json(
      {
        error:
          "No push subscription found. Re-enable notifications from the home-screen app.",
      },
      { status: 400 }
    );
  }

  const { sent, stale } = await sendPushToMany(subs, {
    title: "Test notification ✓",
    body: "Push is working. Daily reminders fire at your saved time.",
    url: "/settings",
    tag: "push-test",
  });

  if (stale.length) {
    await admin.from("push_subscriptions").delete().in("endpoint", stale);
  }

  if (sent === 0) {
    return Response.json(
      {
        error:
          "Could not deliver. Re-enable notifications and try again from the installed app.",
      },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, sent });
}
