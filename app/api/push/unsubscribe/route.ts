import { getUserFromRequest } from "@/lib/push/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { endpoint?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  if (body.endpoint) {
    await admin
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", body.endpoint)
      .eq("user_id", user.id);
  } else {
    await admin.from("push_subscriptions").delete().eq("user_id", user.id);
  }

  await admin
    .from("couple_members")
    .update({ push_enabled: false })
    .eq("user_id", user.id);

  return Response.json({ ok: true });
}
