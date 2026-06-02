import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import packageJson from "@/package.json";

export const dynamic = "force-dynamic";

function getBuildId() {
  const buildIdPath = join(process.cwd(), ".next", "BUILD_ID");
  if (!existsSync(buildIdPath)) return null;
  return readFileSync(buildIdPath, "utf8").trim();
}

export async function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_APP_VERSION ||
    getBuildId() ||
    packageJson.version;

  return NextResponse.json(
    {
      version,
      shortVersion: version.slice(0, 7),
      checkedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
