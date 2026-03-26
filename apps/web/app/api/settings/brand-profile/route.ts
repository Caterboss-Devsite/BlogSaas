import { NextRequest, NextResponse } from "next/server";

import { UpdateBrandProfileRequestSchema } from "@blog-saas/domain";

import { updateTenantBrandProfile } from "../../../../lib/persistence";

export async function PATCH(request: NextRequest) {
  const payload = UpdateBrandProfileRequestSchema.parse(await request.json());

  const brandProfile = await updateTenantBrandProfile({
    tenantId: payload.tenantId,
    brandName: payload.brandName,
    primaryDomain: payload.primaryDomain,
    marketCountryCode: payload.marketCountryCode,
    preferredSpelling: payload.preferredSpelling,
    voiceSummary: payload.voiceSummary,
    internalLinkRules: payload.internalLinkRules,
    complianceNotes: payload.complianceNotes,
  });

  return NextResponse.json({ ok: true, brandProfile });
}
