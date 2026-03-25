import { DataTable } from "../../../components/data-table";
import { Panel } from "../../../components/panel";
import { StatusBadge } from "../../../components/status-badge";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";

function getTopicTone(status: string) {
  if (status === "approved") {
    return "success" as const;
  }
  if (status === "researching") {
    return "warning" as const;
  }
  return "neutral" as const;
}

export default async function TopicBacklogPage() {
  const snapshot = await getMerchantConsoleSnapshot();

  return (
    <Panel
      title="Topic Backlog"
      description="Keyword opportunities and approved content ideas queue here before research and drafting jobs run."
    >
      <DataTable
        rows={snapshot.topics}
        emptyLabel="No topics available yet."
        columns={[
          {
            key: "title",
            label: "Topic",
            render: (row) => (
              <div style={{ display: "grid", gap: ".2rem" }}>
                <strong>{row.title}</strong>
                <span style={{ color: "#6b7280" }}>{row.keyword}</span>
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => <StatusBadge label={row.status} tone={getTopicTone(row.status)} />,
          },
          {
            key: "updatedAt",
            label: "Updated",
            render: (row) => row.updatedAt,
          },
        ]}
      />
    </Panel>
  );
}
