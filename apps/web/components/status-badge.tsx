type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

const badgeStyles: Record<NonNullable<StatusBadgeProps["tone"]>, { background: string; color: string }> = {
  neutral: { background: "#e5e7eb", color: "#1f2937" },
  success: { background: "#dcfce7", color: "#166534" },
  warning: { background: "#fef3c7", color: "#92400e" },
  danger: { background: "#fee2e2", color: "#991b1b" },
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const style = badgeStyles[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: ".3rem .65rem",
        borderRadius: 999,
        fontSize: ".82rem",
        fontWeight: 600,
        background: style.background,
        color: style.color,
      }}
    >
      {label}
    </span>
  );
}
