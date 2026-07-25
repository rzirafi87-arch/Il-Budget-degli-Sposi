export {};

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
    }),
  },
}));

const mockRequireUser = jest.fn(async (req: { headers: Headers }) => {
  const token = req.headers.get("authorization");
  if (token === "Bearer token-a") return { userId: "user-a" };
  if (token === "Bearer token-b") return { userId: "user-b" };
  throw new Error("Unauthorized");
});

jest.mock("@/lib/apiAuth", () => ({
  requireUser: (req: { headers: Headers }) => mockRequireUser(req),
}));

jest.mock("@/data/templates/babyshower", () => ({
  __esModule: true,
  default: {
    categories: [
      {
        name: "Venue",
        icon: "home",
        subcategories: [
          { name: "Room", estimated_cost: 100, description: "A room" },
        ],
      },
    ],
    timeline: [
      {
        phase: "Planning",
        items: [{ title: "Book", description: "Book room", days_before: 30 }],
      },
    ],
  },
}));

type EventRow = { id: string; owner_id: string };
type Filter = { column: string; value: unknown };
type Operation = {
  kind: "select" | "upsert" | "rpc";
  table?: string;
  columns?: string;
  filters?: Filter[];
  values?: Record<string, unknown>;
  options?: Record<string, unknown>;
  fn?: string;
  args?: Record<string, unknown>;
};

const events: EventRow[] = [
  { id: "event-a", owner_id: "user-a" },
  { id: "event-b", owner_id: "user-b" },
];
const operations: Operation[] = [];
let nextCategoryId = "category-1";
let verifiedEventId: string | null = null;

function createQuery(table: string) {
  const record: Operation = { kind: "select", table, filters: [] };

  const execute = () => {
    operations.push({
      ...record,
      filters: [...(record.filters ?? [])],
      values: record.values ? { ...record.values } : undefined,
      options: record.options ? { ...record.options } : undefined,
    });

    if (table === "events") {
      const row = events.find((candidate) =>
        (record.filters ?? []).every(
          ({ column, value }) => candidate[column as keyof EventRow] === value
        )
      );
      return { data: row ? { id: verifiedEventId ?? row.id } : null, error: null };
    }
    if (table === "categories") {
      return { data: { id: nextCategoryId }, error: null };
    }
    return { data: null, error: null };
  };

  const query = {
    select(columns: string) {
      record.columns = columns;
      return query;
    },
    eq(column: string, value: unknown) {
      record.filters?.push({ column, value });
      return query;
    },
    upsert(values: Record<string, unknown>, options: Record<string, unknown>) {
      record.kind = "upsert";
      record.values = values;
      record.options = options;
      return query;
    },
    async maybeSingle() {
      return execute();
    },
    async single() {
      return execute();
    },
    then<TResult1 = { data: null; error: null }, TResult2 = never>(
      onfulfilled?: ((value: { data: null; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ) {
      return Promise.resolve(execute() as { data: null; error: null }).then(
        onfulfilled,
        onrejected
      );
    },
  };
  return query;
}

const mockServiceClient = {
  from: jest.fn((table: string) => createQuery(table)),
  rpc: jest.fn(async (fn: string, args: Record<string, unknown>) => {
    operations.push({ kind: "rpc", fn, args: { ...args } });
    return { error: null };
  }),
};

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => mockServiceClient,
}));

function request(token?: string) {
  return {
    headers: new Headers(token ? { authorization: `Bearer ${token}` } : {}),
  } as unknown as import("next/server").NextRequest;
}

function context(eventId: string) {
  return { params: Promise.resolve({ eventId }) };
}

const routes = [
  {
    name: "generic seed",
    load: () => import("./seed/[eventId]/route"),
    seedKinds: ["rpc"],
  },
  {
    name: "baby shower seed",
    load: () => import("./babyshower/seed/[eventId]/route"),
    seedKinds: ["upsert"],
  },
];

function expectOwnershipCheck(eventId: string, userId: string) {
  expect(operations[0]).toEqual({
    kind: "select",
    table: "events",
    columns: "id",
    filters: [
      { column: "id", value: eventId },
      { column: "owner_id", value: userId },
    ],
    values: undefined,
    options: undefined,
  });
}

describe("seed route authentication and event ownership", () => {
  beforeEach(() => {
    operations.length = 0;
    nextCategoryId = "category-1";
    verifiedEventId = null;
    jest.clearAllMocks();
  });

  it.each(routes)("returns 401 to anonymous requests before database access: $name", async ({ load }) => {
    const route = await load();
    const response = await route.POST(request(), context("event-a"));

    expect(response.status).toBe(401);
    expect(mockServiceClient.from).not.toHaveBeenCalled();
    expect(mockServiceClient.rpc).not.toHaveBeenCalled();
    expect(operations).toEqual([]);
  });

  it.each(routes)("returns 401 for an invalid token before database access: $name", async ({ load }) => {
    const route = await load();
    const response = await route.POST(request("invalid"), context("event-a"));

    expect(response.status).toBe(401);
    expect(mockServiceClient.from).not.toHaveBeenCalled();
    expect(mockServiceClient.rpc).not.toHaveBeenCalled();
    expect(operations).toEqual([]);
  });

  it.each(routes)("returns 404 for an unknown event without seeding: $name", async ({ load }) => {
    const route = await load();
    const response = await route.POST(request("token-a"), context("missing"));

    expect(response.status).toBe(404);
    expectOwnershipCheck("missing", "user-a");
    expect(operations).toHaveLength(1);
  });

  it.each(routes)("returns 404 for user B's event requested by user A without seeding: $name", async ({ load }) => {
    const route = await load();
    const response = await route.POST(request("token-a"), context("event-b"));

    expect(response.status).toBe(404);
    expectOwnershipCheck("event-b", "user-a");
    expect(operations).toHaveLength(1);
  });

  it.each(routes)("allows the owner and seeds only after ownership verification: $name", async ({ load, seedKinds }) => {
    const route = await load();
    const response = await route.POST(request("token-a"), context("event-a"));

    expect(response.status).toBe(200);
    expectOwnershipCheck("event-a", "user-a");
    expect(operations.slice(1).every(({ kind }) => seedKinds.includes(kind))).toBe(true);
    expect(operations.length).toBeGreaterThan(1);
  });

  it("passes the verified event id to seed_full_event", async () => {
    verifiedEventId = "canonical-event-a";
    const route = await import("./seed/[eventId]/route");
    await route.POST(request("token-a"), context("event-a"));

    expect(operations).toEqual([
      expect.objectContaining({ kind: "select", table: "events" }),
      { kind: "rpc", fn: "seed_full_event", args: { p_event: "canonical-event-a" } },
    ]);
  });

  it("uses the verified event id in every baby shower event-scoped upsert", async () => {
    verifiedEventId = "canonical-event-a";
    const route = await import("./babyshower/seed/[eventId]/route");
    await route.POST(request("token-a"), context("event-a"));

    const category = operations.find((operation) => operation.table === "categories");
    const timeline = operations.find((operation) => operation.table === "timeline_items");
    const subcategory = operations.find((operation) => operation.table === "subcategories");

    expect(category?.values).toEqual(
      expect.objectContaining({ event_id: "canonical-event-a" })
    );
    expect(timeline?.values).toEqual(
      expect.objectContaining({ event_id: "canonical-event-a" })
    );
    expect(subcategory?.values).toEqual(
      expect.objectContaining({ category_id: "category-1" })
    );
    expect(operations.map(({ table, kind }) => table ?? kind)).toEqual([
      "events",
      "categories",
      "subcategories",
      "timeline_items",
    ]);
  });
});
