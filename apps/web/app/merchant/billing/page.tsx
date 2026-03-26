import { Panel } from "../../../components/panel";
import { SummaryCard } from "../../../components/summary-card";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";
import { resolveTenantSlug, type PageSearchParams } from "../../../lib/tenant-query";

type BillingPageProps = {
  searchParams: PageSearchParams;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const tenantSlug = await resolveTenantSlug(searchParams);
  const snapshot = await getMerchantConsoleSnapshot(tenantSlug);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <SummaryCard label="Plan" value={snapshot.subscription.planKey} helper={snapshot.subscription.status} />
        <SummaryCard label="Draft Limit" value={String(snapshot.subscription.monthlyDraftLimit)} helper="Monthly allowance" />
        <SummaryCard label="Image Limit" value={String(snapshot.subscription.monthlyImageLimit)} helper="Monthly allowance" />
        <SummaryCard label="Publish Limit" value={String(snapshot.subscription.monthlyPublishLimit)} helper="Monthly allowance" />
      </div>

      <Panel
        title="Billing"
        description="The billing surface is ready for Shopify subscription state, plan limits, and agency override flows."
      >
        <p style={{ margin: 0, lineHeight: 1.7, color: "#374151" }}>
          Plan limits are enforced in the worker layer before expensive model calls. Shopify billing wiring still
          needs to be connected once the public app distribution path is turned on.
        </p>
      </Panel>
    </section>
  );
}
