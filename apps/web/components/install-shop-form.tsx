"use client";

import { useState } from "react";

const fieldStyle = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  padding: ".9rem 1rem",
  fontSize: "1rem",
  fontFamily: "inherit",
  background: "#fff",
} as const;

export function InstallShopForm() {
  const [shop, setShop] = useState("");

  const normalizedShop = shop.trim().replace(/^https?:\/\//, "");
  const authorizeHref = normalizedShop ? `/auth/shopify/start?shop=${encodeURIComponent(normalizedShop)}` : "#";

  return (
    <form
      action={authorizeHref}
      style={{
        display: "grid",
        gap: "1rem",
      }}
    >
      <label style={{ display: "grid", gap: ".45rem", fontWeight: 600, color: "#111827" }}>
        Shopify store domain
        <input
          value={shop}
          onChange={(event) => setShop(event.target.value)}
          placeholder="your-store.myshopify.com"
          style={fieldStyle}
        />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: ".9rem", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={!normalizedShop}
          style={{
            border: 0,
            borderRadius: 999,
            padding: ".85rem 1.25rem",
            background: normalizedShop ? "#0f172a" : "#94a3b8",
            color: "#fff",
            fontWeight: 700,
            cursor: normalizedShop ? "pointer" : "not-allowed",
          }}
        >
          Connect Shopify
        </button>
        <span style={{ color: "#4b5563" }}>OAuth will install the app and create the tenant automatically.</span>
      </div>
    </form>
  );
}
