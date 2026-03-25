import { Panel } from "../../../components/panel";
import { getMerchantConsoleSnapshot } from "../../../lib/merchant-console";

export default async function BrandProfilePage() {
  const snapshot = await getMerchantConsoleSnapshot();

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <Panel
        title="Brand Profile"
        description="Tenant-owned brand voice, domain rules, and compliance settings replace the old config doc path."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
          <div>
            <strong>Brand</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>{snapshot.brandProfile.brandName}</p>
          </div>
          <div>
            <strong>Primary domain</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>{snapshot.shop.primaryDomain}</p>
          </div>
          <div>
            <strong>Market</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>
              {snapshot.brandProfile.marketCountryCode} / {snapshot.brandProfile.preferredSpelling}
            </p>
          </div>
          <div>
            <strong>Store connection</strong>
            <p style={{ margin: ".35rem 0 0", color: "#4b5563" }}>{snapshot.shop.domain}</p>
          </div>
        </div>
      </Panel>

      <Panel title="Voice Summary">
        <p style={{ margin: 0, lineHeight: 1.7, color: "#374151" }}>{snapshot.brandProfile.voiceSummary}</p>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
        <Panel title="Internal Linking Rules">
          <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: ".5rem" }}>
            {snapshot.brandProfile.internalLinkRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Compliance Notes">
          <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: ".5rem" }}>
            {snapshot.brandProfile.complianceNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  );
}
