jest.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ json: async () => body, status: init?.status ?? 200 }) },
}));
export {};

type AccessMode = "owner" | "partner" | "legacy" | "revoked" | "stranger" | "anonymous";
type Filter = { column: string; value: unknown };
type Operation = "select" | "insert" | "update" | "delete";
type QueryRecord = { table: string; operation: Operation; filters: Filter[]; values?: Record<string, unknown>; projection?: string };

const eventA = "52320000-0000-4000-8000-000000000001";
const eventB = "52320000-0000-4000-8000-000000000002";
const savedLocationA = "52320000-0000-4000-8000-000000000010";
const savedLocationB = "52320000-0000-4000-8000-000000000011";
const savedSupplierA = "52320000-0000-4000-8000-000000000020";
const savedSupplierB = "52320000-0000-4000-8000-000000000021";
const privateLocationA = "52320000-0000-4000-8000-000000000030";
const privateSupplierA = "52320000-0000-4000-8000-000000000040";
const linkA = "52320000-0000-4000-8000-000000000050";
const linkB = "52320000-0000-4000-8000-000000000051";

let accessMode: AccessMode = "owner";
let currentEventId = eventA;
const mockRequireAccess = jest.fn(async () => {
  if (accessMode === "anonymous") throw new Error("AUTHENTICATION_REQUIRED");
  if (accessMode === "revoked" || accessMode === "stranger") throw new Error("NO_EVENT");
  return { userId: "52320000-0000-4000-8000-000000000099", currentEvent: { eventId: currentEventId, accessRole: accessMode } };
});

jest.mock("@/lib/planningSelectionAuthorization", () => ({
  requirePlanningSelectionAccess: () => mockRequireAccess(),
  planningSelectionErrorResponse: (error: unknown) => {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    return { status: message === "AUTHENTICATION_REQUIRED" ? 401 : message === "NO_EVENT" ? 404 : 500, json: async () => ({ error: message }) };
  },
}));

type LinkRow = {
  id: string; event_id: string; saved_location_id: string | null; private_location_id: string | null;
  saved_supplier_id: string | null; private_supplier_id: string | null; relationship_type: string;
  private_notes: string | null; created_by: string; created_at: string; updated_at: string;
};

const resources = {
  saved_locations: [
    { id: savedLocationA, event_id: eventA, location_id: "52320000-0000-4000-8000-000000000060", name: "Saved location A" },
    { id: savedLocationB, event_id: eventB, location_id: "52320000-0000-4000-8000-000000000061", name: "Saved location B" },
  ],
  saved_suppliers: [
    { id: savedSupplierA, event_id: eventA, supplier_id: "52320000-0000-4000-8000-000000000070", name: "Saved supplier A" },
    { id: savedSupplierB, event_id: eventB, supplier_id: "52320000-0000-4000-8000-000000000071", name: "Saved supplier B" },
  ],
  event_private_catalog_records: [
    { id: privateLocationA, event_id: eventA, entity_type: "location", name: "Private location A" },
    { id: privateSupplierA, event_id: eventA, entity_type: "supplier", name: "Private supplier A" },
  ],
};

const initialLinks: LinkRow[] = [
  { id: linkA, event_id: eventA, saved_location_id: savedLocationA, private_location_id: null, saved_supplier_id: savedSupplierA, private_supplier_id: null, relationship_type: "recommended", private_notes: null, created_by: "owner", created_at: "2026-09-19", updated_at: "2026-09-19" },
  { id: linkB, event_id: eventB, saved_location_id: savedLocationB, private_location_id: null, saved_supplier_id: savedSupplierB, private_supplier_id: null, relationship_type: "recommended", private_notes: null, created_by: "owner", created_at: "2026-09-19", updated_at: "2026-09-19" },
];
let links: LinkRow[] = [];
let nextId = 80;
const queryLog: QueryRecord[] = [];

function hydrate(row: LinkRow) {
  const savedLocation = resources.saved_locations.find((item) => item.id === row.saved_location_id);
  const savedSupplier = resources.saved_suppliers.find((item) => item.id === row.saved_supplier_id);
  const privateLocation = resources.event_private_catalog_records.find((item) => item.id === row.private_location_id);
  const privateSupplier = resources.event_private_catalog_records.find((item) => item.id === row.private_supplier_id);
  return {
    ...row,
    saved_location: savedLocation ? { id: savedLocation.id, location_id: savedLocation.location_id, catalog_snapshot: { name: savedLocation.name }, private_overrides: {}, location: { name: savedLocation.name } } : null,
    saved_supplier: savedSupplier ? { id: savedSupplier.id, supplier_id: savedSupplier.supplier_id, catalog_snapshot: { name: savedSupplier.name }, private_overrides: {}, supplier: { name: savedSupplier.name } } : null,
    private_location: privateLocation ? { id: privateLocation.id, entity_type: "location", snapshot_data: { name: privateLocation.name }, override_data: {} } : null,
    private_supplier: privateSupplier ? { id: privateSupplier.id, entity_type: "supplier", snapshot_data: { name: privateSupplier.name }, override_data: {} } : null,
  };
}

