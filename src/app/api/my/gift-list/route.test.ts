jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
    }),
  },
}));

import fs from "node:fs";

type AccessMode = "owner" | "partner" | "anonymous" | "revoked" | "stranger";
let accessMode: AccessMode = "owner";
const eventA = "53210000-0000-4000-8000-000000000010";
const eventB = "53210000-0000-4000-8000-000000000011";
const ownerId = "53210000-0000-4000-8000-000000000001";
const partnerId = "53210000-0000-4000-8000-000000000002";
const itemA = "53210000-0000-4000-8000-000000000020";
const itemB = "53210000-0000-4000-8000-000000000021";

const mockRequireAccess = jest.fn(async () => {
  if (accessMode === "anonymous") throw { status: 401, code: "AUTHENTICATION_REQUIRED" };
  if (accessMode === "revoked" || accessMode === "stranger") throw { status: 404, code: "EVENT_NOT_FOUND" };
  return {
    currentEvent: { eventId: eventA, accessRole: accessMode },
    userId: accessMode === "partner" ? partnerId : ownerId,
  };
});

jest.mock("@/lib/apiSecurity", () => ({
  requireEventAccess: () => mockRequireAccess(),
  parseUuid: (value: unknown) => {
    if (typeof value !== "string") throw { status: 400, code: "INVALID_GIFT_ITEM_ID" };
    return value;
  },
  apiSecurityErrorResponse: (error: { status?: number; code?: string }, fallback: string) => ({
    status: error?.status ?? 500,
    json: async () => ({ error: error?.code ?? fallback }),
  }),
}));

type Row = {
  id: string;
  event_id: string;
  created_by: string;
  type: string;
  name: string;
  description: string | null;
  url: string | null;
  target_amount: number | null;
  priority: "high" | "medium" | "low";
  status: "wanted" | "received" | "archived";
  note: string | null;
  created_at: string;
  updated_at: string;
};
type Filter = { column: string; value: unknown };
type Operation = "select" | "insert" | "update" | "delete";
type QueryRecord = { operation: Operation; filters: Filter[]; values?: Record<string, unknown> };
type MockQuery = {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  single: jest.Mock;
  maybeSingle: jest.Mock;
};

const seed: Row[] = [
  { id: itemA, event_id: eventA, created_by: ownerId, type: "honeymoon", name: "Viaggio", description: null, url: null, target_amount: 1000, priority: "high", status: "wanted", note: null, created_at: "2026-09-22", updated_at: "2026-09-22" },
  { id: itemB, event_id: eventB, created_by: "other", type: "other", name: "Other", description: null, url: null, target_amount: null, priority: "medium", status: "wanted", note: null, created_at: "2026-09-22", updated_at: "2026-09-22" },
];
let rows: Row[] = [];
const queryLog: QueryRecord[] = [];

function mockCreateQuery() {
  const record: QueryRecord = { operation: "select", filters: [] };
  const matching = () => rows.filter((row) => record.filters.every(({ column, value }) => row[column as keyof Row] === value));
  const execute = () => {
    if (record.operation === "insert") {
      const created = {
        id: "53210000-0000-4000-8000-000000000099",
        description: null,
        url: null,
        target_amount: null,
        priority: "medium",
        status: "wanted",
        note: null,
        created_at: "2026-09-23",
        updated_at: "2026-09-23",
        ...record.values,
      } as Row;
      rows.push(created);
      return { data: created, error: null };
    }
    const found = matching()[0] ?? null;
    if (record.operation === "update" && found) {
      Object.assign(found, record.values, { updated_at: "2026-09-24" });
    }
    if (record.operation === "delete" && found) rows = rows.filter((row) => row.id !== found.id);
    return { data: found, error: null };
  };
  const query: MockQuery = {
    select: jest.fn(() => query),
    eq: jest.fn((column: string, value: unknown) => { record.filters.push({ column, value }); return query; }),
    order: jest.fn(async () => { queryLog.push(record); return { data: matching(), error: null }; }),
    insert: jest.fn((values: Record<string, unknown>) => { record.operation = "insert"; record.values = values; return query; }),
    update: jest.fn((values: Record<string, unknown>) => { record.operation = "update"; record.values = values; return query; }),
    delete: jest.fn(() => { record.operation = "delete"; return query; }),
    single: jest.fn(async () => { queryLog.push(record); return execute(); }),
    maybeSingle: jest.fn(async () => { queryLog.push(record); return execute(); }),
  };
  return query;
}

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({ from: () => mockCreateQuery() }),
}));

