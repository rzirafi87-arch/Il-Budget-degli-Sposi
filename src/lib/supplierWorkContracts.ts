import { UUID_PATTERN } from "@/lib/catalogSnapshotContracts";

export type SupplierScope = "saved" | "private";

export type SupplierReferenceInput = {
  scope: SupplierScope;
  resource_id: string;
};

export type SupplierLink = {
  scope: SupplierScope;
  resourceId: string;
  catalogId: string | null;
  name: string;
};

export type SupplierOption = SupplierLink;

export type SupplierFilter = {
  scope: SupplierScope;
  resourceId: string;
};

export type TimelineCreateInput = {
  client_key: string | null;
  title: string;
  description: string | null;
  category: string | null;
  completed: boolean;
  display_order: number;
  phase: string | null;
  days_before: number | null;
  due_date: string | null;
  supplier: SupplierReferenceInput | null;
};

export type TimelineUpdateInput = {
  resourceId: string;
  update: Partial<Omit<TimelineCreateInput, "supplier">>;
  supplier?: SupplierReferenceInput | null;
};

export type AppointmentCreateInput = {
  client_key: string | null;
  title: string;
  appointment_date: string;
  location: string | null;
  notes: string | null;
  supplier: SupplierReferenceInput | null;
};

export type AppointmentUpdateInput = {
  update: Partial<Omit<AppointmentCreateInput, "supplier">>;
  supplier?: SupplierReferenceInput | null;
};

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

const SUPPLIER_KEYS = new Set(["scope", "resource_id"]);
const TIMELINE_CREATE_KEYS = new Set([
  "title", "description", "category", "completed", "display_order", "phase",
  "days_before", "monthsBefore", "due_date", "supplier", "client_key",
]);
const TIMELINE_UPDATE_KEYS = new Set([...TIMELINE_CREATE_KEYS, "id"]);
const APPOINTMENT_CREATE_KEYS = new Set(["title", "date", "location", "notes", "supplier", "client_key"]);
const APPOINTMENT_UPDATE_KEYS = new Set(["title", "date", "location", "notes", "supplier"]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>) {
  return Object.keys(value).every((key) => allowed.has(key));
}

function parseRequiredText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maxLength ? normalized : null;
}

function parseOptionalText(value: unknown, maxLength: number): ValidationResult<string | null> {
  if (value === null || value === undefined || value === "") return { ok: true, value: null };
  if (typeof value !== "string" || value.length > maxLength) {
    return { ok: false, error: "INVALID_TEXT_FIELD" };
  }
  return { ok: true, value: value.trim() || null };
}

function parseInteger(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function parseClientKey(value: unknown): ValidationResult<string | null> {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    return { ok: false, error: "INVALID_CLIENT_KEY" };
  }
  return { ok: true, value };
}

export function parseSupplierReference(value: unknown): ValidationResult<SupplierReferenceInput | null> {
  if (value === null || value === undefined) return { ok: true, value: null };
  if (!isObject(value) || !hasOnlyKeys(value, SUPPLIER_KEYS)) {
    return { ok: false, error: "INVALID_SUPPLIER_LINK" };
  }
  if ((value.scope !== "saved" && value.scope !== "private") || !UUID_PATTERN.test(String(value.resource_id ?? ""))) {
    return { ok: false, error: "INVALID_SUPPLIER_LINK" };
  }
  return {
    ok: true,
    value: { scope: value.scope, resource_id: String(value.resource_id) },
  };
}

export function parseSupplierFilter(searchParams: URLSearchParams): ValidationResult<SupplierFilter | null> {
  const scope = searchParams.get("supplier_scope");
  const resourceId = searchParams.get("supplier_resource_id");
  if (scope === null && resourceId === null) return { ok: true, value: null };
  if ((scope !== "saved" && scope !== "private") || !resourceId || !UUID_PATTERN.test(resourceId)) {
    return { ok: false, error: "INVALID_SUPPLIER_FILTER" };
  }
  return { ok: true, value: { scope, resourceId } };
}

