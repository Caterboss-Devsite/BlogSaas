import type { PropsWithChildren, ReactNode } from "react";

type PanelProps = PropsWithChildren<{
  title?: string;
  description?: string;
  action?: ReactNode;
}>;

export function Panel({ title, description, action, children }: PanelProps) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        padding: "1.25rem",
        display: "grid",
        gap: "1rem",
        boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      {(title || description || action) && (
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ display: "grid", gap: ".35rem" }}>
            {title ? <h2 style={{ margin: 0, fontSize: "1.05rem" }}>{title}</h2> : null}
            {description ? (
              <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>{description}</p>
            ) : null}
          </div>
          {action ? <div>{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
