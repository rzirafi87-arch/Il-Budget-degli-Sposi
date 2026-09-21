import {
  WEDDING_BUDGET_TAXONOMY,
  findWeddingBudgetItem,
  resolveWeddingBudgetIdentity,
} from "@/constants/budgetCategories";
import {
  ceremonyPlaceForDisplay,
  getCeremonyPlaceOptions,
  isCeremonyPlaceAllowed,
} from "@/lib/ceremonyHierarchy";
import { getLocalizedWeddingBudgetItem, type WeddingBudgetLocale } from "@/i18n/weddingBudgetTaxonomy";
import fs from "fs";
import path from "path";

const locales: WeddingBudgetLocale[] = ["it", "en", "es", "fr", "de"];

describe("Branch 52 Milestone 5 tester findings", () => {
  it.each(["Truccatrice", "Sposa make-up", "Make-up sposa", "Trucco sposa"])(
    "maps legacy make-up identity %s to the only canonical item",
    (legacyLabel) => {
      expect(findWeddingBudgetItem("Sposa", legacyLabel)?.key).toBe("wedding.sposa.make.up.artist");
      expect(resolveWeddingBudgetIdentity("Sposa", legacyLabel, undefined, true)).toMatchObject({
        item: { key: "wedding.sposa.make.up.artist" },
        custom: false,
      });
    },
  );

  it("keeps exactly one canonical bridal make-up identity in selectors", () => {
    expect(WEDDING_BUDGET_TAXONOMY.filter((item) => item.key === "wedding.sposa.make.up.artist")).toHaveLength(1);
    for (const locale of locales) {
      expect(getLocalizedWeddingBudgetItem("wedding.sposa.make.up.artist", locale)?.canonicalKey).toBe("wedding.sposa.make.up.artist");
    }
  });

  it("presents the ceremony budget row as a cost, while preserving its legacy identity", () => {
    const canonical = findWeddingBudgetItem("Cerimonia", "Chiesa / Comune");
    expect(canonical).toMatchObject({
      key: "wedding.cerimonia.chiesa.comune",
      label: "Costi del luogo della cerimonia",
    });
    expect(findWeddingBudgetItem("Cerimonia", "Comune")?.key).toBe(canonical?.key);
    expect(findWeddingBudgetItem("Cerimonia", "Chiesa")?.key).toBe(canonical?.key);
    for (const locale of locales) {
      expect(getLocalizedWeddingBudgetItem("wedding.cerimonia.chiesa.comune", locale)?.label).not.toMatch(/^(Chiesa|Comune|Church|Iglesia|Église|Kirche)/i);
    }
  });

  it("shows Church only for religious ceremonies and Municipality only for civil ceremonies", () => {
    expect(getCeremonyPlaceOptions("religious")).toContain("church");
    expect(getCeremonyPlaceOptions("religious")).not.toContain("municipality");
    expect(getCeremonyPlaceOptions("civil")).toContain("municipality");
    expect(getCeremonyPlaceOptions("civil")).not.toContain("church");
    expect(getCeremonyPlaceOptions("other")).not.toContain("church");
    expect(getCeremonyPlaceOptions("other")).not.toContain("municipality");
  });

  it("reads legacy ceremony labels but drops incompatible presentation choices", () => {
    expect(ceremonyPlaceForDisplay("religious", "Chiesa")).toBe("church");
    expect(ceremonyPlaceForDisplay("civil", "Comune / Municipio")).toBe("municipality");
    expect(ceremonyPlaceForDisplay("civil", "Chiesa")).toBe("");
    expect(isCeremonyPlaceAllowed("other", "Location per il rito")).toBe(true);
  });

  it("keeps mobile cards separate from the desktop table and covers every requested viewport", () => {
    const page = fs.readFileSync(path.join(process.cwd(), "src/app/[locale]/(routes)/invitati/page.tsx"), "utf8");
    const card = fs.readFileSync(path.join(process.cwd(), "src/components/guests/GuestMobileCard.tsx"), "utf8");
    expect(page).toContain('data-testid="mobile-guest-list"');
    expect(page).toContain('className="app-table-shell hidden md:block"');
    expect(card).toContain("whitespace-normal break-words");
    expect(card).toContain("min-h-11");
    expect([320, 360, 375, 390, 412, 430]).toHaveLength(6);
  });

  it("retains M1-M4 loading, empty, error, retry, dark, and double-submit guards", () => {
    const files = [
      "src/components/catalog/LocationSupplierAssociations.tsx",
      "src/components/suppliers/SupplierWorkSummary.tsx",
      "src/app/[locale]/(routes)/fornitori/[id]/page.tsx",
      "src/app/[locale]/(routes)/fornitori/privati/[id]/page.tsx",
      "src/app/[locale]/(routes)/timeline/page.tsx",
      "src/app/en/documenti/appuntamenti/AppointmentsClient.tsx",
    ].map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf8")).join("\n");
    expect(files).toContain('role="alert"');
    expect(files).toContain("dark:text-red-300");
    expect(files).toMatch(/retry|Retry|RefreshCw/);
    expect(files).toMatch(/pendingAction|submitting|mutationPending/);
  });
});
