import Link from "next/link";

import { getDefaultPromptTemplates } from "@blog-saas/prompt-library";

export default function HomePage() {
  const prompts = getDefaultPromptTemplates();

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem", display: "grid", gap: "2rem" }}>
      <header style={{ display: "grid", gap: ".75rem" }}>
        <p style={{ margin: 0, fontSize: ".9rem", textTransform: "uppercase", color: "#92400e" }}>
          Agency-first public Shopify app foundation
        </p>
        <h1 style={{ margin: 0, fontSize: "2.75rem" }}>Multi-tenant blog automation for Shopify stores</h1>
        <p style={{ margin: 0, lineHeight: 1.7, color: "#374151" }}>
          This app shell replaces Airtable, Google Docs, and n8n in the core runtime while keeping
          the current Blog SaaS prompt system frozen as versioned seed data.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <article style={{ background: "#fff", padding: "1.25rem", borderRadius: 16 }}>
          <h2 style={{ marginTop: 0 }}>Merchant routes</h2>
          <p>Brand settings, draft approval, schedules, billing, and optional Google Docs export.</p>
          <Link href="/merchant">Open merchant console</Link>
        </article>
        <article style={{ background: "#fff", padding: "1.25rem", borderRadius: 16 }}>
          <h2 style={{ marginTop: 0 }}>Install flow</h2>
          <p>Connect a new Shopify store in a few clicks, then finish onboarding from the app.</p>
          <Link href="/install">Connect a new store</Link>
        </article>
        <article style={{ background: "#fff", padding: "1.25rem", borderRadius: 16 }}>
          <h2 style={{ marginTop: 0 }}>API contracts</h2>
          <p>Tenant-scoped routes enqueue BullMQ jobs and persist review decisions.</p>
          <p style={{ marginBottom: 0 }}>Prompt templates seeded: {prompts.length}</p>
        </article>
        <article style={{ background: "#fff", padding: "1.25rem", borderRadius: 16 }}>
          <h2 style={{ marginTop: 0 }}>Agency admin</h2>
          <p>View connected stores and jump into each merchant console or onboarding flow.</p>
          <Link href="/admin">Open agency admin</Link>
        </article>
      </section>
    </main>
  );
}
