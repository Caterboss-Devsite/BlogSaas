import { NextResponse } from "next/server";

import { webEnv } from "../../../lib/env";
import { probeDatabaseConnection } from "../../../lib/merchant-console";

export async function GET() {
  const result = await probeDatabaseConnection();
  if (result.ok) {
    return NextResponse.json({
      ok: true,
      service: "blog-saas-web",
      database: "ok",
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json(
    {
      ok: webEnv.demoMode,
      service: "blog-saas-web",
      database: webEnv.demoMode ? "degraded" : "error",
      error: result.error,
      demoMode: webEnv.demoMode,
      timestamp: new Date().toISOString(),
    },
    { status: webEnv.demoMode ? 200 : 503 },
  );
}
