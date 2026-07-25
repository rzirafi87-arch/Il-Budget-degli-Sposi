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
  if (token === "Bearer token-c") return { userId: "user-c" };
  throw new Error("Unauthorized");
});

jest.mock("@/lib/apiAuth", () => ({
  requireUser: (req: { headers: Headers }) => mockRequireUser(req),
}));

type EventKey = "baby-shower" | "birthday" | "engagement-party";
type Budget = {
  id: string;
  user_id: string;
  event_key: EventKey;
  currency: string;
  lines: unknown[];
};
type BudgetFilter = { column: string; value: unknown };
type BudgetQueryRecord = {
  table: string;
  operation: "select" | "insert";
  columns?: string;
  filters: BudgetFilter[];
  values?: Omit<Budget, "id">;
};

const BUDGET_COLUMNS = "*";
const initialBudgets: Budget[] = [
  { id: "baby-a", user_id: "user-a", event_key: "baby-shower", currency: "EUR", lines: [] },
  { id: "baby-b", user_id: "user-b", event_key: "baby-shower", currency: "USD", lines: [] },
  { id: "birthday-a", user_id: "user-a", event_key: "birthday", currency: "EUR", lines: [] },
  { id: "birthday-b", user_id: "user-b", event_key: "birthday", currency: "USD", lines: [] },
  { id: "engagement-a", user_id: "user-a", event_key: "engagement-party", currency: "EUR", lines: [] },
  { id: "engagement-b", user_id: "user-b", event_key: "engagement-party", currency: "USD", lines: [] },
];

let budgets: Budget[];
const budgetQueryLog: BudgetQueryRecord[] = [];

function selectColumns(row: Budget, columns?: string) {
  if (!columns || columns === "*") return { ...row };
  return Object.fromEntries(
    columns.split(",").map((column) => {
      const key = column.trim() as keyof Budget;
      return [key, row[key]];
    })
  );
}

function createBudgetQuery() {
  const record: BudgetQueryRecord = { table: "budgets", operation: "select", filters: [] };
  const query = {
    select(columns: string) {
      record.columns = columns;
      return query;
    },
    insert(values: Omit<Budget, "id">) {
      record.operation = "insert" as const;
      record.values = values;
      return query;
    },
    eq(column: string, value: unknown) {
      record.filters.push({ column, value });
      return query;
    },
    async maybeSingle() {
      budgetQueryLog.push({ ...record, filters: [...record.filters] });
      const row = budgets.find((candidate) =>
        record.filters.every(({ column, value }) => candidate[column as keyof Budget] === value)
      );
      return { data: row ? selectColumns(row, record.columns) : null, error: null };
    },
    async single() {
      budgetQueryLog.push({ ...record, filters: [...record.filters] });
      if (record.operation !== "insert" || !record.values) {
        throw new Error("Unexpected single query");
      }
      const row: Budget = { id: `created-${budgets.length + 1}`, ...record.values };
      budgets.push(row);
      return { data: selectColumns(row, record.columns), error: null };
    },
  };
  return query;
}

const mockGetSupabaseAdmin = jest.fn(() => ({
  from: jest.fn((table: string) => {
    if (table !== "budgets") throw new Error(`Unexpected table: ${table}`);
    return createBudgetQuery();
  }),
}));

jest.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => mockGetSupabaseAdmin(),
}));

const routes = [
  {
    key: "baby-shower" as const,
    get: () => import("./baby-shower/get/route"),
    init: () => import("./baby-shower/init/route"),
  },
  {
    key: "birthday" as const,
    get: () => import("./birthday/get/route"),
    init: () => import("./birthday/init/route"),
  },
  {
    key: "engagement-party" as const,
    get: () => import("./engagement-party/get/route"),
    init: () => import("./engagement-party/init/route"),
  },
];

function request(token?: string, url = "http://localhost/api/events/test", body?: unknown) {
  return {
    headers: new Headers(token ? { authorization: `Bearer ${token}` } : {}),
    nextUrl: new URL(url),
    json: async () => body,
  } as unknown as import("next/server").NextRequest;
}

