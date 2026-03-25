import { NextResponse } from "next/server";

import { prisma } from "@blog-saas/db";

export async function GET() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");

    return NextResponse.json({
      ok: true,
      service: "blog-saas-web",
      database: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "blog-saas-web",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
