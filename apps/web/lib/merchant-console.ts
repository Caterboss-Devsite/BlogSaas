import { prisma } from "@blog-saas/db";

import { webEnv } from "./env";

export type MerchantTopicRow = {
  id: string;
  title: string;
  keyword: string;
  status: string;
  updatedAt: string;
};

export type MerchantDraftRow = {
  id: string;
  title: string;
  status: string;
  publishStatus: string;
  keyword: string;
  updatedAt: string;
  liveUrl: string | null;
};

export type MerchantJobRow = {
  id: string;
  jobKind: string;
  status: string;
  createdAt: string;
};

export type MerchantUsageRow = {
  metric: string;
  quantity: number;
  estimatedCost: number;
};

export type MerchantConsoleSnapshot = {
  source: "database" | "demo";
  database: "connected" | "degraded";
  databaseError?: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
    countryCode: string;
  };
  shop: {
    domain: string;
    primaryDomain: string;
  };
  brandProfile: {
    brandName: string;
    voiceSummary: string;
    marketCountryCode: string;
    preferredSpelling: string;
    internalLinkRules: string[];
    complianceNotes: string[];
  };
  contentPolicy: {
    approvalRequired: boolean;
    searchLocale: string;
    llmProvider: string;
    imageProvider: string;
    maxDraftsPerDay: number;
    publishCadenceHours: number[];
  };
  publishSchedule: {
    timezone: string;
    localHours: number[];
    nextWindows: string[];
  };
  subscription: {
    planKey: string;
    status: string;
    monthlyDraftLimit: number;
    monthlyImageLimit: number;
    monthlyPublishLimit: number;
  };
  counts: {
    topics: number;
    drafts: number;
    awaitingApproval: number;
    published: number;
    promptTemplates: number;
    jobRuns: number;
  };
  usage: {
    draftsGenerated: number;
    imagesGenerated: number;
    publishesCompleted: number;
    estimatedSpend: number;
  };
  googleDocs: {
    mode: "optional";
    exportEnabled: boolean;
    syncEnabled: boolean;
  };
  topics: MerchantTopicRow[];
  drafts: MerchantDraftRow[];
  approvalQueue: MerchantDraftRow[];
  recentJobs: MerchantJobRow[];
  usageRows: MerchantUsageRow[];
};

export type ConnectedTenantSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  shopDomain: string;
  installedAt: string;
  monthlyPlan: string;
  draftCount: number;
  topicCount: number;
};

