"use client";

import { useState, useTransition } from "react";

type BrandProfileFormProps = {
  tenantId: string;
  initialValues: {
    brandName: string;
    primaryDomain: string;
    marketCountryCode: string;
    preferredSpelling: string;
    voiceSummary: string;
    internalLinkRules: string[];
    complianceNotes: string[];
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

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function BrandProfileForm({ tenantId, initialValues }: BrandProfileFormProps) {
  const [brandName, setBrandName] = useState(initialValues.brandName);
  const [primaryDomain, setPrimaryDomain] = useState(initialValues.primaryDomain);
  const [marketCountryCode, setMarketCountryCode] = useState(initialValues.marketCountryCode);
  const [preferredSpelling, setPreferredSpelling] = useState(initialValues.preferredSpelling);
  const [voiceSummary, setVoiceSummary] = useState(initialValues.voiceSummary);
  const [internalLinkRules, setInternalLinkRules] = useState(initialValues.internalLinkRules.join("\n"));
  const [complianceNotes, setComplianceNotes] = useState(initialValues.complianceNotes.join("\n"));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/settings/brand-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          brandName,
          primaryDomain,
          marketCountryCode,
          preferredSpelling,
          voiceSummary,
          internalLinkRules: splitLines(internalLinkRules),
          complianceNotes: splitLines(complianceNotes),
        }),
      });

      if (!response.ok) {
        setMessage(`Save failed: ${await response.text()}`);
        return;
      }

      setMessage("Brand profile saved.");
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
        <label style={labelStyle}>
          Brand name
          <input value={brandName} onChange={(event) => setBrandName(event.target.value)} style={fieldStyle} />
        </label>
        <label style={labelStyle}>
          Primary domain
          <input value={primaryDomain} onChange={(event) => setPrimaryDomain(event.target.value)} style={fieldStyle} />
        </label>
        <label style={labelStyle}>
          Market country
          <input
            value={marketCountryCode}
            maxLength={2}
            onChange={(event) => setMarketCountryCode(event.target.value.toUpperCase())}
            style={fieldStyle}
          />
        </label>
        <label style={labelStyle}>
          Preferred spelling
          <input value={preferredSpelling} onChange={(event) => setPreferredSpelling(event.target.value)} style={fieldStyle} />
        </label>
      </div>

      <label style={labelStyle}>
        Voice summary
        <textarea
          value={voiceSummary}
          onChange={(event) => setVoiceSummary(event.target.value)}
          rows={4}
          style={fieldStyle}
        />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
        <label style={labelStyle}>
          Internal linking rules
          <textarea
            value={internalLinkRules}
            onChange={(event) => setInternalLinkRules(event.target.value)}
            rows={6}
            style={fieldStyle}
          />
        </label>
        <label style={labelStyle}>
          Compliance notes
          <textarea
            value={complianceNotes}
            onChange={(event) => setComplianceNotes(event.target.value)}
            rows={6}
            style={fieldStyle}
          />
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
          {isPending ? "Saving..." : "Save brand profile"}
        </button>
        {message ? <span style={{ color: message.startsWith("Save failed") ? "#991b1b" : "#166534" }}>{message}</span> : null}
      </div>
    </form>
  );
}
