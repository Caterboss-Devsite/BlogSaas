import type { WorkerJobPayload } from "@blog-saas/domain";
import { prisma } from "@blog-saas/db";

import { findPromptTemplateByName } from "@blog-saas/prompt-library";

import type { LlmProvider } from "../providers/interfaces";
import { markdownToHtml } from "../persistence";

function fallbackDraftMarkdown(title: string, keyword: string, brandName: string) {
  return `# ${title}

## Why this matters in Ireland
If you are researching ${keyword}, you need advice that matches Irish homes, Irish regulations, and the way people actually heat their spaces through damp and cold weather. ${brandName} should sound practical and trustworthy, not like generic imported SEO copy.

## Key considerations before you buy
- Match the heat output to the room rather than buying the biggest stove you can afford.
- Check flue, hearth, ventilation, and installation constraints before choosing a model.
- Compare running costs, maintenance needs, and fuel availability in your area.

## Frequently Asked Questions
### Is this topic different in Ireland?
Yes. Irish housing stock, compliance expectations, and weather conditions all change what “best practice” looks like.

## Take the next step
Use this draft as the starting point for a fully reviewed article and adapt the examples to the tenant's product range and local service area.`;
}

export async function runDraftGenerateJob(payload: WorkerJobPayload, llmProvider?: LlmProvider) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: payload.tenantId },
    include: {
      brandProfile: true,
      topics: {
        where: payload.topicId ? { id: payload.topicId } : { status: "backlog" },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
  if (!tenant) {
    throw new Error(`Tenant ${payload.tenantId} not found`);
  }

  const topic = tenant.topics[0];
  if (!topic) {
    throw new Error(`No topic available for tenant ${payload.tenantId}`);
  }

  const researchPrompt = findPromptTemplateByName("Query Research 1.4");
  const writePrompt = findPromptTemplateByName("Write Content 2.5");
  const styleGuide = findPromptTemplateByName("Writing Style Guide 1.0");

  const brandName = tenant.brandProfile?.brandName ?? tenant.name;
  const markdown = llmProvider
    ? (
        await llmProvider.complete({
          systemPrompt: [researchPrompt?.systemPrompt, writePrompt?.systemPrompt, styleGuide?.systemPrompt]
            .filter(Boolean)
            .join("\n\n"),
          userPrompt: `Write a complete markdown blog article for ${brandName}.
Primary market: Ireland.
Keyword: ${topic.keyword}
Working title: ${topic.title}
Keep the content helpful, factual, and non-salesy.
Return only the finished markdown article with FAQs and CTA included.`,
          model: "gpt-4.1",
        })
      ).output
    : fallbackDraftMarkdown(topic.title, topic.keyword, brandName);

  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? topic.title;
  const bodyHtml = markdownToHtml(markdown);
  const draft =
    payload.draftId
      ? await prisma.draft.update({
          where: { id: payload.draftId },
          data: {
            title,
            bodyMarkdown: markdown,
            bodyHtml,
            status: "draft_ready",
            publishStatus: "queued",
          },
        })
      : await prisma.draft.create({
          data: {
            tenantId: payload.tenantId,
            topicId: topic.id,
            title,
            bodyMarkdown: markdown,
            bodyHtml,
            status: "draft_ready",
            publishStatus: "queued",
          },
        });

  await prisma.topic.update({
    where: { id: topic.id },
    data: { status: "approved" },
  });

  await prisma.usageLedger.create({
    data: {
      tenantId: payload.tenantId,
      metric: "draft_generated",
      quantity: 1,
      correlationId: payload.correlationId,
      modelName: llmProvider ? "gpt-4.1" : "fallback",
    },
  });

  return {
    jobKind: "draft_generate",
    tenantId: payload.tenantId,
    promptSources: [researchPrompt?.name, styleGuide?.name].filter(Boolean),
    draftId: draft.id,
    outputPreview: markdown.slice(0, 200),
  };
}