function mockCreateQuery(table: keyof typeof resources | "event_location_supplier_links") {
  const record: QueryRecord = { table, operation: "select", filters: [] };
  const source = () => table === "event_location_supplier_links" ? links : resources[table];
  const matching = () => source().filter((row) => record.filters.every((filter) => row[filter.column as keyof typeof row] === filter.value));
  const executeOne = () => {
    if (table !== "event_location_supplier_links") return { data: matching()[0] ?? null, error: null };
    if (record.operation === "insert") {
      const value = record.values ?? {};
      const duplicate = links.find((row) => row.event_id === value.event_id
        && row.saved_location_id === (value.saved_location_id ?? null)
        && row.private_location_id === (value.private_location_id ?? null)
        && row.saved_supplier_id === (value.saved_supplier_id ?? null)
        && row.private_supplier_id === (value.private_supplier_id ?? null)
        && row.relationship_type === value.relationship_type);
      if (duplicate) return { data: null, error: { code: "23505" } };
      const row: LinkRow = {
        id: `52320000-0000-4000-8000-${String(nextId++).padStart(12, "0")}`,
        event_id: String(value.event_id), saved_location_id: value.saved_location_id as string | null,
        private_location_id: value.private_location_id as string | null, saved_supplier_id: value.saved_supplier_id as string | null,
        private_supplier_id: value.private_supplier_id as string | null, relationship_type: String(value.relationship_type),
        private_notes: value.private_notes as string | null, created_by: String(value.created_by), created_at: "2026-09-20", updated_at: "2026-09-20",
      };
      links.push(row);
      return { data: hydrate(row), error: null };
    }
    const row = matching()[0] as LinkRow | undefined;
    if (record.operation === "update" && row) Object.assign(row, record.values, { updated_at: "2026-09-21" });
    if (record.operation === "delete" && row) links = links.filter((item) => item.id !== row.id);
    return { data: row ? hydrate(row) : null, error: null };
  };
  const query: {
    select: jest.Mock;
    eq: jest.Mock;
    order: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    single: jest.Mock;
    maybeSingle: jest.Mock;
    then: (resolve: (value: { data: unknown[]; error: null }) => unknown) => Promise<unknown>;
  } = {
    select: jest.fn((projection: string) => { record.projection = projection; return query; }),
    eq: jest.fn((column: string, value: unknown) => { record.filters.push({ column, value }); return query; }),
    order: jest.fn(() => query),
    insert: jest.fn((values: Record<string, unknown>) => { record.operation = "insert"; record.values = values; return query; }),
    update: jest.fn((values: Record<string, unknown>) => { record.operation = "update"; record.values = values; return query; }),
    delete: jest.fn(() => { record.operation = "delete"; return query; }),
    single: jest.fn(async () => { queryLog.push(record); return executeOne(); }),
    maybeSingle: jest.fn(async () => { queryLog.push(record); return executeOne(); }),
    then: (resolve: (value: { data: unknown[]; error: null }) => unknown) => {
      queryLog.push(record);
      const data = matching().map((row) => table === "event_location_supplier_links" ? hydrate(row as LinkRow) : row);
      return Promise.resolve(resolve({ data, error: null }));
    },
  };
  return query;
}

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({ from: (table: keyof typeof resources | "event_location_supplier_links") => mockCreateQuery(table) }),
}));

function request(method: string, url = "http://localhost/api/my/location-supplier-associations", body?: unknown) {
  return { method, nextUrl: new URL(url), json: jest.fn(async () => body) } as unknown as import("next/server").NextRequest;
}

function payload(locationScope: "saved" | "private", supplierScope: "saved" | "private") {
  return {
    location: { scope: locationScope, resource_id: locationScope === "saved" ? savedLocationA : privateLocationA },
    supplier: { scope: supplierScope, resource_id: supplierScope === "saved" ? savedSupplierA : privateSupplierA },
    relationship_type: "works_at",
    private_notes: "private",
  };
}

