import fs from "node:fs";
import path from "node:path";

import {
  FinancialContractError,
  parseBudgetSupplierLink,
  parseExpenseSupplierLink,
} from "@/lib/financialContracts";

const SAVED_SUPPLIER_ID = "50000000-0000-4000-8000-000000000050";
const EXPENSE_ID = "50000000-0000-4000-8000-000000000051";

describe("Branch 50 milestone 2 supplier-link contracts", () => {
  it("accepts explicit Budget link and unlink operations", () => {
    expect(parseBudgetSupplierLink({
      id: 50,
      saved_supplier_id: SAVED_SUPPLIER_ID,
      event_id: "request-controlled-event",
      amount: 999999,
    })).toEqual({ id: 50, saved_supplier_id: SAVED_SUPPLIER_ID });

    expect(parseBudgetSupplierLink({
      id: 50,
      saved_supplier_id: null,
    })).toEqual({ id: 50, saved_supplier_id: null });
  });

  it("accepts explicit expense link and unlink operations", () => {
    expect(parseExpenseSupplierLink({
      id: EXPENSE_ID,
      savedSupplierId: SAVED_SUPPLIER_ID,
      supplier: "must remain unchanged",
      paid: 999999,
    })).toEqual({ id: EXPENSE_ID, savedSupplierId: SAVED_SUPPLIER_ID });

    expect(parseExpenseSupplierLink({
      id: EXPENSE_ID,
      savedSupplierId: null,
    })).toEqual({ id: EXPENSE_ID, savedSupplierId: null });
  });

  it.each([
    () => parseBudgetSupplierLink({ id: 0, saved_supplier_id: null }),
    () => parseBudgetSupplierLink({ id: 50, saved_supplier_id: "not-a-uuid" }),
    () => parseBudgetSupplierLink({ id: 50 }),
    () => parseExpenseSupplierLink({ id: "not-a-uuid", savedSupplierId: null }),
    () => parseExpenseSupplierLink({ id: EXPENSE_ID, savedSupplierId: "not-a-uuid" }),
    () => parseExpenseSupplierLink({ id: EXPENSE_ID }),
  ])("rejects malformed or implicit link mutations", (parse) => {
    expect(parse).toThrow(FinancialContractError);
  });
});

describe("Branch 50 milestone 2 same-event mutation boundaries", () => {
  const read = (relativePath: string) =>
    fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

  it.each([
    ["src/app/api/budget-items/route.ts", "budget_items"],
    ["src/app/api/my/expenses/route.ts", "expenses"],
  ])("%s exposes a guarded PATCH constrained by row and current event", (relativePath, table) => {
    const source = read(relativePath);
    const patch = source.slice(source.indexOf("export async function PATCH"));

    expect(patch).toContain('requireFinancialAccess(req, "mutate")');
    expect(patch).toContain("requireSameEventSavedSupplier");
    expect(patch).toContain(`.from("${table}")`);
    expect(patch).toContain('.eq("id", link.id)');
    expect(patch).toContain('.eq("event_id", currentEvent.eventId)');
    expect(patch).toContain(".maybeSingle()");
    expect(patch.indexOf("requireSameEventSavedSupplier"))
      .toBeLessThan(patch.indexOf(`.from("${table}")`));
  });

  it("changes only saved_supplier_id on a Budget link or unlink", () => {
    const patch = read("src/app/api/budget-items/route.ts")
      .slice(read("src/app/api/budget-items/route.ts").indexOf("export async function PATCH"));

    expect(patch).toContain(".update({ saved_supplier_id: link.saved_supplier_id })");
    expect(patch).not.toContain("amount:");
    expect(patch).not.toContain("source:");
    expect(patch).not.toContain(".insert(");
  });

  it("changes only saved_supplier_id on an expense link or unlink", () => {
    const source = read("src/app/api/my/expenses/route.ts");
    const patch = source.slice(source.indexOf("export async function PATCH"));

    expect(patch).toContain(".update({ saved_supplier_id: link.savedSupplierId })");
    expect(patch).not.toContain("supplier:");
    expect(patch).not.toContain("amount:");
    expect(patch).not.toContain("paid_amount:");
    expect(patch).not.toContain(".insert(");
  });

  it("keeps canonical supplier references visible in authenticated reads", () => {
    expect(read("src/app/api/budget-items/route.ts")).toContain('.select("*")');
    expect(read("src/app/api/my/expenses/route.ts")).toContain("saved_supplier_id,");
    expect(read("src/app/api/my/expenses/route.ts"))
      .toContain("savedSupplierId: expense.saved_supplier_id");
  });
});
