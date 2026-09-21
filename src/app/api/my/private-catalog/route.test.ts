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
let currentEventId = "52220000-0000-4000-8000-000000000010";
const eventA = "52220000-0000-4000-8000-000000000010";
const eventB = "52220000-0000-4000-8000-000000000011";
const recordA = "52220000-0000-4000-8000-000000000020";
const recordB = "52220000-0000-4000-8000-000000000021";
const clientA = "52220000-0000-4000-8000-000000000030";

const mockRequireAccess = jest.fn(async () => {
  if (accessMode === "anonymous") throw new Error("AUTHENTICATION_REQUIRED");
  if (accessMode === "revoked" || accessMode === "stranger") throw new Error("NO_EVENT");
  return {
    currentEvent: { eventId: currentEventId, accessRole: accessMode },
    userId: `52220000-0000-4000-8000-00000000000${accessMode === "owner" ? "1" : "2"}`,
  };
});

jest.mock("@/lib/planningSelectionAuthorization", () => ({
  requirePlanningSelectionAccess: () => mockRequireAccess(),
  planningSelectionErrorResponse: (error: unknown) => {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    return {
      status: message === "AUTHENTICATION_REQUIRED" ? 401 : message === "NO_EVENT" ? 404 : 500,
      json: async () => ({ error: message }),
    };
  },
}));

type PrivateRow = {
  id: string;
  event_id: string;
  entity_type: string;
  client_key: string;
  snapshot_data: Record<string, unknown>;
  snapshot_version: number;
  snapshot_captured_at: string;
  snapshot_fingerprint: string;
  override_data: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
};
type Filter = { column: string; value: unknown };
type Operation = "select" | "insert" | "update" | "delete";
type QueryRecord = { operation: Operation; filters: Filter[]; values?: Record<string, unknown>; projection?: string };
type MockQuery = {
  select: jest.Mock;
  eq: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  order: jest.Mock;
  maybeSingle: jest.Mock;
  single: jest.Mock;
  then: (resolve: (value: { data: PrivateRow[]; error: null }) => unknown) => Promise<unknown>;
};

const seed: PrivateRow[] = [
  { id: recordA, event_id: eventA, entity_type: "supplier", client_key: clientA, snapshot_data: { name: "Snapshot A" }, snapshot_version: 1, snapshot_captured_at: "2026-01-01", snapshot_fingerprint: "a".repeat(64), override_data: {}, created_by: "owner", created_at: "2026-01-01", updated_at: "2026-01-01" },
  { id: recordB, event_id: eventB, entity_type: "supplier", client_key: "52220000-0000-4000-8000-000000000031", snapshot_data: { name: "Snapshot B" }, snapshot_version: 1, snapshot_captured_at: "2026-01-01", snapshot_fingerprint: "b".repeat(64), override_data: {}, created_by: "owner", created_at: "2026-01-01", updated_at: "2026-01-01" },
];
let rows: PrivateRow[] = [];
const queryLog: QueryRecord[] = [];

function mockCreateQuery() {
  const record: QueryRecord = { operation: "select", filters: [] };
  const matching = () => rows.filter((row) => record.filters.every(({ column, value }) => row[column as keyof PrivateRow] === value));
  const execute = () => {
    if (record.operation === "insert") {
      const values = record.values ?? {};
      const duplicate = rows.find((row) => row.event_id === values.event_id && row.entity_type === values.entity_type && row.client_key === values.client_key);
      if (duplicate) return { data: null, error: { code: "23505" } };
      const created = {
        id: "52220000-0000-4000-8000-000000000099",
        snapshot_version: 1,
        snapshot_captured_at: "2026-01-02",
        snapshot_fingerprint: "c".repeat(64),
        override_data: {},
        created_at: "2026-01-02",
        updated_at: "2026-01-02",
        ...values,
      } as PrivateRow;
      rows.push(created);
      return { data: created, error: null };
    }
    const found = matching()[0] ?? null;
    if (record.operation === "update" && found) Object.assign(found, record.values);
    if (record.operation === "delete" && found) rows = rows.filter((row) => row.id !== found.id);
    return { data: found, error: null };
  };
  const query: MockQuery = {
    select: jest.fn((projection: string) => { record.projection = projection; return query; }),
    eq: jest.fn((column: string, value: unknown) => { record.filters.push({ column, value }); return query; }),
    insert: jest.fn((values: Record<string, unknown>) => { record.operation = "insert"; record.values = values; return query; }),
    update: jest.fn((values: Record<string, unknown>) => { record.operation = "update"; record.values = values; return query; }),
    delete: jest.fn(() => { record.operation = "delete"; return query; }),
    order: jest.fn(() => query),
    maybeSingle: jest.fn(async () => { queryLog.push(record); return execute(); }),
    single: jest.fn(async () => { queryLog.push(record); return execute(); }),
    then: (resolve: (value: { data: PrivateRow[]; error: null }) => unknown) => {
      queryLog.push(record);
      return Promise.resolve(resolve({ data: matching(), error: null }));
    },
  };
  return query;
}

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({ from: () => mockCreateQuery() }),
}));

