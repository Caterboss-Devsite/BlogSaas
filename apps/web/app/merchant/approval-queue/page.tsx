import { DataTable } from "../../../components/data-table";
import { Panel } from "../../../components/panel";
import { StatusBadge } from "../../../components/status-badge";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";
import { resolveTenantSlug, type PageSearchParams } from "../../../lib/tenant-query";

type ApprovalQueuePageProps = {
  searchParams: PageSearchParams;
};

export default async function ApprovalQueuePage({ searchParams }: ApprovalQueuePageProps) {
  const tenantSlug = await resolveTenantSlug(searchParams);
  const snapshot = await getMerchantConsoleSnapshot(tenantSlug);

  return (
    <Panel
      title="Approval Queue"
      description="Approval-required publishing is the default. Drafts stay blocked here until reviewed."
    >
      <DataTable
        rows={snapshot.approvalQueue}
        emptyLabel="No drafts are awaiting approval."
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
            render: (row) => <StatusBadge label={row.status} tone="warning" />,
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
