import { NextRequest, NextResponse } from "next/server";

import { exchangeShopifyOfflineToken, verifyShopifyHmac } from "../../../../lib/shopify";
import { upsertInstalledShop } from "../../../../lib/persistence";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const shop = params.get("shop");
  const code = params.get("code");

  if (!shop || !code) {
    return NextResponse.json({ error: "Missing shop or code" }, { status: 400 });
  }

  if (!verifyShopifyHmac(params)) {
    return NextResponse.json({ error: "Invalid Shopify HMAC" }, { status: 401 });
  }

  const tokenResponse = await exchangeShopifyOfflineToken(shop, code);
  const tenant = await upsertInstalledShop({
    shopDomain: shop,
    accessTokenEncrypted: tokenResponse.access_token,
    scope: tokenResponse.scope,
  });

  const redirectUrl = new URL(`/onboarding?tenant=${tenant.slug}`, request.url);
  return NextResponse.redirect(redirectUrl);
}
