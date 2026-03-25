import { DataTable, ExternalTextLink } from "../../../components/data-table";
import { Panel } from "../../../components/panel";
import { StatusBadge } from "../../../components/status-badge";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";

function getDraftTone(status: string) {
  if (status === "published") {
    return "success" as const;
  }
  if (status === "awaiting_approval" || status === "draft_ready") {
    return "warning" as const;
  }
  if (status === "failed") {
    return "danger" as const;
  }
  return "neutral" as const;
}

export default async function DraftsPage() {
  const snapshot = await getMerchantConsoleSnapshot();

  return (
    <Panel
      title="Drafts"
      description="Canonical draft storage lives in Postgres with markdown, HTML, FAQ, CTA, image, and publish state in one place."
    >
      <DataTable
        rows={snapshot.drafts}
        emptyLabel="No drafts available yet."
        columns={[
          {
            key: "title",
            label: "Draft",
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
            render: (row) => <StatusBadge label={row.status} tone={getDraftTone(row.status)} />,
          },
          {
            key: "publishStatus",
            label: "Publish",
            render: (row) => row.publishStatus,
          },
          {
            key: "updatedAt",
            label: "Updated",
            render: (row) => row.updatedAt,
          },
          {
            key: "liveUrl",
            label: "Live URL",
            render: (row) =>
              row.liveUrl ? <ExternalTextLink href={row.liveUrl} label="Open article" /> : <span>-</span>,
          },
        ]}
      />
    </Panel>
  );
}