function createDemoSnapshot(databaseError?: string): MerchantConsoleSnapshot {
  return {
    source: "demo",
    database: "degraded",
    ...(databaseError ? { databaseError } : {}),
    tenant: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Stoveboss",
      slug: "stoveboss",
      status: "active",
      countryCode: "IE",
    },
    shop: {
      domain: "c975ab-b0.myshopify.com",
      primaryDomain: "www.stoveboss.ie",
    },
    brandProfile: {
      brandName: "Stoveboss",
      voiceSummary: "Trusted Irish stove and heating retailer with practical, compliance-aware advice.",
      marketCountryCode: "IE",
      preferredSpelling: "en-IE",
      internalLinkRules: [
        "Prefer direct links to relevant category and product pages on stoveboss.ie.",
        "Avoid generic homepage links when a category link is more specific.",
      ],
      complianceNotes: [
        "Keep guidance aligned to Irish market language and usage.",
        "Do not present installation or flue work as DIY where professional fitting is expected.",
      ],
    },
    contentPolicy: {
      approvalRequired: true,
      searchLocale: "google.ie",
      llmProvider: "openai",
      imageProvider: "gemini",
      maxDraftsPerDay: 3,
      publishCadenceHours: [10, 13, 16],
    },
    publishSchedule: {
      timezone: "Europe/Dublin",
      localHours: [10, 13, 16],
      nextWindows: ["10:00", "13:00", "16:00"],
    },
    subscription: {
      planKey: "agency-launch",
      status: "trialing",
      monthlyDraftLimit: 90,
      monthlyImageLimit: 90,
      monthlyPublishLimit: 90,
    },
    counts: {
      topics: 18,
      drafts: 11,
      awaitingApproval: 2,
      published: 7,
      promptTemplates: 13,
      jobRuns: 6,
    },
    usage: {
      draftsGenerated: 11,
      imagesGenerated: 8,
      publishesCompleted: 7,
      estimatedSpend: 14.72,
    },
    googleDocs: {
      mode: "optional",
      exportEnabled: true,
      syncEnabled: true,
    },
    topics: [
      {
        id: "00000000-0000-4000-8000-000000000101",
        title: "Best stove glass cleaner options in Ireland",
        keyword: "stove glass cleaner ireland",
        status: "backlog",
        updatedAt: "Today",
      },
      {
        id: "00000000-0000-4000-8000-000000000102",
        title: "Wood pellet stove sizing for Irish homes",
        keyword: "wood pellet stove sizing ireland",
        status: "approved",
        updatedAt: "Today",
      },
      {
        id: "00000000-0000-4000-8000-000000000103",
        title: "How often should you service a pellet stove in Ireland?",
        keyword: "pellet stove servicing ireland",
        status: "researching",
        updatedAt: "Yesterday",
      },
    ],
    drafts: [
      {
        id: "00000000-0000-4000-8000-000000000201",
        title: "Wood Pellet Stove Sizing Ireland",
        status: "published",
        publishStatus: "published",
        keyword: "wood pellet stove sizing ireland",
        updatedAt: "1h ago",
        liveUrl: "https://www.stoveboss.ie/blogs/news/wood-pellet-stove-sizing-ireland",
      },
      {
        id: "00000000-0000-4000-8000-000000000202",
        title: "Pellet Stove Maintenance Ireland",
        status: "awaiting_approval",
        publishStatus: "queued",
        keyword: "pellet stove maintenance ireland",
        updatedAt: "25m ago",
        liveUrl: null,
      },
      {
        id: "00000000-0000-4000-8000-000000000203",
        title: "Portable Gas Heater Buying Guide Ireland",
        status: "draft_ready",
        publishStatus: "queued",
        keyword: "portable gas heater buying guide ireland",
        updatedAt: "2h ago",
        liveUrl: null,
      },
    ],
    approvalQueue: [
      {
        id: "00000000-0000-4000-8000-000000000202",
        title: "Pellet Stove Maintenance Ireland",
        status: "awaiting_approval",
        publishStatus: "queued",
        keyword: "pellet stove maintenance ireland",
        updatedAt: "25m ago",
        liveUrl: null,
      },
      {
        id: "00000000-0000-4000-8000-000000000204",
        title: "Stove Fan Positioning Guide",
        status: "awaiting_approval",
        publishStatus: "queued",
        keyword: "stove fan positioning guide ireland",
        updatedAt: "53m ago",
        liveUrl: null,
      },
    ],
    recentJobs: [
      {
        id: "00000000-0000-4000-8000-000000000301",
        jobKind: "topic_backlog_generate",
        status: "completed",
        createdAt: "09:00",
      },
      {
        id: "00000000-0000-4000-8000-000000000302",
        jobKind: "draft_generate",
        status: "completed",
        createdAt: "09:12",
      },
      {
        id: "00000000-0000-4000-8000-000000000303",
        jobKind: "await_approval",
        status: "completed",
        createdAt: "09:16",
      },
    ],
    usageRows: [
      { metric: "draft_generated", quantity: 11, estimatedCost: 7.85 },
      { metric: "image_generated", quantity: 8, estimatedCost: 4.8 },
      { metric: "publish_completed", quantity: 7, estimatedCost: 2.07 },
    ],
  };
}

