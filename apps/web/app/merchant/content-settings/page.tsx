import { Panel } from "../../../components/panel";
import { SummaryCard } from "../../../components/summary-card";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";

export default async function ContentSettingsPage() {
  const snapshot = await getMerchantConsoleSnapshot();

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
          <div>
            <strong>LLM provider</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>{snapshot.contentPolicy.llmProvider}</p>
          </div>
          <div>
            <strong>Image provider</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>{snapshot.contentPolicy.imageProvider}</p>
          </div>
          <div>
            <strong>Publish cadence</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>
              {snapshot.contentPolicy.publishCadenceHours.join(", ")} Dublin time
            </p>
          </div>
          <div>
            <strong>Approval required</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>
              {snapshot.contentPolicy.approvalRequired ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </Panel>
    </section>
  );
}
