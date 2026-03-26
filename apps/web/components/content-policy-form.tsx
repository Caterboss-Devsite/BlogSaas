"use client";

import { useState, useTransition } from "react";

type ContentPolicyFormProps = {
  tenantId: string;
  initialValues: {
    searchLocale: string;
    llmProvider: string;
    imageProvider: string;
    maxDraftsPerDay: number;
  };
};

const fieldStyle = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  padding: ".8rem .9rem",
  fontSize: ".95rem",
  fontFamily: "inherit",
  background: "#fff",
} as const;

const labelStyle = {
  display: "grid",
  gap: ".4rem",
  color: "#111827",
  fontWeight: 600,
} as const;

export function ContentPolicyForm({ tenantId, initialValues }: ContentPolicyFormProps) {
  const [searchLocale, setSearchLocale] = useState(initialValues.searchLocale);
  const [llmProvider, setLlmProvider] = useState(initialValues.llmProvider);
  const [imageProvider, setImageProvider] = useState(initialValues.imageProvider);
  const [maxDraftsPerDay, setMaxDraftsPerDay] = useState(String(initialValues.maxDraftsPerDay));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/settings/content-policy", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          searchLocale,
          llmProvider,
          imageProvider,
          maxDraftsPerDay: Number(maxDraftsPerDay),
        }),
      });

      if (!response.ok) {
        setMessage(`Save failed: ${await response.text()}`);
        return;
      }

      setMessage("Content settings saved.");
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
        <label style={labelStyle}>
          Search locale
          <input value={searchLocale} onChange={(event) => setSearchLocale(event.target.value)} style={fieldStyle} />
        </label>
        <label style={labelStyle}>
          Max drafts per day
          <input
            type="number"
            min={1}
            max={50}
            value={maxDraftsPerDay}
            onChange={(event) => setMaxDraftsPerDay(event.target.value)}
            style={fieldStyle}
          />
        </label>
        <label style={labelStyle}>
          LLM provider
          <select value={llmProvider} onChange={(event) => setLlmProvider(event.target.value)} style={fieldStyle}>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Gemini</option>
          </select>
        </label>
        <label style={labelStyle}>
          Image provider
          <select value={imageProvider} onChange={(event) => setImageProvider(event.target.value)} style={fieldStyle}>
            <option value="gemini">Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ".9rem", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            border: 0,
            borderRadius: 999,
            padding: ".8rem 1.2rem",
            background: "#0f172a",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isPending ? "Saving..." : "Save content settings"}
        </button>
        {message ? <span style={{ color: message.startsWith("Save failed") ? "#991b1b" : "#166534" }}>{message}</span> : null}
      </div>
    </form>
  );
}
