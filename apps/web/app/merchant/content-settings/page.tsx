import { ContentPolicyForm } from "../../../components/content-policy-form";
import { Panel } from "../../../components/panel";
import { SummaryCard } from "../../../components/summary-card";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";
import { resolveTenantSlug, type PageSearchParams } from "../../../lib/tenant-query";

type ContentSettingsPageProps = {
  searchParams: PageSearchParams;
};

export default async function ContentSettingsPage({ searchParams }: ContentSettingsPageProps) {
  const tenantSlug = await resolveTenantSlug(searchParams);
  const snapshot = await getMerchantConsoleSnapshot(tenantSlug);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <SummaryCard label="Prompt Templates" value={String(snapshot.counts.promptTemplates)} helper="Versioned seed set per tenant" />
        <SummaryCard label="Max Drafts / Day" value={String(snapshot.contentPolicy.maxDraftsPerDay)} helper="Worker-enforced daily ceiling" />
        <SummaryCard label="Search Locale" value={snapshot.contentPolicy.searchLocale} helper="Provider locale bias" />
      </div>

      <Panel
        title="Content Settings"
        description="Prompt versions, cadence, and provider choices are configured per tenant instead of being scattered across Airtable and n8n."
      >
        <ContentPolicyForm
          tenantId={snapshot.tenant.id}
          initialValues={{
            searchLocale: snapshot.contentPolicy.searchLocale,
            llmProvider: snapshot.contentPolicy.llmProvider,
            imageProvider: snapshot.contentPolicy.imageProvider,
            maxDraftsPerDay: snapshot.contentPolicy.maxDraftsPerDay,
          }}
        />
      </Panel>
    </section>
  );
}
