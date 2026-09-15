import type { Database } from "@/types/database.types";

type Tables = Database["public"]["Tables"];

export type BudgetItemRow = Tables["budget_items"]["Row"];
export type BudgetItemInsert = Tables["budget_items"]["Insert"];
export type BudgetItemCreate = Pick<
  BudgetItemInsert,
  | "amount"
  | "canonical_key"
  | "country_code"
  | "name"
  | "saved_supplier_id"
  | "source"
  | "spend_type"
  | "tradition_id"
  | "vendor_id"
>;

export type ExpenseRow = Tables["expenses"]["Row"];
export type ExpenseInsert = Tables["expenses"]["Insert"];
export type ExpenseCreate = {
  category: string;
  subcategory: string;
  supplier: string;
  description: string;
  amount: number;
  spendType: "common" | "bride" | "groom";
  status: "pending" | "approved" | "rejected";
  date: string;
  notes: string;
  fromDashboard: boolean;
};

export type BudgetSupplierLink = {
  id: number;
  saved_supplier_id: string | null;
};

export type ExpenseSupplierLink = {
  id: string;
  savedSupplierId: string | null;
};

export class FinancialContractError extends Error {
  constructor(readonly code: "INVALID_FINANCIAL_PAYLOAD") {
    super(code);
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return value as Record<string, unknown>;
}

function optionalString(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  return value;
}

function optionalNonNullString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  return value;
}

function optionalNumber(value: unknown): number | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return value;
}

function uuidOrNull(value: unknown): string | null {
  if (value === null) return null;
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value)
  ) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return value;
}

export function parseBudgetItemCreate(value: unknown): BudgetItemCreate {
  const input = record(value);
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const countryCode = typeof input.country_code === "string" ? input.country_code.trim() : "";
  if (!name || !countryCode) throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");

  const traditionId = input.tradition_id;
  if (
    traditionId !== undefined &&
    traditionId !== null &&
    (!Number.isInteger(traditionId) || Number(traditionId) < 0)
  ) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }

  return {
    name,
    country_code: countryCode,
    amount: optionalNumber(input.amount),
    canonical_key: optionalString(input.canonical_key),
    saved_supplier_id: optionalString(input.saved_supplier_id),
    source: optionalNonNullString(input.source),
    spend_type: optionalNonNullString(input.spend_type),
    tradition_id: traditionId as number | null | undefined,
    vendor_id: optionalString(input.vendor_id),
  };
}

export function parseExpenseCreate(value: unknown): ExpenseCreate {
  const input = record(value);
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const subcategory = typeof input.subcategory === "string" ? input.subcategory.trim() : "";
  const supplier = typeof input.supplier === "string" ? input.supplier.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  const amount = input.amount;
  const spendType = input.spendType;
  const status = input.status;
  const date = input.date;
  const fromDashboard = input.fromDashboard;

  if (
    !category ||
    !subcategory ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !["common", "bride", "groom"].includes(String(spendType)) ||
    !["pending", "approved", "rejected"].includes(String(status)) ||
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    typeof fromDashboard !== "boolean"
  ) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }

  return {
    category,
    subcategory,
    supplier,
    description,
    amount,
    spendType: spendType as ExpenseCreate["spendType"],
    status: status as ExpenseCreate["status"],
    date,
    notes,
    fromDashboard,
  };
}

export function parseBudgetSupplierLink(value: unknown): BudgetSupplierLink {
  const input = record(value);
  if (!Number.isInteger(input.id) || Number(input.id) <= 0) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return {
    id: Number(input.id),
    saved_supplier_id: uuidOrNull(input.saved_supplier_id),
  };
}

export function parseExpenseSupplierLink(value: unknown): ExpenseSupplierLink {
  const input = record(value);
  if (
    typeof input.id !== "string" ||
    !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(input.id)
  ) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return {
    id: input.id,
    savedSupplierId: uuidOrNull(input.savedSupplierId),
  };
}
