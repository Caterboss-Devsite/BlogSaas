type SummaryCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function SummaryCard({ label, value, helper }: SummaryCardProps) {
  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: "1rem 1.1rem",
        display: "grid",
        gap: ".35rem",
      }}
    >
      <span style={{ color: "#6b7280", fontSize: ".9rem" }}>{label}</span>
      <strong style={{ fontSize: "1.5rem", lineHeight: 1.1 }}>{value}</strong>
      {helper ? <span style={{ color: "#4b5563", fontSize: ".92rem" }}>{helper}</span> : null}
    </article>
  );
}
