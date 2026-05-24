import { getUserFromRequest } from "@/lib/push/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { data: member } = await admin
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    return Response.json({ error: "Not in a couple" }, { status: 403 });
  }

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      couple_id: member.couple_id,
      endpoint,
      p256dh: keys.p256dh,
      auth_key: keys.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("Subscribe error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  await admin
    .from("couple_members")
    .update({ push_enabled: true })
    .eq("user_id", user.id);

  return Response.json({ ok: true });
}
