/**
 * Catalog sources hidden from public pages until their terms of use are
 * confirmed to allow storing and showing the data (B55, user decision
 * 2026-10-18: Google-sourced rows stay hidden pending a terms review).
 */
export const HIDDEN_PUBLIC_CATALOG_SOURCES = ["google"] as const;

/** PostgREST `or` filter keeping rows with no source or a visible source. */
export function visibleSourceFilter(): string {
  return `source.is.null,source.not.in.(${HIDDEN_PUBLIC_CATALOG_SOURCES.join(",")})`;
}

export function isHiddenCatalogSource(source: string | null | undefined): boolean {
  return (HIDDEN_PUBLIC_CATALOG_SOURCES as readonly string[]).includes((source ?? "").toLowerCase());
}
