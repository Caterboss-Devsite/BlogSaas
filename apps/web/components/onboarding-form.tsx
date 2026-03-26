"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

type OnboardingFormProps = {
  tenantId: string;
  tenantSlug: string;
  initialValues: {
    brandName: string;
    primaryDomain: string;
    marketCountryCode: string;
    preferredSpelling: string;
    voiceSummary: string;
    searchLocale: string;
    llmProvider: string;
    imageProvider: string;
    maxDraftsPerDay: number;
    timezone: string;
    localHours: number[];
    approvalRequired: boolean;
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

function parseLocalHours(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((hour) => Number.isInteger(hour) && hour >= 0 && hour <= 23),
    ),
  ).sort((left, right) => left - right);
}

export function OnboardingForm({ tenantId, tenantSlug, initialValues }: OnboardingFormProps) {
  const [brandName, setBrandName] = useState(initialValues.brandName);
  const [primaryDomain, setPrimaryDomain] = useState(initialValues.primaryDomain);
  const [marketCountryCode, setMarketCountryCode] = useState(initialValues.marketCountryCode);
  const [preferredSpelling, setPreferredSpelling] = useState(initialValues.preferredSpelling);
  const [voiceSummary, setVoiceSummary] = useState(initialValues.voiceSummary);
  const [searchLocale, setSearchLocale] = useState(initialValues.searchLocale);
  const [maxDraftsPerDay, setMaxDraftsPerDay] = useState(String(initialValues.maxDraftsPerDay));
  const [timezone, setTimezone] = useState(initialValues.timezone);
  const [localHours, setLocalHours] = useState(initialValues.localHours.join(", "));
  const [approvalRequired, setApprovalRequired] = useState(initialValues.approvalRequired);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const merchantHref = `/merchant?tenant=${tenantSlug}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const brandResponse = await fetch("/api/settings/brand-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          brandName,
          primaryDomain,
          marketCountryCode,
          preferredSpelling,
          voiceSummary,
          internalLinkRules: [],
          complianceNotes: [],
        }),
      });

      if (!brandResponse.ok) {
        setMessage(`Save failed: ${await brandResponse.text()}`);
        return;
      }

      const contentResponse = await fetch("/api/settings/content-policy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          searchLocale,
          llmProvider: initialValues.llmProvider,
          imageProvider: initialValues.imageProvider,
          maxDraftsPerDay: Number(maxDraftsPerDay),
        }),
      });

      if (!contentResponse.ok) {
        setMessage(`Save failed: ${await contentResponse.text()}`);
        return;
      }

      const scheduleResponse = await fetch("/api/settings/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          timezone,
          localHours: parseLocalHours(localHours),
          approvalRequired,
        }),
      });

      if (!scheduleResponse.ok) {
        setMessage(`Save failed: ${await scheduleResponse.text()}`);
        return;
      }

      setMessage("Setup saved. Open the merchant console to review drafts, topics, and schedules.");
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
          Country code
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
          Timezone
          <input value={timezone} onChange={(event) => setTimezone(event.target.value)} style={fieldStyle} />
        </label>
        <label style={labelStyle}>
          Publish hours
          <input value={localHours} onChange={(event) => setLocalHours(event.target.value)} style={fieldStyle} />
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

      <label style={{ display: "flex", alignItems: "center", gap: ".7rem", fontWeight: 600 }}>
        <input
          type="checkbox"
          checked={approvalRequired}
          onChange={(event) => setApprovalRequired(event.target.checked)}
        />
        Require approval before publish
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: ".9rem", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            border: 0,
            borderRadius: 999,
            padding: ".85rem 1.25rem",
            background: "#0f172a",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isPending ? "Saving..." : "Save and open console"}
        </button>
        <Link href={merchantHref}>Skip to merchant console</Link>
      </div>

      {message ? (
        <p style={{ margin: 0, color: message.startsWith("Save failed") ? "#991b1b" : "#166534" }}>{message}</p>
      ) : null}
    </form>
  );
}
