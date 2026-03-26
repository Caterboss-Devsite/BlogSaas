export type SearchParamsRecord = Record<string, string | string[] | undefined>;
export type PageSearchParams = Promise<SearchParamsRecord>;
export type SearchParamsShape = SearchParamsRecord | PageSearchParams | undefined;

export async function resolveTenantSlug(searchParams: SearchParamsShape) {
  const resolved = searchParams ? await searchParams : undefined;
  const rawValue = resolved?.tenant;
  if (Array.isArray(rawValue)) {
    return rawValue[0] ?? undefined;
  }
  return rawValue ?? undefined;
}
