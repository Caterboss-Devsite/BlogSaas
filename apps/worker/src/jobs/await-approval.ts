import type { WorkerJobPayload } from "@blog-saas/domain";
import { prisma } from "@blog-saas/db";

export async function runAwaitApprovalJob(payload: WorkerJobPayload) {
  if (payload.draftId) {
    await prisma.draft.update({
      where: { id: payload.draftId },
      data: {
        status: "awaiting_approval",
      },
    });
  }

  return {
    jobKind: "await_approval",
    tenantId: payload.tenantId,
    draftId: payload.draftId ?? null,
    status: "paused_for_review",
  };
}
