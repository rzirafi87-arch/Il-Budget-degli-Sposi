/**
 * Branch 55: single public taxonomy for supplier categories.
 *
 * Every raw value found in `suppliers.category` (legacy catalog) and every
 * community-submission type (`SUPPLIER_TYPES`) maps to exactly one slug.
 * The same alias table is seeded in
 * `supabase/migrations/20261018170000_branch_55_catalog_truth.sql`;
 * `supplierCategories.test.ts` keeps the two in sync.
 */
export const SUPPLIER_CATEGORY_SLUGS = [
  "location",
  "catering",
  "photo-video",
  "flowers",
  "music",
  "bridal",
  "groom",
  "beauty",
  "jewelry",
  "stationery",
  "favors",
  "transport",
  "honeymoon",
  "wedding-planner",
  "other",
] as const;

export type SupplierCategorySlug = (typeof SUPPLIER_CATEGORY_SLUGS)[number];

/** alias (already trimmed + lower-cased) -> canonical slug */
export const SUPPLIER_CATEGORY_ALIASES: Readonly<Record<string, SupplierCategorySlug>> = {
  // legacy catalog values
  "beauty & benessere": "beauty",
  "make-up & beauty": "beauty",
  "catering": "catering",
  "location & catering": "location",
  "ricevimento location": "location",
  "sposa": "bridal",
  "sposo": "groom",
  "foto & video": "photo-video",
  "fotografi": "photo-video",
  "fiori & decor": "flowers",
  "fiorai": "flowers",
  "fiori": "flowers",
  "gioiellerie": "jewelry",
  "inviti & stationery": "stationery",
  "trasporti": "transport",
  "musica & intrattenimento": "music",
  "musica ricevimento": "music",
  "viaggio di nozze": "honeymoon",
  "bomboniere & regali": "favors",
  // community submission types (src/lib/catalogContributions.ts)
  "photographer": "photo-video",
  "videomaker": "photo-video",
  "florist": "flowers",
  "wedding_planner": "wedding-planner",
  "makeup_artist": "beauty",
  "hair_stylist": "beauty",
  "music": "music",
  "dj": "music",
  "entertainment": "music",
  "transport": "transport",
  "atelier": "bridal",
  "favors": "favors",
  "bakery": "catering",
  "rental": "other",
  "lighting": "other",
  "other": "other",
};

const SLUGS = new Set<string>(SUPPLIER_CATEGORY_SLUGS);

/** Canonical slug for any raw category, alias or slug; null when unknown or empty. */
export function toSupplierCategorySlug(value: string | null | undefined): SupplierCategorySlug | null {
  const key = (value ?? "").trim().toLowerCase();
  if (!key) return null;
  if (SLUGS.has(key)) return key as SupplierCategorySlug;
  return SUPPLIER_CATEGORY_ALIASES[key] ?? null;
}
