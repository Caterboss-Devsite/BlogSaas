import { Panel } from "../../../components/panel";
import { PublishScheduleForm } from "../../../components/publish-schedule-form";
import { SummaryCard } from "../../../components/summary-card";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";
import { resolveTenantSlug, type PageSearchParams } from "../../../lib/tenant-query";

type PublishCalendarPageProps = {
  searchParams: PageSearchParams;
};

export default async function PublishCalendarPage({ searchParams }: PublishCalendarPageProps) {
  const tenantSlug = await resolveTenantSlug(searchParams);
  const snapshot = await getMerchantConsoleSnapshot(tenantSlug);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <SummaryCard label="Timezone" value={snapshot.publishSchedule.timezone} />
        <SummaryCard label="Windows" value={String(snapshot.publishSchedule.localHours.length)} helper="Daily publish slots" />
        <SummaryCard
          label="Approval"
          value={snapshot.contentPolicy.approvalRequired ? "Required" : "Off"}
          helper="Global tenant publish gate"
        />
      </div>

      <Panel
        title="Publish Calendar"
        description="Publish windows are stored per tenant and used by queued publish jobs rather than hard-coded cron combinations."
      >
        <PublishScheduleForm
          tenantId={snapshot.tenant.id}
          initialValues={{
            timezone: snapshot.publishSchedule.timezone,
            localHours: snapshot.publishSchedule.localHours,
            approvalRequired: snapshot.contentPolicy.approvalRequired,
          }}
        />
      </Panel>
    </section>
  );
}
