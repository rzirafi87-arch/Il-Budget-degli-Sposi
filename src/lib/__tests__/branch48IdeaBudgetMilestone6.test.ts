import fs from "node:fs";
import path from "node:path";
import { WEDDING_BUDGET_TAXONOMY } from "@/constants/budgetCategories";
import { hasBudgetRowDuplicate } from "@/lib/budgetIdea";
import { getWeddingBudgetTaxonomy } from "@/i18n/weddingBudgetTaxonomy";

describe("Branch 48 Milestone 6 Idea Budget contract", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src/app/[locale]/(routes)/idea-di-budget/page.tsx"), "utf8");
  const route = fs.readFileSync(path.join(process.cwd(), "src/app/api/idea-di-budget/route.ts"), "utf8");
  const apply = fs.readFileSync(path.join(process.cwd(), "src/app/api/idea-di-budget/apply/route.ts"), "utf8");

  it("keeps the canonical taxonomy as the only standard catalog", () => {
    expect(page).toContain("WEDDING_BUDGET_TAXONOMY");
    expect(page).toContain("getWeddingBudgetTaxonomy(locale)");
    expect(new Set(WEDDING_BUDGET_TAXONOMY.map((item) => item.key)).size).toBe(WEDDING_BUDGET_TAXONOMY.length);
  });

  it("supports zero saved rows and merges later saved rows into the full catalog", () => {
    expect(page).toContain("const saved = Array.isArray(json.data)");
    expect(page).toContain("const byKey = new Map(base.map");
    expect(page).toContain("saved.forEach");
  });

  it("keeps category disclosure and multi-selection available after onboarding", () => {
    expect(page).toContain("aria-expanded={expanded}");
    expect(page).toContain("aria-controls={`budget-category-${category}`}");
    expect(page).toContain('type="checkbox" checked={row.enabled}');
  });

  it("allows progressive custom rows while rejecting only real duplicates", () => {
    const rows = [{ category: "Cerimonia", subcategory: "Voce libera", custom: true }];
    expect(hasBudgetRowDuplicate(rows, { category: "Cerimonia", subcategory: "vóce LIBERA", custom: true })).toBe(true);
    expect(hasBudgetRowDuplicate(rows, { category: "Ricevimento Location", subcategory: "Voce libera", custom: true })).toBe(false);
    expect(page).toContain("setRows((current) => [...current");
  });

  it("preserves editing and deletion semantics for custom and canonical rows", () => {
    expect(page).toContain("change(index, { subcategory: e.target.value })");
    expect(page).toContain("current.filter((_, i) => i !== index)");
    expect(page).toContain('change(index, { enabled: false, amount: 0, supplier: "", notes: "" })');
  });

  it("persists the snapshot before synchronizing it to Budget", () => {
    expect(page).toContain('const saveResponse = await request("/api/idea-di-budget"');
    expect(page).toContain('request("/api/idea-di-budget/apply"');
    expect(route).toContain('db.rpc("save_budget_idea_snapshot"');
    expect(apply).toContain('.eq("source", "budget_idea")');
  });

  it("uses CurrentEvent for event isolation and rejects foreign event selection", () => {
    expect(route).toContain("requireServerCurrentEvent(userData.user.id)");
    expect(route).not.toMatch(/body\??\.eventId|inputRows\[.*eventId/);
    expect(apply).toContain("requireServerCurrentEvent(userData.user.id)");
  });

  it("distinguishes loading, error, retry, empty search and numeric zero", () => {
    expect(page).toContain('role="status" aria-live="polite"');
    expect(page).toContain('role="alert"');
    expect(page).toContain("setLoadAttempt((value) => value + 1)");
    expect(page).toContain('t("search.empty")');
    expect(page).toContain("amount: 0");
  });

  it("keeps a stacked 320–430 px editor with dark-mode surfaces", () => {
    expect(page).toContain("grid min-w-0 gap-3 sm:grid-cols-3");
    expect(page).not.toContain("overflow-x-auto");
    expect(page).toContain("dark:bg-gray-950");
  });

  it.each(["it", "en", "es", "fr", "de"] as const)("has a localized canonical catalog for %s", (locale) => {
    const localized = getWeddingBudgetTaxonomy(locale);
    expect(localized).toHaveLength(WEDDING_BUDGET_TAXONOMY.length);
    expect(localized.every((item) => item.categoryLabel.trim() && item.label.trim())).toBe(true);
  });
});
