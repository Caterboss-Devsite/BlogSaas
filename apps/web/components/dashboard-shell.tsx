"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PropsWithChildren } from "react";

const links = [
  ["Overview", "/merchant"],
  ["Brand Profile", "/merchant/brand-profile"],
  ["Content Settings", "/merchant/content-settings"],
  ["Topic Backlog", "/merchant/topic-backlog"],
  ["Drafts", "/merchant/drafts"],
  ["Approval Queue", "/merchant/approval-queue"],
  ["Publish Calendar", "/merchant/publish-calendar"],
  ["Usage", "/merchant/usage"],
  ["Billing", "/merchant/billing"],
  ["Google Docs", "/merchant/google-docs"],
  ["Admin", "/admin"],
  ["Install Store", "/install"],
] as const;

export function DashboardShell({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();
  const tenant = searchParams.get("tenant");

  const withTenant = (href: string) => {
    if (!tenant || !href.startsWith("/merchant")) {
      return href;
    }

    const separator = href.includes("?") ? "&" : "?";
    return `${href}${separator}tenant=${encodeURIComponent(tenant)}`;
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f6f8fb 0%, #eef4ff 100%)",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #e5e7eb",
          padding: "2rem 1.25rem",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: ".78rem",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#93c5fd",
          }}
        >
          Merchant Console
        </p>
        <h1 style={{ margin: ".4rem 0 0", fontSize: "1.5rem" }}>Blog SaaS</h1>
        <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
          Agency-first content operations for multi-tenant Shopify blog automation.
        </p>
        <nav style={{ display: "grid", gap: ".35rem", marginTop: "1.75rem" }}>
          {links.map(([label, href]) => (
            <Link
              key={`${href}-${tenant ?? "default"}`}
              href={withTenant(href)}
              style={{
                color: "#e2e8f0",
                textDecoration: "none",
                padding: ".65rem .8rem",
                borderRadius: 12,
                background: "rgba(148, 163, 184, 0.08)",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ padding: "2rem 2.25rem" }}>{children}</main>
    </div>
  );
}
