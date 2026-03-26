import Link from "next/link";

import { InstallShopForm } from "../../components/install-shop-form";
import { Panel } from "../../components/panel";
import { getConnectedTenantSummaries } from "../../lib/merchant-console";

export const dynamic = "force-dynamic";

export default async function InstallPage() {
  const tenants = await getConnectedTenantSummaries();

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem", display: "grid", gap: "1.5rem" }}>
      <header style={{ display: "grid", gap: ".75rem" }}>
        <p style={{ margin: 0, fontSize: ".9rem", textTransform: "uppercase", color: "#92400e" }}>
          Shopify onboarding
        </p>
        <h1 style={{ margin: 0, fontSize: "2.6rem" }}>Connect a new store in a few clicks</h1>
        <p style={{ margin: 0, lineHeight: 1.7, color: "#374151" }}>
          Enter the Shopify domain, complete OAuth, then finish the tenant setup from the onboarding screen.
        </p>
      </header>

      <Panel
        title="Connect Shopify"
        description="The app install creates the tenant, stores the offline token, seeds prompt templates, and opens onboarding."
      >
        <InstallShopForm />
      </Panel>

      <Panel
        title="Already connected stores"
        description="Use the merchant console for an installed store or go to the agency admin list."
        action={<Link href="/admin">Open agency admin</Link>}
      >
        {tenants.length === 0 ? (
          <p style={{ margin: 0, color: "#4b5563" }}>No stores connected yet.</p>
        ) : (
          <div style={{ display: "grid", gap: ".75rem" }}>
            {tenants.map((tenant) => (
              <article
                key={tenant.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  background: "#fff",
                }}
              >
                <div style={{ display: "grid", gap: ".2rem" }}>
                  <strong>{tenant.name}</strong>
                  <span style={{ color: "#4b5563" }}>{tenant.shopDomain}</span>
                </div>
                <Link href={`/merchant?tenant=${tenant.slug}`}>Open merchant console</Link>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </main>
  );
}
