import type { WorkerJobPayload } from "@blog-saas/domain";
import { prisma } from "@blog-saas/db";

import type { ShopifyPublishingProvider } from "../providers/interfaces";

export async function runPublishShopifyJob(
  payload: WorkerJobPayload,
  publishingProvider: ShopifyPublishingProvider,
) {
  if (!payload.draftId) {
    throw new Error("publish_shopify requires draftId");
  }

  const draft = await prisma.draft.findUnique({
    where: { id: payload.draftId },
    include: {
      tenant: {
        include: {
          shopConnections: {
            where: { uninstalledAt: null },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });
  if (!draft) {
    throw new Error(`Draft ${payload.draftId} not found`);
  }

  const shop = draft.tenant.shopConnections[0];
  if (!shop) {
    throw new Error(`No installed Shopify shop for tenant ${payload.tenantId}`);
  }

  const published = await publishingProvider.publish({
    shopDomain: shop.shopDomain,
    accessToken: shop.accessTokenEncrypted,
    title: draft.title,
    bodyHtml: draft.bodyHtml || "<p>No body available.</p>",
    summaryHtml: draft.bodyHtml.slice(0, 240),
    tags: ["blog-saas", draft.tenant.slug],
  });

  await prisma.draft.update({
    where: { id: draft.id },
    data: {
      status: "published",
      publishStatus: "published",
      shopifyArticleId: published.articleId,
      liveUrl: published.liveUrl,
      publishedAt: new Date(),
    },
  });

  await prisma.usageLedger.create({
    data: {
      tenantId: payload.tenantId,
      metric: "publish_completed",
      quantity: 1,
      correlationId: payload.correlationId,
      modelName: "shopify",
    },
  });

  return {
    jobKind: "publish_shopify",
    tenantId: payload.tenantId,
    articleId: published.articleId,
    liveUrl: published.liveUrl,
  };
}
