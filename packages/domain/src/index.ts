import { randomUUID } from "node:crypto";
import { z } from "zod";

export const tenantStatusValues = ["active", "paused", "disabled"] as const;
export const draftStatusValues = [
  "idea",
  "researching",
  "draft_ready",
  "awaiting_approval",
  "scheduled",
  "rejected",
  "published",
  "failed",
] as const;
export const publishStatusValues = ["queued", "publishing", "published", "failed"] as const;
export const subscriptionStatusValues = ["trialing", "active", "past_due", "canceled"] as const;
export const usageMetricValues = ["draft_generated", "image_generated", "publish_completed"] as const;
export const jobKindValues = [
  "topic_backlog_generate",
  "topic_research",
  "draft_generate",
  "draft_edit",
  "faq_finalize",
  "image_generate",
  "await_approval",
  "publish_shopify",
  "sync_metrics",
] as const;

export const TenantStatusSchema = z.enum(tenantStatusValues);
export const DraftStatusSchema = z.enum(draftStatusValues);
export const PublishStatusSchema = z.enum(publishStatusValues);
export const SubscriptionStatusSchema = z.enum(subscriptionStatusValues);
export const UsageMetricSchema = z.enum(usageMetricValues);
export const JobKindSchema = z.enum(jobKindValues);

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  countryCode: z.string().length(2).default("IE"),
  status: TenantStatusSchema.default("active"),
});

export const ShopConnectionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  shopDomain: z.string().min(1),
  accessTokenEncrypted: z.string().min(1),
  scope: z.string().min(1),
});

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  planKey: z.string().min(1),
  status: SubscriptionStatusSchema.default("trialing"),
  monthlyDraftLimit: z.number().int().positive(),
  monthlyImageLimit: z.number().int().positive(),
  monthlyPublishLimit: z.number().int().positive(),
});

export const BrandProfileSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  brandName: z.string().min(1),
  primaryDomain: z.string().min(1),
  marketCountryCode: z.string().length(2).default("IE"),
  voiceSummary: z.string().min(1),
  preferredSpelling: z.string().default("en-IE"),
  internalLinkRules: z.array(z.string()).default([]),
  complianceNotes: z.array(z.string()).default([]),
});

export const ContentPolicySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  approvalRequired: z.boolean().default(true),
  defaultLanguage: z.string().default("en"),
  searchLocale: z.string().default("google.ie"),
  imageProvider: z.string().default("gemini"),
  llmProvider: z.string().default("openai"),
  maxDraftsPerDay: z.number().int().positive().default(3),
  publishCadenceHours: z.array(z.number().int().min(0).max(23)).default([10, 13, 16]),
});

export const PublishScheduleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  timezone: z.string().default("Europe/Dublin"),
  localHours: z.array(z.number().int().min(0).max(23)).min(1).max(6),
  approvalRequired: z.boolean().default(true),
});

export const TopicSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  keyword: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(["backlog", "researching", "approved", "rejected"]).default("backlog"),
  notes: z.string().optional(),
});

export const DraftSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  topicId: z.string().uuid(),
  status: DraftStatusSchema.default("idea"),
  title: z.string().min(1),
  bodyMarkdown: z.string().default(""),
  bodyHtml: z.string().default(""),
  faqMarkdown: z.string().default(""),
  ctaMarkdown: z.string().default(""),
  publishStatus: PublishStatusSchema.default("queued"),
});

export const ImageAssetSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  draftId: z.string().uuid(),
  provider: z.string().min(1),
  prompt: z.string().min(1),
  storageKey: z.string().min(1),
  altText: z.string().min(1),
});

export const PromptTemplateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable().default(null),
  key: z.string().min(1),
  version: z.number().int().positive(),
  usedIn: z.array(z.string()).default([]),
  systemPrompt: z.string().min(1),
  formatLabel: z.string().nullable().default(null),
  isDefault: z.boolean().default(true),
});

export const JobRunSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  jobKind: JobKindSchema,
  correlationId: z.string().uuid(),
  attempt: z.number().int().min(1).default(1),
  status: z.enum(["queued", "running", "completed", "failed"]).default("queued"),
  payload: z.record(z.string(), z.unknown()),
});

export const UsageLedgerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  metric: UsageMetricSchema,
  quantity: z.number().positive(),
  estimatedCost: z.number().nonnegative().default(0),
  correlationId: z.string().uuid(),
});

const TenantScopedSchema = z.object({
  tenantId: z.string().uuid(),
});

export const GenerateTopicsRequestSchema = TenantScopedSchema.extend({
  requestedBy: z.string().min(1),
  count: z.number().int().min(1).max(20).default(3),
  seedKeyword: z.string().min(1).optional(),
});

export const ApproveDraftRequestSchema = TenantScopedSchema.extend({
  reviewedBy: z.string().min(1),
  publishAt: z.string().datetime().optional(),
});

export const RejectDraftRequestSchema = TenantScopedSchema.extend({
  reviewedBy: z.string().min(1),
  reason: z.string().min(1),
});

export const RegenerateDraftRequestSchema = TenantScopedSchema.extend({
  requestedBy: z.string().min(1),
  reason: z.string().min(1),
  stage: z.enum(["research", "draft", "faq", "image"]).default("draft"),
});

export const RunPublishRequestSchema = TenantScopedSchema.extend({
  requestedBy: z.string().min(1),
});

export const UpdateScheduleRequestSchema = TenantScopedSchema.extend({
  timezone: z.string().min(1).default("Europe/Dublin"),
  localHours: z.array(z.number().int().min(0).max(23)).min(1).max(6),
  approvalRequired: z.boolean().default(true),
});

export const UpdateBrandProfileRequestSchema = TenantScopedSchema.extend({
  brandName: z.string().min(1),
  primaryDomain: z.string().min(1),
  marketCountryCode: z.string().length(2).default("IE"),
  preferredSpelling: z.string().min(1).default("en-IE"),
  voiceSummary: z.string().min(1),
  internalLinkRules: z.array(z.string()).default([]),
  complianceNotes: z.array(z.string()).default([]),
});

export const UpdateContentPolicyRequestSchema = TenantScopedSchema.extend({
  searchLocale: z.string().min(1),
  llmProvider: z.string().min(1),
  imageProvider: z.string().min(1),
  maxDraftsPerDay: z.number().int().positive(),
});

export const WorkerJobPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  shopId: z.string().uuid().optional(),
  draftId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  templateVersion: z.number().int().positive(),
  attempt: z.number().int().min(1).default(1),
  correlationId: z.string().uuid(),
});

export type JobKind = z.infer<typeof JobKindSchema>;
export type WorkerJobPayload = z.infer<typeof WorkerJobPayloadSchema>;
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

export function createCorrelationId() {
  return randomUUID();
}

export function assertValidLocalHours(localHours: number[]) {
  return Array.from(new Set(UpdateScheduleRequestSchema.shape.localHours.parse(localHours))).sort(
    (left, right) => left - right,
  );
}
