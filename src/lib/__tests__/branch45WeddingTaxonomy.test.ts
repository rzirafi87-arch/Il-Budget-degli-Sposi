import { WEDDING_BUDGET_TAXONOMY, findWeddingBudgetItem } from "@/constants/budgetCategories";
import { matchesBudgetSearch } from "@/lib/budgetIdea";
import { deduplicateCanonicalBudgetItems } from "@/lib/budgetCanonical";

const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "");

describe("Branch 45 wedding canonical taxonomy", () => {
  it("produces the readable development audit report", () => {
    const report = WEDDING_BUDGET_TAXONOMY.map(({ key, label, aliases, category, contexts }) => ({ key, label, aliases, category, contexts }));
    expect(report).toHaveLength(WEDDING_BUDGET_TAXONOMY.length);
    expect(report.every((row) => row.key && row.label && row.category && row.contexts.length)).toBe(true);
  });
  it("has one stable canonical key and no unclassified normalized-label collision", () => {
    expect(new Set(WEDDING_BUDGET_TAXONOMY.map((item) => item.key)).size).toBe(WEDDING_BUDGET_TAXONOMY.length);
    const labels = Map.groupBy(WEDDING_BUDGET_TAXONOMY, (item) => normalized(item.label));
    for (const collisions of labels.values()) {
      if (collisions.length > 1) expect(collisions.every((item) => item.distinctCollision)).toBe(true);
    }
  });

  it("keeps aliases disjoint from every other canonical item", () => {
    for (const item of WEDDING_BUDGET_TAXONOMY) for (const alias of item.aliases) {
      const matches = WEDDING_BUDGET_TAXONOMY.filter((candidate) => candidate.key !== item.key && normalized(candidate.label) === normalized(alias));
      expect(matches).toEqual([]);
    }
  });

  it("keeps the nine Wedding Bag components with canonical shared identities", () => {
    const bag = WEDDING_BUDGET_TAXONOMY.filter((item) => item.package === "wedding_bag");
    expect(bag).toHaveLength(9);
    expect(findWeddingBudgetItem("Cerimonia", "Ventagli")?.key).toBe("wedding.guest-comfort.fan");
    expect(findWeddingBudgetItem("Inviti & Stationery", "Libretti Messa")?.key).toBe("wedding.ceremony.booklet");
  });

  it("searches aliases and contexts without duplicate results", () => {
    const results = WEDDING_BUDGET_TAXONOMY.filter((item) => matchesBudgetSearch(item.category, item.label, "Libretti Messa", item.aliases, item.contexts));
    expect(results.map((item) => item.key)).toEqual(["wedding.ceremony.booklet"]);
  });

  it("keeps intentionally similar concepts distinct", () => {
    expect(findWeddingBudgetItem("Musica & Intrattenimento", "Audio / Luci")?.key).not.toBe(findWeddingBudgetItem("Fiori & Decor", "Illuminazione scenografica")?.key);
    expect(findWeddingBudgetItem("Fiori & Decor", "Tableau")?.key).not.toBe(findWeddingBudgetItem("Inviti & Stationery", "Segnaposto")?.key);
  });

  it("makes Apply to Budget canonical and idempotent while preserving custom rows", () => {
    const shared = { name: "Ventaglio", amount: 100, spend_type: "common", canonical_key: "wedding.guest-comfort.fan" };
    const custom = { name: "Ventagli ricamati a mano", amount: 200, spend_type: "common", canonical_key: null };
    expect(deduplicateCanonicalBudgetItems([shared, { ...shared, name: "Ventagli" }, custom, custom])).toEqual([shared, custom, custom]);
  });
});
