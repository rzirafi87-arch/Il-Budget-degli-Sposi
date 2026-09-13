import { WEDDING_BUDGET_TAXONOMY } from "@/constants/budgetCategories";
import { matchesBudgetSearch } from "@/lib/budgetIdea";
import {
  getLocalizedWeddingBudgetItem,
  getWeddingBudgetTaxonomy,
  WEDDING_BUDGET_TRANSLATION_COUNTS,
  type WeddingBudgetLocale,
} from "@/i18n/weddingBudgetTaxonomy";

const LOCALES: WeddingBudgetLocale[] = ["it", "en", "es", "fr", "de"];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en").trim();
}

describe("Branch 46 localized wedding taxonomy", () => {
  it("keeps exactly 154 canonical identities in every rollout locale", () => {
    expect(WEDDING_BUDGET_TAXONOMY).toHaveLength(154);
    const canonicalKeys = WEDDING_BUDGET_TAXONOMY.map((item) => item.key);
    expect(new Set(canonicalKeys).size).toBe(154);

    for (const locale of LOCALES) {
      const localized = getWeddingBudgetTaxonomy(locale);
      expect(localized).toHaveLength(154);
      expect(WEDDING_BUDGET_TRANSLATION_COUNTS[locale]).toBe(154);
      expect(localized.map((item) => item.canonicalKey)).toEqual(canonicalKeys);
      expect(new Set(localized.map((item) => item.canonicalKey)).size).toBe(154);
      expect(localized.every((item) => item.label.trim().length > 0)).toBe(true);
      expect(localized.every((item) => item.categoryLabel.trim().length > 0)).toBe(true);
    }
  });

  it("does not let localized aliases collide with another canonical key", () => {
    const canonicalKeys = new Set(WEDDING_BUDGET_TAXONOMY.map((item) => normalize(item.key)));
    for (const locale of LOCALES) {
      for (const item of getWeddingBudgetTaxonomy(locale)) {
        for (const alias of item.searchAliases) {
          const aliasKey = normalize(alias);
          if (canonicalKeys.has(aliasKey)) expect(aliasKey).toBe(normalize(item.canonicalKey));
        }
      }
    }
  });

  it("localizes the sensitive canonical items while preserving identity", () => {
    const expected: Record<string, Record<WeddingBudgetLocale, string>> = {
      "wedding.guest-comfort.fan": { it: "Ventaglio", en: "Fan", es: "Abanico", fr: "Éventail", de: "Fächer" },
      "wedding.ceremony.booklet": { it: "Libretto della cerimonia", en: "Ceremony Booklet", es: "Libreto de la ceremonia", fr: "Livret de cérémonie", de: "Trauheft" },
      "wedding.stationery.place-card": { it: "Segnaposto", en: "Place Card", es: "Marcasitio", fr: "Marque-place", de: "Platzkarte" },
      "wedding.fiori.decor.corsage": { it: "Corsage", en: "Corsage", es: "Corsage", fr: "Corsage", de: "Corsage" },
      "wedding.sposa.make.up.artist": { it: "Make-up artist", en: "Bridal Makeup Artist", es: "Maquillaje de novia", fr: "Maquilleur / Maquilleuse de la mariée", de: "Braut-Make-up" },
      "wedding.musica.cerimonia.soprano": { it: "Soprano", en: "Soprano", es: "Soprano", fr: "Soprano", de: "Sopran" },
      "wedding.trasporti.autista": { it: "Autista", en: "Driver", es: "Conductor", fr: "Chauffeur", de: "Fahrer" },
    };

    for (const [canonicalKey, labels] of Object.entries(expected)) {
      for (const locale of LOCALES) {
        const item = getLocalizedWeddingBudgetItem(canonicalKey, locale);
        expect(item?.canonicalKey).toBe(canonicalKey);
        expect(item?.label).toBe(labels[locale]);
      }
    }
  });

  it("keeps Wedding Bag at nine canonical items in every locale", () => {
    const canonicalWeddingBagKeys = WEDDING_BUDGET_TAXONOMY.filter((item) => item.package === "wedding_bag").map((item) => item.key);
    expect(canonicalWeddingBagKeys).toHaveLength(9);
    for (const locale of LOCALES) {
      const localizedKeys = getWeddingBudgetTaxonomy(locale).filter((item) => item.package === "wedding_bag").map((item) => item.canonicalKey);
      expect(localizedKeys).toEqual(canonicalWeddingBagKeys);
    }
  });

  it.each([
    ["makeup", "wedding.sposa.make.up.artist"],
    ["make-up", "wedding.sposa.make.up.artist"],
    ["booklet", "wedding.ceremony.booklet"],
    ["ceremony booklet", "wedding.ceremony.booklet"],
    ["fan", "wedding.guest-comfort.fan"],
    ["place card", "wedding.stationery.place-card"],
    ["photographer", "wedding.foto.video.servizio.fotografico"],
    ["driver", "wedding.trasporti.autista"],
    ["corsage", "wedding.fiori.decor.corsage"],
  ])("English search '%s' maps to the same canonical item", (query, canonicalKey) => {
    const matches = getWeddingBudgetTaxonomy("en").filter((item) => matchesBudgetSearch(item.categoryLabel, item.label, query, item.searchAliases, item.presentationContexts));
    expect(matches.some((item) => item.canonicalKey === canonicalKey)).toBe(true);
  });

  it("uses a semantic English rendering for Italian confetti", () => {
    const item = getLocalizedWeddingBudgetItem("wedding.bomboniere.regali.confetti", "en");
    expect(item?.label).toBe("Sugared Almonds");
    expect(item?.searchAliases.map(normalize)).toContain("sugared almonds");
    expect(item?.searchAliases.map(normalize)).not.toContain("confetti");
  });

  it("does not leak the Italian fan aliases into other locales", () => {
    for (const locale of ["en", "es", "fr", "de"] as const) {
      const item = getLocalizedWeddingBudgetItem("wedding.guest-comfort.fan", locale);
      const aliases = item?.searchAliases.map(normalize) ?? [];
      expect(aliases).not.toContain("ventaglio");
      expect(aliases).not.toContain("ventagli");
    }
  });
});
