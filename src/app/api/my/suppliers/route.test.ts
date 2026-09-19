jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
    }),
  },
}));
export {};

type AccessMode = "owner" | "partner" | "revoked" | "stranger" | "anonymous";
let accessMode: AccessMode = "owner";
const eventA = "52000000-0000-4000-8000-000000000010";
const eventB = "52000000-0000-4000-8000-000000000011";
const supplierId = "52000000-0000-4000-8000-000000000001";
const resourceA = "52000000-0000-4000-8000-000000000002";
const resourceB = "52000000-0000-4000-8000-000000000003";

const mockRequireAccess = jest.fn(async (...args: unknown[]) => {
  void args;
  if (accessMode === "anonymous") throw new Error("AUTHENTICATION_REQUIRED");
  if (accessMode === "revoked" || accessMode === "stranger") throw new Error("NO_EVENT");
  return { currentEvent: { eventId: eventA, accessRole: accessMode }, userId: `user-${accessMode}` };
});

jest.mock("@/lib/planningSelectionAuthorization", () => ({
  requirePlanningSelectionAccess: (...args: unknown[]) => mockRequireAccess(...args),
  planningSelectionErrorResponse: (error: unknown) => {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    const status = message === "AUTHENTICATION_REQUIRED" ? 401 : message === "NO_EVENT" ? 404 : 500;
    return {
      status,
      json: async () => ({ error: message }),
    };
  },
}));

type SavedRow = {
  id: string;
  event_id: string;
  supplier_id: string;
  status: string;
  favorite: boolean;
  personal_notes: string | null;
  contact_notes: string | null;
  quote_amount: number | null;
  agreed_amount: number | null;
  deposit_amount: number | null;
  balance_amount: number | null;
  currency: string | null;
  deposit_paid: boolean;
  contract_signed: boolean;
  created_at: string;
  updated_at: string;
};
type Filter = { column: string; value: unknown };
type Operation = "select" | "insert" | "update" | "delete";
type QueryRecord = { table: string; operation: Operation; projection?: string; filters: Filter[]; values?: Record<string, unknown> };
type MockQuery = {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  maybeSingle: jest.Mock;
  single: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

const initialRows: SavedRow[] = [
  { id: resourceA, event_id: eventA, supplier_id: supplierId, status: "SAVED", favorite: false, personal_notes: null, contact_notes: null, quote_amount: null, agreed_amount: null, deposit_amount: null, balance_amount: null, currency: null, deposit_paid: false, contract_signed: false, created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: resourceB, event_id: eventB, supplier_id: supplierId, status: "SAVED", favorite: false, personal_notes: "foreign", contact_notes: null, quote_amount: null, agreed_amount: null, deposit_amount: null, balance_amount: null, currency: null, deposit_paid: false, contract_signed: false, created_at: "2026-01-01", updated_at: "2026-01-01" },
];
let rows: SavedRow[] = [];
const queryLog: QueryRecord[] = [];

function mockCreateQuery(table: string) {
  const record: QueryRecord = { table, operation: "select", filters: [] };
  const matching = () => rows.filter((row) => record.filters.every((filter) => row[filter.column as keyof SavedRow] === filter.value));
  const executeOne = () => {
    if (table === "suppliers") return { data: { id: supplierId }, error: null };
    if (record.operation === "insert") {
      const created = { ...initialRows[0], ...record.values, id: "52000000-0000-4000-8000-000000000099" };
      rows.push(created);
      return { data: created, error: null };
    }
    const target = matching()[0] ?? null;
    if (record.operation === "update" && target) Object.assign(target, record.values);
    if (record.operation === "delete" && target) rows = rows.filter((row) => row.id !== target.id);
    return { data: target, error: null };
  };
  const query: MockQuery = {
    select: jest.fn((projection: string) => { record.projection = projection; return query; }),
    eq: jest.fn((column: string, value: unknown) => { record.filters.push({ column, value }); return query; }),
    order: jest.fn(async () => { queryLog.push(record); return { data: matching(), error: null }; }),
    maybeSingle: jest.fn(async () => { queryLog.push(record); return executeOne(); }),
    single: jest.fn(async () => { queryLog.push(record); return executeOne(); }),
    insert: jest.fn((values: Record<string, unknown>) => { record.operation = "insert"; record.values = values; return query; }),
    update: jest.fn((values: Record<string, unknown>) => { record.operation = "update"; record.values = values; return query; }),
    delete: jest.fn(() => { record.operation = "delete"; return query; }),
  };
  return query;
}

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({ from: (table: string) => mockCreateQuery(table) }),
}));

