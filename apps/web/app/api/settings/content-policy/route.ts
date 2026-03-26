import { NextRequest, NextResponse } from "next/server";

import { UpdateContentPolicyRequestSchema } from "@blog-saas/domain";

import { updateTenantContentPolicy } from "../../../../lib/persistence";

export async function PATCH(request: NextRequest) {
  const payload = UpdateContentPolicyRequestSchema.parse(await request.json());

  const contentPolicy = await updateTenantContentPolicy({
    tenantId: payload.tenantId,
    searchLocale: payload.searchLocale,
    llmProvider: payload.llmProvider,
    imageProvider: payload.imageProvider,
    maxDraftsPerDay: payload.maxDraftsPerDay,
  });

  return NextResponse.json({ ok: true, contentPolicy });
}
