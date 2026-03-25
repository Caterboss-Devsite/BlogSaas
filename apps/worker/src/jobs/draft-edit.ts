import type { WorkerJobPayload } from "@blog-saas/domain";
import { prisma } from "@blog-saas/db";

import { findPromptTemplateByName } from "@blog-saas/prompt-library";

import type { LlmProvider } from "../providers/interfaces";
import { markdownToHtml } from "../persistence";

export async function runDraftEditJob(payload: WorkerJobPayload, llmProvider?: LlmProvider) {
  if (!payload.draftId) {
    throw new Error("draft_edit requires draftId");
  }

  const draft = await prisma.draft.findUnique({
    where: { id: payload.draftId },
    include: { tenant: { include: { brandProfile: true } }, topic: true },
  });
  if (!draft) {
    throw new Error(`Draft ${payload.draftId} not found`);
  }

  const editPrompt = findPromptTemplateByName("Edit Content 2.5");

  const output = llmProvider
    ? (
        await llmProvider.complete({
          systemPrompt: editPrompt?.systemPrompt ?? "Edit the content safely.",
          userPrompt: `Edit this markdown article for ${draft.tenant.brandProfile?.brandName ?? draft.tenant.name}.
Keep it Ireland-specific and preserve all FAQs.

${draft.bodyMarkdown}`,
          model: "gpt-4.1",
        })
      ).output
    : draft.bodyMarkdown;

  const updated = await prisma.draft.update({
    where: { id: draft.id },
    data: {
      bodyMarkdown: output,
      bodyHtml: markdownToHtml(output),
      status: "draft_ready",
    },
  });

  return {
    jobKind: "draft_edit",
    tenantId: payload.tenantId,
    draftId: updated.id,
    outputPreview: output.slice(0, 200),
  };
}
