"use client";

import { useState, useTransition } from "react";

type PublishScheduleFormProps = {
  tenantId: string;
  initialValues: {
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

export function PublishScheduleForm({ tenantId, initialValues }: PublishScheduleFormProps) {
  const [timezone, setTimezone] = useState(initialValues.timezone);
  const [localHours, setLocalHours] = useState(initialValues.localHours.join(", "));
  const [approvalRequired, setApprovalRequired] = useState(initialValues.approvalRequired);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/settings/schedule", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          timezone,
          localHours: parseLocalHours(localHours),
          approvalRequired,
        }),
      });

      if (!response.ok) {
        setMessage(`Save failed: ${await response.text()}`);
        return;
      }

      setMessage("Publish schedule saved.");
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
        <label style={labelStyle}>
          Timezone
          <input value={timezone} onChange={(event) => setTimezone(event.target.value)} style={fieldStyle} />
        </label>
        <label style={labelStyle}>
          Publish hours
          <input
            value={localHours}
            onChange={(event) => setLocalHours(event.target.value)}
            placeholder="10, 13, 16"
            style={fieldStyle}
          />
        </label>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".7rem",
          fontWeight: 600,
          color: "#111827",
        }}
      >
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
            padding: ".8rem 1.2rem",
            background: "#0f172a",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {isPending ? "Saving..." : "Save publish schedule"}
        </button>
        {message ? <span style={{ color: message.startsWith("Save failed") ? "#991b1b" : "#166534" }}>{message}</span> : null}
      </div>
    </form>
  );
}
