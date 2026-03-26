import Link from "next/link";

import { Panel } from "../../components/panel";
import { SummaryCard } from "../../components/summary-card";
import { getConnectedTenantSummaries } from "../../lib/merchant-console";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const tenants = await getConnectedTenantSummaries();

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem", display: "grid", gap: "1.5rem" }}>
      <header style={{ display: "grid", gap: ".75rem" }}>
        <p style={{ margin: 0, fontSize: ".9rem", textTransform: "uppercase", color: "#92400e" }}>
          Agency admin
        </p>
        <h1 style={{ margin: 0, fontSize: "2.6rem" }}>Connected Shopify stores</h1>
        <p style={{ margin: 0, lineHeight: 1.7, color: "#374151" }}>
          This is the agency control plane for installed tenants. Connect new stores from the install page, then open the merchant console for per-store settings.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <SummaryCard label="Installed stores" value={String(tenants.length)} helper="Active tenant connections" />
        <SummaryCard
          label="Drafts in system"
          value={String(tenants.reduce((sum, tenant) => sum + tenant.draftCount, 0))}
          helper="Across all connected tenants"
        />
        <SummaryCard
          label="Topics in system"
          value={String(tenants.reduce((sum, tenant) => sum + tenant.topicCount, 0))}
          helper="Backlog and research records"
        />
      </div>

      <Panel title="Tenant list" action={<Link href="/install">Connect new store</Link>}>
        {tenants.length === 0 ? (
          <p style={{ margin: 0, color: "#4b5563" }}>No connected stores yet.</p>
        ) : (
          <div style={{ display: "grid", gap: ".9rem" }}>
            {tenants.map((tenant) => (
              <article
                key={tenant.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 18,
                  padding: "1rem 1.1rem",
                  display: "grid",
                  gap: ".6rem",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: ".15rem" }}>
                    <strong>{tenant.name}</strong>
                    <span style={{ color: "#4b5563" }}>{tenant.shopDomain}</span>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <Link href={`/merchant?tenant=${tenant.slug}`}>Merchant console</Link>
                    <Link href={`/onboarding?tenant=${tenant.slug}`}>Onboarding</Link>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", color: "#4b5563" }}>
                  <span>Status: {tenant.status}</span>
                  <span>Plan: {tenant.monthlyPlan}</span>
                  <span>Drafts: {tenant.draftCount}</span>
                  <span>Topics: {tenant.topicCount}</span>
                  <span>Installed: {tenant.installedAt}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </main>
  );
}
