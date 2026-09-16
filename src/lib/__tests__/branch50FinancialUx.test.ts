import fs from "node:fs";
import path from "node:path";

import { parseExpenseCreate } from "@/lib/financialContracts";

const ROOT = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

describe("Branch 50 milestone 4 financial UX", () => {
  it("supports atomic canonical supplier selection while preserving legacy text", () => {
    expect(parseExpenseCreate({
      category: "Foto",
      subcategory: "Servizio",
      supplier: "Testo legacy leggibile",
      savedSupplierId: "50000000-0000-4000-8000-000000000070",
      description: "",
      amount: 100,
      spendType: "common",
      status: "pending",
      date: "2026-09-16",
      notes: "",
      fromDashboard: false,
    })).toMatchObject({
      supplier: "Testo legacy leggibile",
      savedSupplierId: "50000000-0000-4000-8000-000000000070",
    });
  });

  it("adds a compact Budget card view and keeps the wide table desktop-only", () => {
    const source = read("src/app/[locale]/(routes)/budget/page.tsx");
    expect(source).toContain('className="sm:hidden"');
    expect(source).toContain('className="app-table-shell hidden sm:block"');
    expect(source).toContain("row.savedSupplierId");
    expect(source).toContain("break-words");
  });

  it("keeps expense cards as the primary mobile representation", () => {
    const source = read("src/app/[locale]/(routes)/spese/page.tsx");
    expect(source).toContain('className="space-y-3 sm:hidden p-4"');
    expect(source).toContain('className="-mx-4 overflow-x-auto hidden sm:block"');
    expect(source).toContain("ExpenseSupplierPaymentControls");
  });

  it("provides keyboard-sized controls, disclosure semantics and live feedback", () => {
    const source = read("src/components/expenses/ExpenseSupplierPaymentControls.tsx");
    expect(source).toContain("aria-expanded={open}");
    expect(source).toContain("aria-controls={panelId}");
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("min-h-11");
    expect(source).toContain("<fieldset");
    expect(source).toContain("<legend");
  });

  it("does not rely on color alone for linked or payment state", () => {
    const budget = read("src/app/[locale]/(routes)/budget/page.tsx");
    const controls = read("src/components/expenses/ExpenseSupplierPaymentControls.tsx");
    expect(budget).toContain('t("branch50Financial.linked")');
    expect(budget).toContain('t("branch50Financial.unlinked")');
    expect(controls).toContain('t("paid")');
    expect(controls).toContain('t("reminderDeleted")');
  });

  it("blocks unlinking while an expense-bound reminder exists", () => {
    const route = read("src/app/api/my/expenses/route.ts");
    const patch = route.slice(route.indexOf("export async function PATCH"));
    expect(patch).toContain('.from("payment_reminders")');
    expect(patch).toContain('"EXPENSE_HAS_PAYMENT_REMINDER"');
    expect(patch.indexOf('.from("payment_reminders")'))
      .toBeLessThan(patch.indexOf('.from("expenses")'));
  });
});

describe("Branch 50 milestone 4 launch-locale parity", () => {
  const locales = ["it", "en", "es", "fr", "de"] as const;
  const messages = locales.map((locale) => ({
    locale,
    value: JSON.parse(read(`src/messages/${locale}.json`)).branch50Financial as Record<string, string>,
  }));

  it("has the exact same non-empty keys in IT/EN/ES/FR/DE", () => {
    const expected = Object.keys(messages[0].value).sort();
    expect(expected.length).toBeGreaterThanOrEqual(30);
    for (const { value } of messages) {
      expect(Object.keys(value).sort()).toEqual(expected);
      expect(Object.values(value).every((message) => message.trim().length > 0)).toBe(true);
    }
  });

  it("contains no interpolation mismatch or Italian fallback in the four translated bundles", () => {
    const placeholders = (message: string) =>
      Array.from(message.matchAll(/\{([^}]+)\}/g), (match) => match[1]).sort();
    const italian = messages[0].value;
    for (const { locale, value } of messages.slice(1)) {
      for (const key of Object.keys(italian)) {
        expect(placeholders(value[key])).toEqual(placeholders(italian[key]));
        expect(value[key]).not.toBe(italian[key]);
      }
      expect(locale).not.toBe("it");
    }
  });
});