function expectOwnerQuery(record: BudgetQueryRecord | undefined, userId: string, eventKey: EventKey) {
  expect(record).toMatchObject({
    table: "budgets",
    operation: "select",
    columns: BUDGET_COLUMNS,
    filters: [
      { column: "user_id", value: userId },
      { column: "event_key", value: eventKey },
    ],
  });
}

describe("event budget get/init authentication and ownership", () => {
  beforeEach(() => {
    budgets = initialBudgets.map((budget) => ({ ...budget, lines: [...budget.lines] }));
    budgetQueryLog.length = 0;
    jest.clearAllMocks();
  });

  it.each(routes)("returns 401 to anonymous requests for both $key routes", async ({ get, init }) => {
    const getRoute = await get();
    const initRoute = await init();

    const getResponse = await getRoute.GET(request());
    const initResponse = await initRoute.POST(request(undefined, undefined, {}));

    expect(getResponse.status).toBe(401);
    expect(initResponse.status).toBe(401);
    expect(mockGetSupabaseAdmin).not.toHaveBeenCalled();
    expect(budgetQueryLog).toEqual([]);
  });

  it.each(routes)("returns 401 for an invalid token on both $key routes", async ({ get, init }) => {
    const getRoute = await get();
    const initRoute = await init();

    const getResponse = await getRoute.GET(request("invalid-token"));
    const initResponse = await initRoute.POST(request("invalid-token", undefined, {}));

    expect(getResponse.status).toBe(401);
    expect(initResponse.status).toBe(401);
    expect(mockGetSupabaseAdmin).not.toHaveBeenCalled();
    expect(budgetQueryLog).toEqual([]);
  });

  it.each(routes)(
    "ignores a malicious userId and only lets user A read A's $key budget",
    async ({ key, get }) => {
      const route = await get();
      const response = await route.GET(
        request("token-a", `http://localhost/api/events/${key}/get?userId=user-b`)
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        data: expect.objectContaining({ id: `${key === "baby-shower" ? "baby" : key === "engagement-party" ? "engagement" : key}-a`, user_id: "user-a" }),
      });
      expectOwnerQuery(budgetQueryLog[0], "user-a", key);
      expect(budgetQueryLog.some((query) => query.filters.some((filter) => filter.value === "user-b"))).toBe(false);
    }
  );

  it.each(routes)(
    "ignores a malicious userId and only retrieves A's existing $key budget during init",
    async ({ key, init }) => {
      const route = await init();
      const response = await route.POST(
        request("token-a", `http://localhost/api/events/${key}/init`, {
          userId: "user-b",
          currency: "GBP",
        })
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        data: expect.objectContaining({ user_id: "user-a", event_key: key }),
      });
      expectOwnerQuery(budgetQueryLog[0], "user-a", key);
      expect(budgetQueryLog).toHaveLength(1);
      expect(budgets.find((budget) => budget.user_id === "user-b" && budget.event_key === key)?.currency).toBe("USD");
    }
  );

  it.each(routes)(
    "initializes only the authenticated user's own $key budget",
    async ({ key, init }) => {
      const route = await init();
      const response = await route.POST(
        request("token-c", `http://localhost/api/events/${key}/init`, {
          userId: "user-b",
          currency: "GBP",
        })
      );

      expect(response.status).toBe(200);
      expectOwnerQuery(budgetQueryLog[0], "user-c", key);
      expect(budgetQueryLog[1]).toEqual({
        table: "budgets",
        operation: "insert",
        columns: BUDGET_COLUMNS,
        filters: [],
        values: { user_id: "user-c", event_key: key, currency: "GBP", lines: [] },
      });
      expect(await response.json()).toEqual({
        data: expect.objectContaining({
          user_id: "user-c",
          event_key: key,
          currency: "GBP",
        }),
      });
      expect(budgets.some((budget) => budget.user_id === "user-b" && budget.currency === "GBP")).toBe(false);
    }
  );
});
