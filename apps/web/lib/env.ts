const optionalEnv = (name: string) => process.env[name];

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const booleanEnv = (name: string, fallback = false) => {
  const value = optionalEnv(name);
  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

export const webEnv = {
  appUrl: optionalEnv("SHOPIFY_APP_URL"),
  shopifyApiKey: optionalEnv("SHOPIFY_API_KEY"),
  shopifyApiSecret: optionalEnv("SHOPIFY_API_SECRET"),
  shopifyScopes:
    optionalEnv("SHOPIFY_SCOPES") ??
    "read_content,write_content,read_products,read_themes",
  redisUrl: optionalEnv("REDIS_URL"),
  databaseUrl: optionalEnv("DATABASE_URL"),
  demoMode: booleanEnv("BLOG_SAAS_DEMO_MODE", false),
};

export function getShopifyAppUrl() {
  return requiredEnv("SHOPIFY_APP_URL");
}

export function getShopifyApiKey() {
  return requiredEnv("SHOPIFY_API_KEY");
}

export function getShopifyApiSecret() {
  return requiredEnv("SHOPIFY_API_SECRET");
}
