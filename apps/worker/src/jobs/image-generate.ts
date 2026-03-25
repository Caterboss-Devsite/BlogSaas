import type { WorkerJobPayload } from "@blog-saas/domain";
import { prisma } from "@blog-saas/db";

import { findPromptTemplateByName } from "@blog-saas/prompt-library";

import type { ImageGenerationProvider, LlmProvider } from "../providers/interfaces";

export async function runImageGenerateJob(
  payload: WorkerJobPayload,
  llmProvider: LlmProvider | undefined,
  imageProvider: ImageGenerationProvider,
) {
  if (!payload.draftId) {
    throw new Error("image_generate requires draftId");
  }

  const draft = await prisma.draft.findUnique({
    where: { id: payload.draftId },
    include: { tenant: { include: { brandProfile: true } } },
  });
  if (!draft) {
    throw new Error(`Draft ${payload.draftId} not found`);
  }

  const promptTemplate =
    findPromptTemplateByName("Generate RT Featured Image Prompt")?.systemPrompt ??
    "Create a premium editorial hero image prompt for an Irish stove retailer.";

  const generatedPrompt = llmProvider
    ? await llmProvider.complete({
        systemPrompt: promptTemplate,
        userPrompt: `Create a hero image prompt for the draft titled "${draft.title}" for ${draft.tenant.brandProfile?.brandName ?? draft.tenant.name}.`,
        model: "gpt-4.1-mini",
      })
    : {
        output: `Warm editorial hero image for "${draft.title}" in an Irish home-heating setting.`,
      };

  const image = await imageProvider.generate({
    prompt: generatedPrompt.output,
    fileName: `${payload.draftId ?? payload.correlationId}.jpg`,
  });

  await prisma.imageAsset.create({
    data: {
      tenantId: payload.tenantId,
      draftId: draft.id,
      provider: process.env.GEMINI_API_KEY ? "gemini" : "placeholder",
      prompt: generatedPrompt.output,
      storageKey: image.storageKey,
      altText: image.altText,
    },
  });

  await prisma.usageLedger.create({
    data: {
      tenantId: payload.tenantId,
      metric: "image_generated",
      quantity: 1,
      correlationId: payload.correlationId,
      modelName: process.env.GEMINI_API_KEY ? process.env.GEMINI_IMAGE_MODEL ?? "gemini" : "placeholder",
    },
  });

  return {
    jobKind: "image_generate",
    tenantId: payload.tenantId,
    storageKey: image.storageKey,
    altText: image.altText,
  };
}
