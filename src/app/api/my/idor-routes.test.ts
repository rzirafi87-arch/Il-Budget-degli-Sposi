jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
    }),
  },
}));

jest.mock("@/lib/apiAuth", () => ({
  requireUser: jest.fn(async () => ({ userId: "user-a" })),
}));

type Table = "expenses" | "incomes" | "appointments" | "events";
type Operation = "select" | "update" | "delete";
type Filter = { column: string; value: unknown };
type Row = {
  id: string;
  event_id?: string;
  owner_id?: string;
  committed_amount?: number;
  paid_amount?: number;
  status?: string;
};
type QueryRecord = {
  table: Table;
  operation: Operation;
  columns?: string;
  values?: Record<string, unknown>;
  filters: Filter[];
};
type QueryResult = { data: Record<string, unknown> | null; error: null };
type MockQuery = {
  select: (columns: string) => MockQuery;
  update: (values: Record<string, unknown>) => MockQuery;
  delete: () => MockQuery;
  eq: (column: string, value: unknown) => MockQuery;
  maybeSingle: () => Promise<QueryResult>;
  then: (
    resolve: (result: QueryResult) => unknown,
    reject?: (reason: unknown) => unknown
  ) => Promise<unknown>;
};

const initialRows: Record<Table, Row[]> = {
  events: [
    { id: "event-a", owner_id: "user-a" },
    { id: "event-b", owner_id: "user-b" },
  ],
  expenses: [
    { id: "expense-a", event_id: "event-a", committed_amount: 250, status: "pending" },
    { id: "expense-b", event_id: "event-b", committed_amount: 400, status: "pending" },
  ],
  incomes: [
    { id: "income-a", event_id: "event-a" },
    { id: "income-b", event_id: "event-b" },
  ],
  appointments: [
    { id: "appointment-a", event_id: "event-a" },
    { id: "appointment-b", event_id: "event-b" },
  ],
};

let rows: Record<Table, Row[]>;
const queryLog: QueryRecord[] = [];

function cloneRows(): Record<Table, Row[]> {
  return {
    events: initialRows.events.map((row) => ({ ...row })),
    expenses: initialRows.expenses.map((row) => ({ ...row })),
    incomes: initialRows.incomes.map((row) => ({ ...row })),
    appointments: initialRows.appointments.map((row) => ({ ...row })),
  };
}

function matchesFilters(row: Row, filters: Filter[]) {
  return filters.every(({ column, value }) => row[column as keyof Row] === value);
}

function selectedRow(row: Row, columns?: string): Record<string, unknown> {
  if (!columns) return { ...row };
  return Object.fromEntries(
    columns.split(",").map((column) => {
      const key = column.trim() as keyof Row;
      return [key, row[key]];
    })
  );
}

function createQuery(table: Table) {
  const record: QueryRecord = { table, operation: "select", filters: [] };

  const execute = (): QueryResult => {
    const matchingRows = rows[table].filter((row) => matchesFilters(row, record.filters));

    if (record.operation === "update") {
      matchingRows.forEach((row) => Object.assign(row, record.values));
      return { data: null, error: null };
    }

    if (record.operation === "delete") {
      rows[table] = rows[table].filter((row) => !matchesFilters(row, record.filters));
      return { data: null, error: null };
    }

    const row = matchingRows[0];
    return { data: row ? selectedRow(row, record.columns) : null, error: null };
  };

  const query = {} as MockQuery;
  Object.assign(query, {
    select: jest.fn((columns: string) => {
      record.operation = "select";
      record.columns = columns;
      return query;
    }),
    update: jest.fn((values: Record<string, unknown>) => {
      record.operation = "update";
      record.values = values;
      return query;
    }),
    delete: jest.fn(() => {
      record.operation = "delete";
      return query;
    }),
    eq: jest.fn((column: string, value: unknown) => {
      record.filters.push({ column, value });
      return query;
    }),
    maybeSingle: jest.fn(async () => {
      queryLog.push(record);
      return execute();
    }),
    then: (
      resolve: (result: QueryResult) => unknown,
      reject?: (reason: unknown) => unknown
    ) => {
      queryLog.push(record);
      return Promise.resolve(execute()).then(resolve, reject);
    },
  });

  return query;
}

const mockGetServiceClient = jest.fn(() => ({
  from: (table: Table) => createQuery(table),
}));

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => mockGetServiceClient(),
}));

function expectFilters(
  record: QueryRecord | undefined,
  expected: Array<[column: string, value: unknown]>
) {
  expect(record?.filters).toEqual(
    expected.map(([column, value]) => ({ column, value }))
  );
}

function findQuery(table: Table, operation: Operation, columns?: string) {
  return queryLog.find(
    (record) =>
      record.table === table &&
      record.operation === operation &&
      (columns === undefined || record.columns === columns)
  );
}

