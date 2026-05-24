import webpush from "web-push";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface PushSubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

let configured = false;

function ensureVapid() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT || "mailto:support@usdashboard.app";

  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID keys missing. Run: npx web-push generate-vapid-keys"
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

export function hasPushConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function sendPush(
  sub: PushSubscriptionRow,
  payload: PushPayload
): Promise<boolean> {
  ensureVapid();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth_key },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    // 404/410 = subscription expired
    if (status === 404 || status === 410) return false;
    console.error("Push send failed:", err);
    return false;
  }
}

export async function sendPushToMany(
  subs: PushSubscriptionRow[],
  payload: PushPayload
): Promise<{ sent: number; stale: string[] }> {
  let sent = 0;
  const stale: string[] = [];
  for (const sub of subs) {
    const ok = await sendPush(sub, payload);
    if (ok) sent++;
    else stale.push(sub.endpoint);
  }
  return { sent, stale };
}
