import { Panel } from "../../../components/panel";
import { SummaryCard } from "../../../components/summary-card";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";

export default async function PublishCalendarPage() {
  const snapshot = await getMerchantConsoleSnapshot();

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
        <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
          {snapshot.publishSchedule.nextWindows.map((windowLabel) => (
            <span
              key={windowLabel}
              style={{
                padding: ".65rem .9rem",
                borderRadius: 999,
                background: "#dbeafe",
                color: "#1d4ed8",
                fontWeight: 600,
              }}
            >
              {windowLabel}
            </span>
          ))}
        </div>
      </Panel>
    </section>
  );
}