function parseTimelineCreateItem(value: unknown, fallbackOrder: number): ValidationResult<TimelineCreateInput> {
  if (!isObject(value) || !hasOnlyKeys(value, TIMELINE_CREATE_KEYS)) {
    return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
  }
  const title = parseRequiredText(value.title, 200);
  if (!title) return { ok: false, error: "TIMELINE_TITLE_REQUIRED" };
  const description = parseOptionalText(value.description, 4000);
  const category = parseOptionalText(value.category, 100);
  const phase = parseOptionalText(value.phase, 100);
  if (!description.ok || !category.ok || !phase.ok) return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
  if (value.completed !== undefined && typeof value.completed !== "boolean") {
    return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
  }
  const displayOrder = value.display_order === undefined
    ? fallbackOrder
    : parseInteger(value.display_order, 0, 100_000);
  if (displayOrder === null) return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
  let daysBefore: number | null = null;
  if (value.days_before !== undefined) {
    daysBefore = value.days_before === null ? null : parseInteger(value.days_before, 0, 36_500);
    if (daysBefore === null && value.days_before !== null) return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
  } else if (value.monthsBefore !== undefined) {
    if (typeof value.monthsBefore !== "number" || !Number.isFinite(value.monthsBefore) || value.monthsBefore < 0 || value.monthsBefore > 1_200) {
      return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
    }
    daysBefore = Math.round(value.monthsBefore * 30);
  }
  const dueDate = value.due_date === undefined || value.due_date === null || value.due_date === ""
    ? null
    : isIsoDate(value.due_date) ? value.due_date : undefined;
  if (dueDate === undefined) return { ok: false, error: "INVALID_TIMELINE_DATE" };
  const supplier = parseSupplierReference(value.supplier);
  if (!supplier.ok) return supplier;
  const clientKey = parseClientKey(value.client_key);
  if (!clientKey.ok) return clientKey;
  return {
    ok: true,
    value: {
      client_key: clientKey.value,
      title,
      description: description.value,
      category: category.value,
      completed: value.completed ?? false,
      display_order: displayOrder,
      phase: phase.value,
      days_before: daysBefore,
      due_date: dueDate,
      supplier: supplier.value,
    },
  };
}

export function parseTimelineCreatePayload(value: unknown): ValidationResult<TimelineCreateInput[]> {
  const values = Array.isArray(value) ? value : [value];
  if (values.length === 0 || values.length > 250) return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
  const result: TimelineCreateInput[] = [];
  for (let index = 0; index < values.length; index += 1) {
    const parsed = parseTimelineCreateItem(values[index], index);
    if (!parsed.ok) return parsed;
    result.push(parsed.value);
  }
  const clientKeys = result.flatMap((item) => item.client_key ? [item.client_key] : []);
  if (new Set(clientKeys).size !== clientKeys.length) {
    return { ok: false, error: "DUPLICATE_CLIENT_KEY" };
  }
  return { ok: true, value: result };
}

export function parseTimelineUpdatePayload(value: unknown): ValidationResult<TimelineUpdateInput> {
  if (!isObject(value) || !hasOnlyKeys(value, TIMELINE_UPDATE_KEYS) || !UUID_PATTERN.test(String(value.id ?? ""))) {
    return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
  }
  const update: TimelineUpdateInput["update"] = {};
  if (value.title !== undefined) {
    const title = parseRequiredText(value.title, 200);
    if (!title) return { ok: false, error: "TIMELINE_TITLE_REQUIRED" };
    update.title = title;
  }
  for (const [key, maxLength] of [["description", 4000], ["category", 100], ["phase", 100]] as const) {
    if (value[key] === undefined) continue;
    const parsed = parseOptionalText(value[key], maxLength);
    if (!parsed.ok) return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
    update[key] = parsed.value;
  }
  if (value.completed !== undefined) {
    if (typeof value.completed !== "boolean") return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
    update.completed = value.completed;
  }
  if (value.display_order !== undefined) {
    const parsed = parseInteger(value.display_order, 0, 100_000);
    if (parsed === null) return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
    update.display_order = parsed;
  }
  if (value.days_before !== undefined) {
    const parsed = value.days_before === null ? null : parseInteger(value.days_before, 0, 36_500);
    if (parsed === null && value.days_before !== null) return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
    update.days_before = parsed;
  } else if (value.monthsBefore !== undefined) {
    if (typeof value.monthsBefore !== "number" || !Number.isFinite(value.monthsBefore) || value.monthsBefore < 0 || value.monthsBefore > 1_200) {
      return { ok: false, error: "INVALID_TIMELINE_PAYLOAD" };
    }
    update.days_before = Math.round(value.monthsBefore * 30);
  }
  if (value.due_date !== undefined) {
    if (value.due_date !== null && value.due_date !== "" && !isIsoDate(value.due_date)) {
      return { ok: false, error: "INVALID_TIMELINE_DATE" };
    }
    update.due_date = value.due_date === "" ? null : value.due_date as string | null;
  }
  let supplier: SupplierReferenceInput | null | undefined;
  if (Object.prototype.hasOwnProperty.call(value, "supplier")) {
    const parsed = parseSupplierReference(value.supplier);
    if (!parsed.ok) return parsed;
    supplier = parsed.value;
  }
  if (Object.keys(update).length === 0 && supplier === undefined) {
    return { ok: false, error: "EMPTY_TIMELINE_UPDATE" };
  }
  return { ok: true, value: { resourceId: String(value.id), update, supplier } };
}

