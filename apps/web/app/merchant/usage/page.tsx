import { DataTable } from "../../../components/data-table";
import { Panel } from "../../../components/panel";
import { SummaryCard } from "../../../components/summary-card";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";

export default async function UsagePage() {
  const snapshot = await getMerchantConsoleSnapshot();

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <SummaryCard label="Drafts Generated" value={String(snapshot.usage.draftsGenerated)} />
        <SummaryCard label="Images Generated" value={String(snapshot.usage.imagesGenerated)} />
        <SummaryCard label="Publishes Completed" value={String(snapshot.usage.publishesCompleted)} />
        <SummaryCard label="Estimated Spend" value={`€${snapshot.usage.estimatedSpend.toFixed(2)}`} />
      </div>

      <Panel
        title="Usage"
        description="Every expensive operation is metered per tenant so pricing, limits, and spend caps are enforceable in the worker layer."
      >
        <DataTable
          rows={snapshot.usageRows.map((row, index) => ({ id: `${row.metric}-${index}`, ...row }))}
          emptyLabel="No usage entries yet."
          columns={[
            {
              key: "metric",
              label: "Metric",
              render: (row) => row.metric,
            },
            {
              key: "quantity",
              label: "Quantity",
              render: (row) => row.quantity.toString(),
            },
            {
              key: "estimatedCost",
              label: "Estimated Cost",
              render: (row) => `€${row.estimatedCost.toFixed(2)}`,
            },
          ]}
        />
      </Panel>
    </section>
  );
}
