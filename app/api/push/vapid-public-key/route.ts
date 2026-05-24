import { getVapidPublicKey } from "@/lib/push/server";

export async function GET() {
  const publicKey = getVapidPublicKey();
  return Response.json({ publicKey });
}