function request(method: string, url = "http://localhost/api/my/suppliers", body?: unknown) {
  return {
    method,
    nextUrl: new URL(url),
    json: jest.fn(async () => body),
  } as unknown as import("next/server").NextRequest;
}

describe("/api/my/suppliers authorization and IDOR contracts", () => {
  beforeEach(() => {
    accessMode = "owner";
    rows = initialRows.map((row) => ({ ...row }));
    queryLog.length = 0;
    jest.clearAllMocks();
  });

  it.each(["owner", "partner"] as const)("allows an active %s to read only the CurrentEvent", async (role) => {
    accessMode = role;
    const route = await import("./route");
    const response = await route.GET(request("GET"));
    expect(response.status).toBe(200);
    const body = await response.json() as { savedSuppliers: SavedRow[]; eventId: string };
    expect(body.eventId).toBe(eventA);
    expect(body.savedSuppliers.map((row) => row.id)).toEqual([resourceA]);
    expect(queryLog[0].filters).toContainEqual({ column: "event_id", value: eventA });
    expect(queryLog[0].projection).not.toContain("*");
  });

  it.each([
    ["revoked", 404],
    ["stranger", 404],
    ["anonymous", 401],
  ] as const)("denies a %s caller before reading private rows", async (mode, status) => {
    accessMode = mode;
    const route = await import("./route");
    const response = await route.GET(request("GET"));
    expect(response.status).toBe(status);
    expect(queryLog).toHaveLength(0);
  });

  it("returns uniform 404 for a foreign saved supplier", async () => {
    const route = await import("./route");
    const response = await route.GET(request("GET", `http://localhost/api/my/suppliers?resource_id=${resourceB}`));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "SAVED_SUPPLIER_NOT_FOUND" });
    expect(queryLog[0].filters).toEqual([
      { column: "id", value: resourceB },
      { column: "event_id", value: eventA },
    ]);
  });

  it("rejects event_id and owner_id manipulation before DML", async () => {
    const route = await import("./route");
    const create = await route.POST(request("POST", undefined, { supplier_id: supplierId, owner_id: "attacker" }));
    const update = await route.PATCH(request("PATCH", undefined, { resource_id: resourceA, event_id: eventB, status: "SELECTED" }));
    expect(create.status).toBe(400);
    expect(update.status).toBe(400);
    expect(queryLog).toHaveLength(0);
  });

  it("updates an allowed payload only when id and CurrentEvent both match", async () => {
    const route = await import("./route");
    const response = await route.PATCH(request("PATCH", undefined, {
      resource_id: resourceA,
      status: "SELECTED",
      personal_notes: "scelta insieme",
    }));
    expect(response.status).toBe(200);
    expect(rows.find((row) => row.id === resourceA)).toMatchObject({ status: "SELECTED", personal_notes: "scelta insieme" });
    expect(rows.find((row) => row.id === resourceB)).toMatchObject({ status: "SAVED", personal_notes: "foreign" });
    expect(queryLog[0].filters).toEqual([
      { column: "id", value: resourceA },
      { column: "event_id", value: eventA },
    ]);
  });

  it("cannot delete a resource belonging to another event", async () => {
    const route = await import("./route");
    const response = await route.DELETE(request("DELETE", `http://localhost/api/my/suppliers?resource_id=${resourceB}`));
    expect(response.status).toBe(404);
    expect(rows.some((row) => row.id === resourceB)).toBe(true);
  });
});
