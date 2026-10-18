import fs from "node:fs";
import path from "node:path";
import { parseCatalogSearch } from "@/lib/catalogSearch";
import { SUPPLIER_TYPES } from "@/lib/catalogContributions";
import { SUPPLIER_CATEGORY_ALIASES, SUPPLIER_CATEGORY_SLUGS, toSupplierCategorySlug } from "@/lib/supplierCategories";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8").replace(/^﻿/, "");
const MIGRATION = "supabase/migrations/20261018170000_branch_55_catalog_truth.sql";
const routes = "src/app/[locale]/(routes)";

/** Every distinct `suppliers.category` value found in Production on 2026-10-18. */
const PRODUCTION_RAW_CATEGORIES = [
  "Beauty & Benessere", "Catering", "Gioiellerie", "Location & Catering", "Foto & Video", "Sposa",
  "Fiori & Decor", "Trasporti", "Musica & Intrattenimento", "Inviti & Stationery", "Sposo",
  "Viaggio di nozze", "Bomboniere & Regali", "Fiorai", "Ricevimento Location", "fotografi",
  "Musica Ricevimento", "Fotografi", "fiori", "catering",
];

describe("Branch 55 supplier taxonomy", () => {
  it("maps every production category and every community type to a canonical slug", () => {
    for (const raw of [...PRODUCTION_RAW_CATEGORIES, ...SUPPLIER_TYPES]) {
      expect([raw, toSupplierCategorySlug(raw)]).toEqual([raw, expect.any(String)]);
      expect(SUPPLIER_CATEGORY_SLUGS).toContain(toSupplierCategorySlug(raw));
    }
  });

  it("collapses the published duplicates into one category each", () => {
    expect(new Set(["Fiori & Decor", "Fiorai", "fiori", "florist"].map(toSupplierCategorySlug))).toEqual(new Set(["flowers"]));
    expect(new Set(["Foto & Video", "Fotografi", "fotografi", "photographer", "videomaker"].map(toSupplierCategorySlug))).toEqual(new Set(["photo-video"]));
    expect(new Set(["Musica & Intrattenimento", "Musica Ricevimento", "dj"].map(toSupplierCategorySlug))).toEqual(new Set(["music"]));
    expect(new Set(["Location & Catering", "Ricevimento Location"].map(toSupplierCategorySlug))).toEqual(new Set(["location"]));
  });

  it("keeps the TypeScript aliases identical to the database seed", () => {
    const sql = read(MIGRATION);
    const seed = Object.fromEntries([...sql.matchAll(/\('([^']+)','([a-z-]+)'\)/g)].map(m => [m[1], m[2]]));
    expect(seed).toEqual(SUPPLIER_CATEGORY_ALIASES);
  });

  it.each(["it", "en", "es", "fr", "de"])("%s has one distinct label per category slug", locale => {
    const messages = JSON.parse(read(`src/messages/milestone8.${locale}.json`)) as { milestone8: { suppliers: { categories: Record<string, string> } } };
    const labels = SUPPLIER_CATEGORY_SLUGS.map(slug => messages.milestone8.suppliers.categories[slug]);
    expect(labels.every(label => typeof label === "string" && label.length > 0)).toBe(true);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("Branch 55 public catalog pages", () => {
  it("the supplier hub lists canonical slugs only and translated verification states", () => {
    const hub = read(`${routes}/fornitori/page.tsx`);
    expect(hub).toContain("const categories = SUPPLIER_CATEGORY_SLUGS;");
    for (const raw of ["Fiori & Decor", "Ricevimento Location", "Musica Ricevimento", "\"fiori\""]) expect(hub).not.toContain(raw);
    expect(hub).not.toContain("<option>VERIFIED</option>");
    expect(hub).toContain("ui(`verification.${v}`)");
  });

  it.each([
    ["fotografi", "photo-video"],
    ["fiorai", "flowers"],
    ["beauty", "beauty"],
    ["gioiellerie", "jewelry"],
    ["catering", "catering"],
  ])("/%s filters by the canonical slug %s", (page, slug) => {
    expect(read(`${routes}/${page}/page.tsx`)).toContain(`params.append("category", "${slug}")`);
  });
});

describe("Branch 55 catalog search contract", () => {
  it("resolves supplier aliases to slugs and defaults to Italy", () => {
    const request = parseCatalogSearch(new URLSearchParams("category=Fiorai"), "supplier");
    expect(request.category).toBe("flowers");
    expect(request.country).toBe("it");
  });

  it("keeps an explicit country and non-supplier vocabularies", () => {
    expect(parseCatalogSearch(new URLSearchParams("country=mx"), "supplier").country).toBe("mx");
    expect(parseCatalogSearch(new URLSearchParams("category=Villa"), "location").category).toBe("villa");
  });

  it("the migration hides duplicates without deleting, and never marks imports as verified", () => {
    const sql = read(MIGRATION);
    expect(sql).not.toMatch(/\bdelete\s+from\b/i);
    expect(sql).toContain("s.duplicate_of is null");
    expect(sql).toContain("set verification_status = 'TO_CHECK'");
    expect(sql).not.toMatch(/set verification_status = 'VERIFIED'/);
    expect(read("supabase/tests/pgtap-suites.txt")).toContain("supabase/tests/branch_55_catalog_truth.sql");
  });
});