function formatRelativeDate(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours <= 0) {
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "Yesterday" : `${diffDays}d ago`;
}

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function formatUsage(entries: Array<{ metric: string; quantity: number; estimatedCost: number }>) {
  const byMetric = new Map<string, { quantity: number; estimatedCost: number }>();

  for (const entry of entries) {
    const current = byMetric.get(entry.metric) ?? { quantity: 0, estimatedCost: 0 };
    current.quantity += entry.quantity;
    current.estimatedCost += entry.estimatedCost;
    byMetric.set(entry.metric, current);
  }

  const draftsGenerated = byMetric.get("draft_generated")?.quantity ?? 0;
  const imagesGenerated = byMetric.get("image_generated")?.quantity ?? 0;
  const publishesCompleted = byMetric.get("publish_completed")?.quantity ?? 0;
  const estimatedSpend = Array.from(byMetric.values()).reduce(
    (total, entry) => total + entry.estimatedCost,
    0,
  );

  return {
    draftsGenerated,
    imagesGenerated,
    publishesCompleted,
    estimatedSpend,
    usageRows: Array.from(byMetric.entries()).map(([metric, entry]) => ({
      metric,
      quantity: entry.quantity,
      estimatedCost: entry.estimatedCost,
    })),
  };
}

export async function probeDatabaseConnection() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export async function getMerchantConsoleSnapshot(tenantSlug?: string): Promise<MerchantConsoleSnapshot> {
  const missingTenantMessage = "No installed tenant was found yet.";

  try {
    const shopConnection = await prisma.shopConnection.findFirst({
      where: {
        uninstalledAt: null,
        ...(tenantSlug
          ? {
              tenant: {
                slug: tenantSlug,
              },
            }
          : {}),
      },
      orderBy: {
        installedAt: "desc",
      },
      include: {
        tenant: {
          include: {
            brandProfile: true,
            contentPolicy: true,
            schedules: true,
            subscriptions: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
            topics: {
              orderBy: {
                updatedAt: "desc",
              },
              take: 8,
            },
            drafts: {
              orderBy: {
                updatedAt: "desc",
              },
              take: 8,
              include: {
                topic: true,
              },
            },
            promptTemplates: {
              where: {
                isDefault: true,
              },
            },
            jobRuns: {
              orderBy: {
                createdAt: "desc",
              },
              take: 8,
            },
            usageEntries: {
              where: {
                occurredAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
              orderBy: {
                occurredAt: "desc",
              },
              take: 100,
            },
            _count: {
              select: {
                topics: true,
                drafts: true,
                promptTemplates: true,
                jobRuns: true,
              },
            },
          },
        },
      },
    });

    if (!shopConnection || !shopConnection.tenant.brandProfile || !shopConnection.tenant.contentPolicy) {
      return createDemoSnapshot(missingTenantMessage);
    }

    const tenant = shopConnection.tenant;
    const brandProfile = tenant.brandProfile!;
    const contentPolicy = tenant.contentPolicy!;
    const subscription = tenant.subscriptions[0];
    const schedule = tenant.schedules[0];
    const usage = formatUsage(
      tenant.usageEntries.map((entry) => ({
        metric: entry.metric,
        quantity: entry.quantity,
        estimatedCost: entry.estimatedCost,
      })),
    );

    const approvalQueue = tenant.drafts.filter((draft) => draft.status === "awaiting_approval");
    const publishedCount = tenant.drafts.filter((draft) => draft.status === "published").length;

    return {
      source: "database",
      database: "connected",
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        countryCode: tenant.countryCode,
      },
      shop: {
        domain: shopConnection.shopDomain,
        primaryDomain: brandProfile.primaryDomain,
      },
      brandProfile: {
        brandName: brandProfile.brandName,
        voiceSummary: brandProfile.voiceSummary,
        marketCountryCode: brandProfile.marketCountryCode,
        preferredSpelling: brandProfile.preferredSpelling,
        internalLinkRules: Array.isArray(brandProfile.internalLinkRules)
          ? brandProfile.internalLinkRules.map((rule) => String(rule))
          : [],
        complianceNotes: Array.isArray(brandProfile.complianceNotes)
          ? brandProfile.complianceNotes.map((note) => String(note))
          : [],
      },
      contentPolicy: {
        approvalRequired: contentPolicy.approvalRequired,
        searchLocale: contentPolicy.searchLocale,
        llmProvider: contentPolicy.llmProvider,
        imageProvider: contentPolicy.imageProvider,
        maxDraftsPerDay: contentPolicy.maxDraftsPerDay,
        publishCadenceHours: Array.isArray(contentPolicy.publishCadenceHours)
          ? contentPolicy.publishCadenceHours.map((hour) => Number(hour))
          : [],
      },
      publishSchedule: {
        timezone: schedule?.timezone ?? "Europe/Dublin",
        localHours: Array.isArray(schedule?.localHours) ? schedule.localHours.map((hour) => Number(hour)) : [],
        nextWindows: Array.isArray(schedule?.localHours)
          ? schedule.localHours.map((hour) => formatHour(Number(hour)))
          : [],
      },
      subscription: {
        planKey: subscription?.planKey ?? "agency-launch",
        status: subscription?.status ?? "trialing",
        monthlyDraftLimit: subscription?.monthlyDraftLimit ?? 0,
        monthlyImageLimit: subscription?.monthlyImageLimit ?? 0,
        monthlyPublishLimit: subscription?.monthlyPublishLimit ?? 0,
      },
      counts: {
        topics: tenant._count.topics,
        drafts: tenant._count.drafts,
        awaitingApproval: approvalQueue.length,
        published: publishedCount,
        promptTemplates: tenant._count.promptTemplates,
        jobRuns: tenant._count.jobRuns,
      },
      usage: {
        draftsGenerated: usage.draftsGenerated,
        imagesGenerated: usage.imagesGenerated,
        publishesCompleted: usage.publishesCompleted,
        estimatedSpend: usage.estimatedSpend,
      },
      googleDocs: {
        mode: "optional",
        exportEnabled: true,
        syncEnabled: true,
      },
      topics: tenant.topics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        keyword: topic.keyword,
        status: topic.status,
        updatedAt: formatRelativeDate(topic.updatedAt),
      })),
      drafts: tenant.drafts.map((draft) => ({
        id: draft.id,
        title: draft.title,
        status: draft.status,
        publishStatus: draft.publishStatus,
        keyword: draft.topic.keyword,
        updatedAt: formatRelativeDate(draft.updatedAt),
        liveUrl: draft.liveUrl,
      })),
      approvalQueue: approvalQueue.map((draft) => ({
        id: draft.id,
        title: draft.title,
        status: draft.status,
        publishStatus: draft.publishStatus,
        keyword: draft.topic.keyword,
        updatedAt: formatRelativeDate(draft.updatedAt),
        liveUrl: draft.liveUrl,
      })),
      recentJobs: tenant.jobRuns.map((jobRun) => ({
        id: jobRun.id,
        jobKind: jobRun.jobKind,
        status: jobRun.status,
        createdAt: formatRelativeDate(jobRun.createdAt),
      })),
      usageRows: usage.usageRows,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";

    if (webEnv.demoMode || message === missingTenantMessage) {
      return createDemoSnapshot(message);
    }

    throw error;
  }
}

export async function getConnectedTenantSummaries(): Promise<ConnectedTenantSummary[]> {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        shopConnections: {
          where: {
            uninstalledAt: null,
          },
          orderBy: {
            installedAt: "desc",
          },
        },
        subscriptions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            drafts: true,
            topics: true,
          },
        },
      },
    });

    return tenants
      .filter((tenant) => tenant.shopConnections.length > 0)
      .map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        shopDomain: tenant.shopConnections[0]?.shopDomain ?? "",
        installedAt: formatRelativeDate(tenant.shopConnections[0]?.installedAt ?? tenant.createdAt),
        monthlyPlan: tenant.subscriptions[0]?.planKey ?? "agency-launch",
        draftCount: tenant._count.drafts,
        topicCount: tenant._count.topics,
      }));
  } catch (error) {
    if (webEnv.demoMode) {
      return [];
    }

    throw error;
  }
}