function request(method: string, url = "http://localhost/api/my/private-catalog", body?: unknown) {
  return {
    method,
    nextUrl: new URL(url),
    json: jest.fn(async () => body),
  } as unknown as import("next/server").NextRequest;
}

describe("/api/my/private-catalog event isolation", () => {
  beforeEach(() => {
    accessMode = "owner";
    currentEventId = eventA;
    rows = seed.map((row) => ({ ...row, snapshot_data: { ...row.snapshot_data }, override_data: { ...row.override_data } }));
    queryLog.length = 0;
    jest.clearAllMocks();
  });

  it.each(["owner", "partner"] as const)("lets an active %s read only CurrentEvent records", async (mode) => {
    accessMode = mode;
    const route = await import("./route");
    const response = await route.GET(request("GET"));
    expect(response.status).toBe(200);
    const body = await response.json() as { records: PrivateRow[] };
    expect(body.records.map((row) => row.id)).toEqual([recordA]);
    expect(queryLog[0].filters).toContainEqual({ column: "event_id", value: eventA });
    expect(queryLog[0].projection).not.toContain("*");
  });

  it.each([["revoked", 404], ["stranger", 404], ["anonymous", 401]] as const)("denies %s before querying", async (mode, status) => {
    accessMode = mode;
    const route = await import("./route");
    const response = await route.GET(request("GET"));
    expect(response.status).toBe(status);
    expect(queryLog).toHaveLength(0);
  });

  it("does not expose a resource from another event when resource_id is altered", async () => {
    const route = await import("./route");
    const response = await route.GET(request("GET", `http://localhost/api/my/private-catalog?resource_id=${recordB}`));
    expect(response.status).toBe(404);
    expect(queryLog[0].filters).toEqual([{ column: "event_id", value: eventA }, { column: "id", value: recordB }]);
  });

  it("switches cleanly when the authoritative CurrentEvent changes", async () => {
    currentEventId = eventB;
    const route = await import("./route");
    const response = await route.GET(request("GET"));
    const body = await response.json() as { records: PrivateRow[]; eventId: string };
    expect(body.eventId).toBe(eventB);
    expect(body.records.map((row) => row.id)).toEqual([recordB]);
  });

  it("creates private-only records idempotently across retries", async () => {
    const route = await import("./route");
    const payload = { entity_type: "supplier", client_key: clientA, record: { name: "Retry" } };
    const response = await route.POST(request("POST", undefined, payload));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ idempotent: true, record: { id: recordA } });
    expect(rows.filter((row) => row.event_id === eventA && row.client_key === clientA)).toHaveLength(1);
  });

  it("rejects a client-supplied event_id before any write", async () => {
    const route = await import("./route");
    const response = await route.POST(request("POST", undefined, {
      entity_type: "supplier",
      client_key: "52220000-0000-4000-8000-000000000032",
      event_id: eventB,
      record: { name: "Tampered" },
    }));
    expect(response.status).toBe(400);
    expect(queryLog).toHaveLength(0);
  });

  it("rejects forbidden override fields before update DML", async () => {
    const route = await import("./route");
    const response = await route.PATCH(request("PATCH", undefined, { resource_id: recordA, override: { source: "forged" } }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "CATALOG_OVERRIDE_FIELD_FORBIDDEN" });
    expect(queryLog.filter((query) => query.operation === "update")).toHaveLength(0);
  });

  it("requires both resource id and CurrentEvent when deleting", async () => {
    const route = await import("./route");
    const response = await route.DELETE(request("DELETE", `http://localhost/api/my/private-catalog?resource_id=${recordB}`));
    expect(response.status).toBe(404);
    expect(rows.some((row) => row.id === recordB)).toBe(true);
    expect(queryLog[0].filters).toEqual([{ column: "id", value: recordB }, { column: "event_id", value: eventA }]);
  });
});
