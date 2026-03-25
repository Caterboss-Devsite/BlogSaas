import { Panel } from "../../components/panel";
import { StatusBadge } from "../../components/status-badge";
import { SummaryCard } from "../../components/summary-card";
import { getMerchantConsoleSnapshot } from "../../lib/merchant-console";

export default async function MerchantHomePage() {
  const snapshot = await getMerchantConsoleSnapshot();

  return (
    <section style={{ display: "grid", gap: "1.25rem" }}>
      <header style={{ display: "grid", gap: ".65rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "2rem" }}>{snapshot.tenant.name}</h2>
          <StatusBadge label={snapshot.tenant.status} tone="success" />
          <StatusBadge label={snapshot.source === "database" ? "Live data" : "Demo data"} tone="warning" />
        </div>
        <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>
          Approval-first merchant workspace for {snapshot.shop.primaryDomain}. This surface replaces the old
          Airtable and Google Docs dependency in the core runtime while preserving optional export paths.
        </p>
        {snapshot.databaseError ? (
          <p style={{ margin: 0, color: "#92400e" }}>
            Database fallback active: {snapshot.databaseError}
          </p>
        ) : null}
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <SummaryCard label="Topics" value={String(snapshot.counts.topics)} helper="Current backlog and research items" />
        <SummaryCard label="Drafts" value={String(snapshot.counts.drafts)} helper="Stored in canonical Postgres records" />
        <SummaryCard
          label="Awaiting Approval"
          value={String(snapshot.counts.awaitingApproval)}
          helper="Blocked from publish until reviewed"
        />
        <SummaryCard label="Published" value={String(snapshot.counts.published)} helper="Completed article publishes" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: "1rem" }}>
        <Panel title="Runtime Summary" description="Per-tenant publishing and provider state.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: ".9rem" }}>
            <div>
              <strong>Search locale</strong>
              <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>{snapshot.contentPolicy.searchLocale}</p>
            </div>
            <div>
              <strong>Publish windows</strong>
              <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>
                {snapshot.publishSchedule.nextWindows.join(", ")} {snapshot.publishSchedule.timezone}
              </p>
            </div>
            <div>
              <strong>Providers</strong>
              <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>
                {snapshot.contentPolicy.llmProvider} + {snapshot.contentPolicy.imageProvider}
              </p>
            </div>
            <div>
              <strong>Approval mode</strong>
              <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>
                {snapshot.contentPolicy.approvalRequired ? "Required before publish" : "Auto-publish enabled"}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Monthly Usage" description="Metered operations used for plan enforcement.">
          <div style={{ display: "grid", gap: ".7rem" }}>
            <div>
              <strong>{snapshot.usage.draftsGenerated}</strong>
              <span style={{ color: "#4b5563", marginLeft: ".45rem" }}>drafts generated</span>
            </div>
            <div>
              <strong>{snapshot.usage.imagesGenerated}</strong>
              <span style={{ color: "#4b5563", marginLeft: ".45rem" }}>images generated</span>
            </div>
            <div>
              <strong>{snapshot.usage.publishesCompleted}</strong>
              <span style={{ color: "#4b5563", marginLeft: ".45rem" }}>publishes completed</span>
            </div>
            <div>
              <strong>€{snapshot.usage.estimatedSpend.toFixed(2)}</strong>
              <span style={{ color: "#4b5563", marginLeft: ".45rem" }}>estimated model spend</span>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}