describe("IDOR protection for resource routes", () => {
  beforeEach(() => {
    rows = cloneRows();
    queryLog.length = 0;
    jest.clearAllMocks();
  });

  it("prevents user A from reading committed_amount or updating user B's expense", async () => {
    const route = await import("./expenses/[id]/route");
    const response = await route.PATCH(
      {
        headers: new Headers({ authorization: "Bearer token-a" }),
        json: async () => ({ status: "approved" }),
      } as unknown as import("next/server").NextRequest,
      { params: Promise.resolve({ id: "expense-b" }) }
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
    expectFilters(findQuery("events", "select", "id"), [
      ["id", "event-b"],
      ["owner_id", "user-a"],
    ]);
    expect(findQuery("expenses", "select", "committed_amount")).toBeUndefined();
    expect(findQuery("expenses", "update")).toBeUndefined();
    const otherUsersExpense = rows.expenses.find((row) => row.id === "expense-b");
    expect(otherUsersExpense?.status).toBe("pending");
    expect(otherUsersExpense).not.toHaveProperty("paid_amount");
  });

  it("prevents user A from deleting user B's income", async () => {
    const route = await import("./incomes/[id]/route");
    const response = await route.DELETE(
      { headers: new Headers({ authorization: "Bearer token-a" }) } as unknown as import("next/server").NextRequest,
      { params: Promise.resolve({ id: "income-b" }) }
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
    expectFilters(findQuery("events", "select", "id"), [
      ["id", "event-b"],
      ["owner_id", "user-a"],
    ]);
    expect(findQuery("incomes", "delete")).toBeUndefined();
    expect(rows.incomes.some((row) => row.id === "income-b")).toBe(true);
  });

  it("prevents user A from deleting user B's appointment", async () => {
    const route = await import("./appointments/[id]/route");
    const response = await route.DELETE(
      { headers: new Headers({ authorization: "Bearer token-a" }) } as unknown as import("next/server").NextRequest,
      { params: Promise.resolve({ id: "appointment-b" }) }
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
    expectFilters(findQuery("events", "select", "id"), [
      ["id", "event-b"],
      ["owner_id", "user-a"],
    ]);
    expect(findQuery("appointments", "delete")).toBeUndefined();
    expect(rows.appointments.some((row) => row.id === "appointment-b")).toBe(true);
  });

  it.each([
    ["expense", "expenses", "missing-expense"],
    ["income", "incomes", "missing-income"],
    ["appointment", "appointments", "missing-appointment"],
  ] as const)("returns 404 and makes no changes for a missing %s ID", async (_name, table, id) => {
    let response: { status: number; json: () => Promise<unknown> };

    if (table === "expenses") {
      const route = await import("./expenses/[id]/route");
      response = await route.PATCH(
        {
          headers: new Headers({ authorization: "Bearer token-a" }),
          json: async () => ({ status: "approved" }),
        } as unknown as import("next/server").NextRequest,
        { params: Promise.resolve({ id }) }
      );
    } else if (table === "incomes") {
      const route = await import("./incomes/[id]/route");
      response = await route.DELETE(
        { headers: new Headers({ authorization: "Bearer token-a" }) } as unknown as import("next/server").NextRequest,
        { params: Promise.resolve({ id }) }
      );
    } else {
      const route = await import("./appointments/[id]/route");
      response = await route.DELETE(
        { headers: new Headers({ authorization: "Bearer token-a" }) } as unknown as import("next/server").NextRequest,
        { params: Promise.resolve({ id }) }
      );
    }

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
    expect(queryLog.some((record) => record.operation !== "select")).toBe(false);
    expect(rows).toEqual(initialRows);
  });

  it("allows the owner to update an expense after ownership is verified", async () => {
    const route = await import("./expenses/[id]/route");
    const response = await route.PATCH(
      {
        headers: new Headers({ authorization: "Bearer token-a" }),
        json: async () => ({ status: "approved" }),
      } as unknown as import("next/server").NextRequest,
      { params: Promise.resolve({ id: "expense-a" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const ownershipIndex = queryLog.findIndex(
      (record) => record.table === "events" && record.columns === "id"
    );
    const amountIndex = queryLog.findIndex(
      (record) => record.table === "expenses" && record.columns === "committed_amount"
    );
    expect(ownershipIndex).toBeGreaterThanOrEqual(0);
    expect(amountIndex).toBeGreaterThan(ownershipIndex);
    expectFilters(queryLog[ownershipIndex], [
      ["id", "event-a"],
      ["owner_id", "user-a"],
    ]);
    expectFilters(queryLog[amountIndex], [
      ["id", "expense-a"],
      ["event_id", "event-a"],
    ]);
    expectFilters(findQuery("expenses", "update"), [
      ["id", "expense-a"],
      ["event_id", "event-a"],
    ]);
    expect(rows.expenses.find((row) => row.id === "expense-a")).toMatchObject({
      status: "approved",
      paid_amount: 250,
    });
  });

  it("allows the owner to delete an income using the verified event ID", async () => {
    const route = await import("./incomes/[id]/route");
    const response = await route.DELETE(
      { headers: new Headers({ authorization: "Bearer token-a" }) } as unknown as import("next/server").NextRequest,
      { params: Promise.resolve({ id: "income-a" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expectFilters(findQuery("events", "select", "id"), [
      ["id", "event-a"],
      ["owner_id", "user-a"],
    ]);
    expectFilters(findQuery("incomes", "delete"), [
      ["id", "income-a"],
      ["event_id", "event-a"],
    ]);
    expect(rows.incomes.some((row) => row.id === "income-a")).toBe(false);
  });

  it("allows the owner to delete an appointment using the verified event ID", async () => {
    const route = await import("./appointments/[id]/route");
    const response = await route.DELETE(
      { headers: new Headers({ authorization: "Bearer token-a" }) } as unknown as import("next/server").NextRequest,
      { params: Promise.resolve({ id: "appointment-a" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expectFilters(findQuery("events", "select", "id"), [
      ["id", "event-a"],
      ["owner_id", "user-a"],
    ]);
    expectFilters(findQuery("appointments", "delete"), [
      ["id", "appointment-a"],
      ["event_id", "event-a"],
    ]);
    expect(rows.appointments.some((row) => row.id === "appointment-a")).toBe(false);
  });
});
