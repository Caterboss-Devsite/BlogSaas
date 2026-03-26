import { BrandProfileForm } from "../../../components/brand-profile-form";
import { Panel } from "../../../components/panel";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";
import { resolveTenantSlug, type PageSearchParams } from "../../../lib/tenant-query";

type BrandProfilePageProps = {
  searchParams: PageSearchParams;
};

export default async function BrandProfilePage({ searchParams }: BrandProfilePageProps) {
  const tenantSlug = await resolveTenantSlug(searchParams);
  const snapshot = await getMerchantConsoleSnapshot(tenantSlug);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <Panel
        title="Brand Profile"
        description="Tenant-owned brand voice, domain rules, and compliance settings replace the old config doc path."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
          <div>
            <strong>Brand</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>{snapshot.brandProfile.brandName}</p>
          </div>
          <div>
            <strong>Primary domain</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>{snapshot.shop.primaryDomain}</p>
          </div>
          <div>
            <strong>Market</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>
              {snapshot.brandProfile.marketCountryCode} / {snapshot.brandProfile.preferredSpelling}
            </p>
          </div>
          <div>
            <strong>Store connection</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>{snapshot.shop.domain}</p>
          </div>
        </div>
      </Panel>

      <Panel title="Voice Summary">
        <BrandProfileForm
          tenantId={snapshot.tenant.id}
          initialValues={{
            brandName: snapshot.brandProfile.brandName,
            primaryDomain: snapshot.shop.primaryDomain,
            marketCountryCode: snapshot.brandProfile.marketCountryCode,
            preferredSpelling: snapshot.brandProfile.preferredSpelling,
            voiceSummary: snapshot.brandProfile.voiceSummary,
            internalLinkRules: snapshot.brandProfile.internalLinkRules,
            complianceNotes: snapshot.brandProfile.complianceNotes,
          }}
        />
      </Panel>
    </section>
  );
}