describe("/api/my/location-supplier-associations", () => {
  beforeEach(() => {
    accessMode = "owner";
    currentEventId = eventA;
    links = initialLinks.map((row) => ({ ...row }));
    queryLog.length = 0;
    nextId = 80;
    jest.clearAllMocks();
  });

  it.each(["owner", "partner"] as const)("lets an active %s list only CurrentEvent links", async (mode) => {
    accessMode = mode;
    const route = await import("./route");
    const response = await route.GET(request("GET"));
    expect(response.status).toBe(200);
    const body = await response.json() as { associations: Array<{ id: string }> };
    expect(body.associations.map((item) => item.id)).toEqual([linkA]);
    expect(queryLog[0].filters).toContainEqual({ column: "event_id", value: eventA });
    expect(queryLog[0].projection).not.toContain("*");
  });

  it.each([["revoked", 404], ["stranger", 404], ["anonymous", 401]] as const)("denies %s before database access", async (mode, status) => {
    accessMode = mode;
    const route = await import("./route");
    expect((await route.GET(request("GET"))).status).toBe(status);
    expect(queryLog).toHaveLength(0);
  });

  it("rejects legacy email-based access with 403", async () => {
    accessMode = "legacy";
    const route = await import("./route");
    expect((await route.GET(request("GET"))).status).toBe(403);
    expect(queryLog).toHaveLength(0);
  });

  it("does not enumerate a resource from another event", async () => {
    const route = await import("./route");
    const response = await route.GET(request("GET", `http://localhost/api/my/location-supplier-associations?resource_id=${linkB}`));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "PRIVATE_ASSOCIATION_NOT_FOUND" });
  });

  it("switches with the authoritative CurrentEvent and never trusts an event_id payload", async () => {
    const route = await import("./route");
    currentEventId = eventB;
    const list = await route.GET(request("GET"));
    expect((await list.json()).associations.map((item: { id: string }) => item.id)).toEqual([linkB]);
    const create = await route.POST(request("POST", undefined, { ...payload("saved", "saved"), event_id: eventA }));
    expect(create.status).toBe(400);
  });

  it.each([
    ["saved", "saved"], ["saved", "private"], ["private", "saved"], ["private", "private"],
  ] as const)("creates the %s/%s endpoint combination", async (locationScope, supplierScope) => {
    const route = await import("./route");
    const response = await route.POST(request("POST", undefined, payload(locationScope, supplierScope)));
    expect(response.status).toBe(201);
    expect((await response.json()).association).toMatchObject({ location: { scope: locationScope }, supplier: { scope: supplierScope } });
  });

  it("rejects an endpoint from another event before insert", async () => {
    const route = await import("./route");
    const response = await route.POST(request("POST", undefined, {
      ...payload("saved", "saved"), location: { scope: "saved", resource_id: savedLocationB },
    }));
    expect(response.status).toBe(404);
    expect(queryLog.some((item) => item.operation === "insert")).toBe(false);
  });

  it("treats repeated and concurrent exact creates as one association", async () => {
    const route = await import("./route");
    links = links.filter((item) => item.relationship_type !== "works_at");
    const [first, second] = await Promise.all([
      route.POST(request("POST", undefined, payload("private", "private"))),
      route.POST(request("POST", undefined, payload("private", "private"))),
    ]);
    expect([first.status, second.status].sort()).toEqual([200, 201]);
    expect(links.filter((item) => item.private_location_id === privateLocationA && item.private_supplier_id === privateSupplierA && item.relationship_type === "works_at")).toHaveLength(1);
  });

  it("updates and deletes only a CurrentEvent resource", async () => {
    const route = await import("./route");
    const update = await route.PATCH(request("PATCH", undefined, { resource_id: linkA, relationship_type: "internal_supplier", private_notes: "updated" }));
    expect(update.status).toBe(200);
    expect(links.find((item) => item.id === linkA)).toMatchObject({ relationship_type: "internal_supplier", private_notes: "updated" });
    const foreignDelete = await route.DELETE(request("DELETE", `http://localhost/api/my/location-supplier-associations?resource_id=${linkB}`));
    expect(foreignDelete.status).toBe(404);
    const ownDelete = await route.DELETE(request("DELETE", `http://localhost/api/my/location-supplier-associations?resource_id=${linkA}`));
    expect(ownDelete.status).toBe(200);
    expect(links.some((item) => item.id === linkA)).toBe(false);
    expect(links.some((item) => item.id === linkB)).toBe(true);
  });
});