import type { NextRequest } from "next/server";
import { DELETE, GET, PATCH, POST, PUT } from "./route";

function request(method: string, body?: unknown, query = "") {
  return {
    method,
    url: `http://localhost/api/my/gift-list${query}`,
    json: jest.fn(async () => body),
  } as unknown as NextRequest;
}

const valid = { type: "honeymoon", name: "Nuovo viaggio", url: "https://example.com/lista", price: 500, priority: "high", status: "wanted", notes: "Nota" };

describe("/api/my/gift-list persistent CRUD", () => {
  beforeEach(() => {
    accessMode = "owner";
    rows = seed.map((row) => ({ ...row }));
    queryLog.length = 0;
    jest.clearAllMocks();
  });

  it.each([["anonymous", 401], ["revoked", 404], ["stranger", 404]] as const)("denies %s before reading", async (mode, status) => {
    accessMode = mode;
    const response = await GET(request("GET"));
    expect(response.status).toBe(status);
    expect(queryLog).toHaveLength(0);
  });

  it.each(["owner", "partner"] as const)("lets an active %s read the shared event list", async (mode) => {
    accessMode = mode;
    const response = await GET(request("GET"));
    const body = await response.json() as { items: Array<{ id: string }> };
    expect(body.items.map((item) => item.id)).toEqual([itemA]);
    expect(queryLog[0].filters).toContainEqual({ column: "event_id", value: eventA });
  });

  it("persists create, update and delete across refresh reads", async () => {
    expect((await POST(request("POST", valid))).status).toBe(201);
    let body = await (await GET(request("GET"))).json() as { items: Array<{ id: string; status: string }> };
    const created = body.items.find((item) => item.id.endsWith("99"));
    expect(created).toBeDefined();

    expect((await PUT(request("PUT", { ...valid, id: created!.id, status: "received" }))).status).toBe(200);
    body = await (await GET(request("GET"))).json() as { items: Array<{ id: string; status: string }> };
    expect(body.items.find((item) => item.id === created!.id)?.status).toBe("received");

    expect((await DELETE(request("DELETE", undefined, `?id=${created!.id}`))).status).toBe(200);
    body = await (await GET(request("GET"))).json() as { items: Array<{ id: string; status: string }> };
    expect(body.items.some((item) => item.id === created!.id)).toBe(false);
  });

  it("allows the active partner to create and edit collaboratively", async () => {
    accessMode = "partner";
    const createdResponse = await POST(request("POST", valid));
    const created = (await createdResponse.json() as { item: { id: string } }).item;
    const updated = await PUT(request("PUT", { ...valid, id: created.id, name: "Modificato dal partner" }));
    expect(updated.status).toBe(200);
    await expect(updated.json()).resolves.toMatchObject({ item: { name: "Modificato dal partner" } });
  });

  it("supports a true partial PATCH without requiring the full item", async () => {
    const response = await PATCH(request("PATCH", { id: itemA, status: "received" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ item: { id: itemA, name: "Viaggio", status: "received" } });
  });

  it("returns 404 for a cross-event update and leaves the row unchanged", async () => {
    const response = await PUT(request("PUT", { ...valid, id: itemB, name: "Tampered" }));
    expect(response.status).toBe(404);
    expect(rows.find((row) => row.id === itemB)?.name).toBe("Other");
    expect(queryLog[0].filters).toEqual([{ column: "id", value: itemB }, { column: "event_id", value: eventA }]);
  });

  it.each([
    [{ ...valid, url: "javascript:alert(1)" }, "GIFT_URL_INVALID"],
    [{ ...valid, price: -1 }, "GIFT_TARGET_AMOUNT_INVALID"],
    [{ ...valid, status: "paid" }, "GIFT_STATUS_INVALID"],
  ])("rejects invalid non-persistent input", async (payload, error) => {
    const response = await POST(request("POST", payload));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error });
    expect(rows).toHaveLength(2);
  });

  it("never queries the removed legacy table", () => {
    const source = fs.readFileSync(__filename.replace(/route\.test\.ts$/, "route.ts"), "utf8");
    expect(source).not.toContain('.from("gift_list")');
    expect(source).toContain('.from("gift_list_items")');
  });
});
