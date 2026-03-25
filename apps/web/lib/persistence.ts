import { prisma } from "@blog-saas/db";
import { assertValidLocalHours } from "@blog-saas/domain";
import { getDefaultPromptTemplates } from "@blog-saas/prompt-library";

function slugifyShopDomain(shopDomain: string) {
  return shopDomain.replace(".myshopify.com", "").replace(/[^a-zA-Z0-9-]+/g, "-").toLowerCase();
}

function slugifyPromptTemplateKey(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function seedTenantPromptTemplates(tenantId: string) {
  const promptTemplates = getDefaultPromptTemplates();

  await Promise.all(
    promptTemplates.map((template) =>
      prisma.promptTemplate.upsert({
        where: {
          tenantId_key_version: {
            tenantId,
            key: slugifyPromptTemplateKey(template.name),
            version: template.version,
          },
        },
        update: {
          usedIn: template.usedIn,
          formatLabel: template.formatLabel,
          systemPrompt: template.systemPrompt,
          isDefault: true,
        },
        create: {
          tenantId,
          key: slugifyPromptTemplateKey(template.name),
          version: template.version,
          usedIn: template.usedIn,
          formatLabel: template.formatLabel,
          systemPrompt: template.systemPrompt,
          isDefault: true,
        },
      }),
    ),
  );
}

async function ensureDefaultSubscription(tenantId: string) {
  const existing = await prisma.subscription.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.subscription.create({
    data: {
      tenantId,
      planKey: "agency-launch",
      status: "trialing",
      monthlyDraftLimit: 90,
      monthlyImageLimit: 90,
      monthlyPublishLimit: 90,
    },
  });
}

export async function upsertInstalledShop(params: {
  shopDomain: string;
  accessTokenEncrypted: string;
  scope: string;
}) {
  const tenantSlug = slugifyShopDomain(params.shopDomain);

  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: { status: "active" },
    create: {
      name: tenantSlug,
      slug: tenantSlug,
      countryCode: "IE",
      status: "active",
    },
  });

  await prisma.shopConnection.upsert({
    where: { shopDomain: params.shopDomain },
    update: {
      accessTokenEncrypted: params.accessTokenEncrypted,
      scope: params.scope,
      uninstalledAt: null,
    },
    create: {
      tenantId: tenant.id,
      shopDomain: params.shopDomain,
      accessTokenEncrypted: params.accessTokenEncrypted,
      scope: params.scope,
    },
  });

  await prisma.brandProfile.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      brandName: tenantSlug,
      primaryDomain: params.shopDomain,
      voiceSummary: "Helpful, brand-safe expert voice",
      internalLinkRules: [],
      complianceNotes: [],
    },
  });

  await prisma.contentPolicy.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      approvalRequired: true,
      searchLocale: "google.ie",
      imageProvider: "gemini",
      llmProvider: "openai",
      publishCadenceHours: [10, 13, 16],
    },
  });

  await prisma.publishSchedule.upsert({
    where: { tenantId: tenant.id },
    update: {
      localHours: assertValidLocalHours([10, 13, 16]),
    },
    create: {
      tenantId: tenant.id,
      timezone: "Europe/Dublin",
      localHours: [10, 13, 16],
      approvalRequired: true,
    },
  });

  await ensureDefaultSubscription(tenant.id);
  await seedTenantPromptTemplates(tenant.id);

  return tenant;
}

export async function markShopUninstalled(shopDomain: string) {
  return prisma.shopConnection.update({
    where: { shopDomain },
    data: {
      uninstalledAt: new Date(),
    },
  });
}

export async function updateTenantSchedule(tenantId: string, localHours: number[], approvalRequired: boolean) {
  const normalizedHours = assertValidLocalHours(localHours);
  await prisma.contentPolicy.update({
    where: { tenantId },
    data: { approvalRequired, publishCadenceHours: normalizedHours },
  });

  return prisma.publishSchedule.upsert({
    where: { tenantId },
    update: {
      localHours: normalizedHours,
      approvalRequired,
    },
    create: {
      tenantId,
      timezone: "Europe/Dublin",
      localHours: normalizedHours,
      approvalRequired,
    },
  });
}
