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

export type PaymentReminderRow = Tables["payment_reminders"]["Row"];
export type PaymentReminderInsert = Tables["payment_reminders"]["Insert"];
export type PaymentReminderCreate = {
  expenseId: string;
  amount: number;
  dueDate: string;
  reminderDate: string | null;
  notes: string | null;
};
export type PaymentReminderUpdate = PaymentReminderCreate & {
  id: string;
  isPaid: boolean;
  paidDate: string | null;
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

function uuid(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value)
  ) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return value;
}

function uuidOrNull(value: unknown): string | null {
  if (value === null) return null;
  return uuid(value);
}

function date(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return value;
}

function dateOrNull(value: unknown): string | null {
  if (value === null) return null;
  return date(value);
}

function reminderAmount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return value;
}

function reminderNotes(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || value.length > 1000) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return value.trim() || null;
}

function reminderFields(input: Record<string, unknown>): PaymentReminderCreate {
  const dueDate = date(input.dueDate);
  const reminderDate = dateOrNull(input.reminderDate);
  if (reminderDate && reminderDate > dueDate) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return {
    expenseId: uuid(input.expenseId),
    amount: reminderAmount(input.amount),
    dueDate,
    reminderDate,
    notes: reminderNotes(input.notes),
  };
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
  const expenseDate = input.date;
  const fromDashboard = input.fromDashboard;

  if (
    !category ||
    !subcategory ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !["common", "bride", "groom"].includes(String(spendType)) ||
    !["pending", "approved", "rejected"].includes(String(status)) ||
    typeof expenseDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate) ||
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
    date: expenseDate,
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
  return {
    id: uuid(input.id),
    savedSupplierId: uuidOrNull(input.savedSupplierId),
  };
}

export function parsePaymentReminderCreate(value: unknown): PaymentReminderCreate {
  return reminderFields(record(value));
}

export function parsePaymentReminderUpdate(value: unknown): PaymentReminderUpdate {
  const input = record(value);
  const fields = reminderFields(input);
  if (typeof input.isPaid !== "boolean") {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  const paidDate = dateOrNull(input.paidDate);
  if ((input.isPaid && !paidDate) || (!input.isPaid && paidDate)) {
    throw new FinancialContractError("INVALID_FINANCIAL_PAYLOAD");
  }
  return {
    ...fields,
    id: uuid(input.id),
    isPaid: input.isPaid,
    paidDate,
  };
}

export function parsePaymentReminderId(value: unknown): string {
  return uuid(value);
}
