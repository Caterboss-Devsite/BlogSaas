import { Panel } from "../../../components/panel";
import { SummaryCard } from "../../../components/summary-card";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";
import { resolveTenantSlug, type PageSearchParams } from "../../../lib/tenant-query";

type GoogleDocsPageProps = {
  searchParams: PageSearchParams;
};

export default async function GoogleDocsPage({ searchParams }: GoogleDocsPageProps) {
  const tenantSlug = await resolveTenantSlug(searchParams);
  const snapshot = await getMerchantConsoleSnapshot(tenantSlug);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <SummaryCard label="Mode" value={snapshot.googleDocs.mode} helper="Not the system of record" />
        <SummaryCard label="Export" value={snapshot.googleDocs.exportEnabled ? "Enabled" : "Disabled"} />
        <SummaryCard label="Sync" value={snapshot.googleDocs.syncEnabled ? "Enabled" : "Disabled"} />
      </div>

      <Panel
        title="Google Docs Export"
        description="Google Docs is optional in the new system. It becomes an export or sync surface, not the place where the app stores truth."
      >
        <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: ".55rem" }}>
          <li>Export approved drafts to Docs for merchant-side editing.</li>
          <li>Sync edited drafts back into the canonical draft record when enabled.</li>
          <li>Disable Docs entirely per tenant without breaking generation or publish jobs.</li>
        </ul>
      </Panel>
    </section>
  );
}