export function parseAppointmentCreatePayload(value: unknown): ValidationResult<AppointmentCreateInput> {
  if (!isObject(value) || !hasOnlyKeys(value, APPOINTMENT_CREATE_KEYS)) {
    return { ok: false, error: "INVALID_APPOINTMENT_PAYLOAD" };
  }
  const title = parseRequiredText(value.title, 200);
  if (!title) return { ok: false, error: "APPOINTMENT_REQUIRED_FIELDS" };
  if (!isIsoDate(value.date)) return { ok: false, error: "APPOINTMENT_REQUIRED_FIELDS" };
  const location = parseOptionalText(value.location, 500);
  const notes = parseOptionalText(value.notes, 4000);
  const supplier = parseSupplierReference(value.supplier);
  const clientKey = parseClientKey(value.client_key);
  if (!location.ok || !notes.ok || !supplier.ok) return { ok: false, error: "INVALID_APPOINTMENT_PAYLOAD" };
  if (!clientKey.ok) return clientKey;
  return {
    ok: true,
    value: { client_key: clientKey.value, title, appointment_date: value.date, location: location.value, notes: notes.value, supplier: supplier.value },
  };
}

export function parseAppointmentUpdatePayload(value: unknown): ValidationResult<AppointmentUpdateInput> {
  if (!isObject(value) || !hasOnlyKeys(value, APPOINTMENT_UPDATE_KEYS)) {
    return { ok: false, error: "INVALID_APPOINTMENT_PAYLOAD" };
  }
  const update: AppointmentUpdateInput["update"] = {};
  if (value.title !== undefined) {
    const title = parseRequiredText(value.title, 200);
    if (!title) return { ok: false, error: "APPOINTMENT_REQUIRED_FIELDS" };
    update.title = title;
  }
  if (value.date !== undefined) {
    if (!isIsoDate(value.date)) return { ok: false, error: "APPOINTMENT_REQUIRED_FIELDS" };
    update.appointment_date = value.date;
  }
  for (const [key, maxLength] of [["location", 500], ["notes", 4000]] as const) {
    if (value[key] === undefined) continue;
    const parsed = parseOptionalText(value[key], maxLength);
    if (!parsed.ok) return { ok: false, error: "INVALID_APPOINTMENT_PAYLOAD" };
    update[key] = parsed.value;
  }
  let supplier: SupplierReferenceInput | null | undefined;
  if (Object.prototype.hasOwnProperty.call(value, "supplier")) {
    const parsed = parseSupplierReference(value.supplier);
    if (!parsed.ok) return parsed;
    supplier = parsed.value;
  }
  if (Object.keys(update).length === 0 && supplier === undefined) {
    return { ok: false, error: "EMPTY_APPOINTMENT_UPDATE" };
  }
  return { ok: true, value: { update, supplier } };
}

export function supplierReferenceColumns(reference: SupplierReferenceInput | null) {
  return {
    saved_supplier_id: reference?.scope === "saved" ? reference.resource_id : null,
    private_supplier_id: reference?.scope === "private" ? reference.resource_id : null,
  };
}

export function supplierFilterColumns(filter: SupplierFilter) {
  return filter.scope === "saved"
    ? { column: "saved_supplier_id" as const, value: filter.resourceId }
    : { column: "private_supplier_id" as const, value: filter.resourceId };
}
