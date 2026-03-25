import type { WorkerJobPayload } from "@blog-saas/domain";
import { prisma } from "@blog-saas/db";

import { getDefaultContentTypes } from "@blog-saas/prompt-library";

import type { SearchProvider } from "../providers/interfaces";

export async function runTopicBacklogGenerateJob(
  payload: WorkerJobPayload,
  searchProvider: SearchProvider,
) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: payload.tenantId },
    include: { brandProfile: true },
  });
  if (!tenant) {
    throw new Error(`Tenant ${payload.tenantId} not found`);
  }

  const brandName = tenant.brandProfile?.brandName ?? tenant.name;
  const contentTypes = getDefaultContentTypes().filter((item) => item.status === "Production").slice(0, 5);
  const research = await searchProvider.search(`${brandName} stove blog topics ireland`, "google.ie");

  const createdTopics = await Promise.all(
    contentTypes.slice(0, 3).map((item, index) =>
      prisma.topic.create({
        data: {
          tenantId: payload.tenantId,
          keyword: `${brandName} ${item.contentType.toLowerCase()} ireland`,
          title: `${item.contentType} for Irish homes: what ${brandName} customers need to know`,
          status: "backlog",
          notes: research[index]?.url ?? null,
        },
      }),
    ),
  );

  return {
    jobKind: "topic_backlog_generate",
    tenantId: payload.tenantId,
    contentTypesConsidered: contentTypes.map((item) => item.contentType),
    researchSources: research.map((item) => item.url),
    createdTopicIds: createdTopics.map((topic) => topic.id),
  };
}
