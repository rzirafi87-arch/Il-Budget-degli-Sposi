import fs from "node:fs";
import path from "node:path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("Branch 50 release-candidate integration matrix", () => {
  const budgetRoute = read("src/app/api/budget-items/route.ts");
  const expenseRoute = read("src/app/api/my/expenses/route.ts");
  const reminderRoute = read("src/app/api/payment-reminders/route.ts");
  const authorization = read("src/lib/financialAuthorization.ts");
  const contracts = read("src/lib/financialContracts.ts");

  it("keeps every privileged financial mutation behind current-event authorization", () => {
    for (const source of [budgetRoute, expenseRoute, reminderRoute]) {
      const mutations = ["POST", "PATCH", "DELETE"]
        .map((method) => source.indexOf(`export async function ${method}`))
        .filter((index) => index >= 0);
      for (const start of mutations) {
        const handler = source.slice(start);
        expect(handler).toContain('requireFinancialAccess(req, "mutate")');
        expect(handler.indexOf('requireFinancialAccess(req, "mutate")'))
          .toBeLessThan(handler.search(/\.insert\(|\.update\(|\.delete\(\)/));
      }
    }
  });

  it("validates the expense event before supplier or reminder unlink lookups", () => {
    const patch = expenseRoute.slice(expenseRoute.indexOf("export async function PATCH"));
    expect(patch).toContain("requireSameEventExpense");
    expect(patch.indexOf("requireSameEventExpense"))
      .toBeLessThan(patch.indexOf('.from("payment_reminders")'));
    expect(authorization).toContain('.eq("event_id", eventId)');
  });

  it("enforces the complete supplier-expense-reminder chain", () => {
    expect(expenseRoute).toContain("requireSameEventSavedSupplier");
    expect(reminderRoute.match(/requireSameEventLinkedExpense/g)?.length).toBeGreaterThanOrEqual(3);
    expect(reminderRoute).toContain('.in("expense_id", expenseIds)');
    expect(reminderRoute).toContain('"PAYMENT_REMINDER_EXISTS"');
    expect(expenseRoute).toContain('"EXPENSE_HAS_PAYMENT_REMINDER"');
  });

  it("preserves financial and legacy data through narrow update allowlists", () => {
    const budgetPatch = budgetRoute.slice(budgetRoute.indexOf("export async function PATCH"));
    const expensePatch = expenseRoute.slice(expenseRoute.indexOf("export async function PATCH"));
    expect(budgetPatch).toContain(".update({ saved_supplier_id: link.saved_supplier_id })");
    expect(expensePatch).toContain(".update({ saved_supplier_id: link.savedSupplierId })");
    expect(budgetPatch).not.toMatch(/amount\s*:/);
    expect(budgetPatch).not.toMatch(/source\s*:/);
    expect(expensePatch).not.toMatch(/supplier\s*:/);
    expect(expensePatch).not.toMatch(/paid_amount\s*:/);
    expect(contracts).toContain("supplier: string;");
    expect(contracts).toContain("savedSupplierId: string | null;");
  });

  it("contains no notification, Timeline or new event-type implementation", () => {
    const branch50Sources = [
      budgetRoute,
      expenseRoute,
      reminderRoute,
      authorization,
      contracts,
      read("src/components/expenses/ExpenseSupplierPaymentControls.tsx"),
    ].join("\n");
    expect(branch50Sources).not.toMatch(/sendEmail|sendNotification|timeline_id|createEventType/i);
    expect(reminderRoute).toContain("reminder_sent: false");
  });

  it("keeps the release candidate migration-free", () => {
    const audit = read("docs/branch-50-supplier-budget-payment-integration-audit.md");
    expect(audit).toContain("Default: no migration");
    expect(audit).toContain("No backfill, inference, deletion or automatic link");
  });

  it("ships equivalent localized UX keys and responsive financial surfaces", () => {
    const locales = ["it", "en", "es", "fr", "de"];
    const keySets = locales.map((locale) =>
      Object.keys(JSON.parse(read(`src/messages/${locale}.json`)).branch50Financial).sort(),
    );
    keySets.slice(1).forEach((keys) => expect(keys).toEqual(keySets[0]));

    const budgetPage = read("src/app/[locale]/(routes)/budget/page.tsx");
    const expensePage = read("src/app/[locale]/(routes)/spese/page.tsx");
    const e2e = read("e2e/authenticated-wedding.spec.ts");
    expect(budgetPage).toContain('className="sm:hidden"');
    expect(expensePage).toContain("ExpenseSupplierPaymentControls");
    expect(e2e).toContain("for (const width of [320, 390, 430])");
  });
});
