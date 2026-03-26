import Link from "next/link";

import { OnboardingForm } from "../../components/onboarding-form";
import { Panel } from "../../components/panel";
import { getMerchantConsoleSnapshot } from "../../lib/merchant-console";
import { resolveTenantSlug, type PageSearchParams } from "../../lib/tenant-query";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams: PageSearchParams;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const tenantSlug = await resolveTenantSlug(searchParams);
  const snapshot = await getMerchantConsoleSnapshot(tenantSlug);
  const merchantHref = `/merchant${tenantSlug ? `?tenant=${tenantSlug}` : ""}`;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem", display: "grid", gap: "1.5rem" }}>
      <header style={{ display: "grid", gap: ".75rem" }}>
        <p style={{ margin: 0, fontSize: ".9rem", textTransform: "uppercase", color: "#92400e" }}>
          Post-install setup
        </p>
        <h1 style={{ margin: 0, fontSize: "2.6rem" }}>Finish setup for {snapshot.tenant.name}</h1>
        <p style={{ margin: 0, lineHeight: 1.7, color: "#374151" }}>
          This is the quick-start page after Shopify OAuth. Save the core settings here, then continue into the merchant console for detailed review and operations.
        </p>
      </header>

      <Panel
        title="Quick setup"
        description="Brand, locale, cadence, and approval settings that determine how this tenant behaves from day one."
        action={<Link href={merchantHref}>Open merchant console</Link>}
      >
        <OnboardingForm
          tenantId={snapshot.tenant.id}
          tenantSlug={snapshot.tenant.slug}
          initialValues={{
            brandName: snapshot.brandProfile.brandName,
            primaryDomain: snapshot.shop.primaryDomain,
            marketCountryCode: snapshot.brandProfile.marketCountryCode,
            preferredSpelling: snapshot.brandProfile.preferredSpelling,
            voiceSummary: snapshot.brandProfile.voiceSummary,
            searchLocale: snapshot.contentPolicy.searchLocale,
            llmProvider: snapshot.contentPolicy.llmProvider,
            imageProvider: snapshot.contentPolicy.imageProvider,
            maxDraftsPerDay: snapshot.contentPolicy.maxDraftsPerDay,
            timezone: snapshot.publishSchedule.timezone,
            localHours: snapshot.publishSchedule.localHours,
            approvalRequired: snapshot.contentPolicy.approvalRequired,
          }}
        />
      </Panel>
    </main>
  );
}
