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
const eventId = "53310000-0000-4000-8000-000000000010";
const ownerId = "53310000-0000-4000-8000-000000000001";
const partnerId = "53310000-0000-4000-8000-000000000002";
const tableId = "53310000-0000-4000-8000-000000000020";
const guestA = "53310000-0000-4000-8000-000000000030";
const guestB = "53310000-0000-4000-8000-000000000031";

const mockRequireAccess = jest.fn(async () => {
  if (accessMode === "anonymous") throw { status: 401, code: "AUTHENTICATION_REQUIRED" };
  if (accessMode === "revoked" || accessMode === "stranger") throw { status: 404, code: "EVENT_NOT_FOUND" };
  return {
    currentEvent: { eventId, accessRole: accessMode },
    userId: accessMode === "partner" ? partnerId : ownerId,
  };
});
const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/apiSecurity", () => ({
  requireEventAccess: () => mockRequireAccess(),
  parseUuid: (value: unknown) => {
    if (typeof value !== "string" || !value) throw { status: 400, code: "INVALID_TABLE_ID" };
    return value;
  },
  apiSecurityErrorResponse: (error: { status?: number; code?: string }, fallback: string) => ({
    status: error?.status ?? 500,
    json: async () => ({ error: error?.code ?? fallback }),
  }),
}));

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({ rpc: mockRpc, from: mockFrom }),
}));

import type { NextRequest } from "next/server";
import { DELETE, POST } from "./route";

function request(method: string, body?: unknown, query = "") {
  return {
    method,
    url: `http://localhost/api/my/tables${query}`,
    json: jest.fn(async () => body),
  } as unknown as NextRequest;
}

function tablePlan(overrides: Record<string, unknown> = {}) {
  return {
    tables: [{
      id: tableId,
      tableNumber: 1,
      tableName: "Famiglia",
      tableType: "round",
      totalSeats: 2,
      notes: "",
      assignedGuests: [{ guestId: guestA, seatNumber: 1 }],
    }],
    replace: true,
    ...overrides,
  };
}

function deleteQuery(data: { id: string } | null) {
  const filters: Array<[string, unknown]> = [];
  type DeleteQuery = {
    delete: jest.Mock<DeleteQuery, []>;
    eq: jest.Mock<DeleteQuery, [string, unknown]>;
    select: jest.Mock<DeleteQuery, []>;
    maybeSingle: jest.Mock<Promise<{ data: { id: string } | null; error: null }>, []>;
  };
  const query: DeleteQuery = {
    delete: jest.fn(() => query),
    eq: jest.fn((column: string, value: unknown) => { filters.push([column, value]); return query; }),
    select: jest.fn(() => query),
    maybeSingle: jest.fn(async () => ({ data, error: null })),
  };
  return { query, filters };
}

describe("/api/my/tables transactional contracts", () => {
  beforeEach(() => {
    accessMode = "owner";
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: { savedTables: 1 }, error: null });
  });

  it.each([["anonymous", 401], ["revoked", 404], ["stranger", 404]] as const)("denies %s before a save", async (mode, status) => {
    accessMode = mode;
    const response = await POST(request("POST", tablePlan()));
    expect(response.status).toBe(status);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it.each(["owner", "partner"] as const)("lets an active %s save through the atomic RPC", async (mode) => {
    accessMode = mode;
    const response = await POST(request("POST", tablePlan()));
    expect(response.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith("save_event_table_plan", expect.objectContaining({
      p_event_id: eventId,
      p_actor_id: mode === "partner" ? partnerId : ownerId,
      p_replace: true,
    }));
  });

  it.each([
    [tablePlan({ tables: [{ tableNumber: 1, totalSeats: 1, assignedGuests: [{ guestId: guestA }, { guestId: guestB }] }] }), "TABLE_CAPACITY_EXCEEDED"],
    [tablePlan({ tables: [
      { tableNumber: 1, totalSeats: 2, assignedGuests: [{ guestId: guestA }] },
      { tableNumber: 2, totalSeats: 2, assignedGuests: [{ guestId: guestA }] },
    ] }), "GUEST_ALREADY_ASSIGNED"],
    [tablePlan({ tables: [{ tableNumber: 1, totalSeats: 2, assignedGuests: [{ guestId: guestA, seatNumber: 3 }] }] }), "TABLE_SEAT_INVALID"],
  ])("rejects an invalid plan before persistence", async (payload, code) => {
    const response = await POST(request("POST", payload));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: code });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("returns a stable conflict without exposing database internals", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: "23514", message: "TABLE_GUEST_EVENT_MISMATCH private detail" } });
    const response = await POST(request("POST", tablePlan()));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "TABLE_SAVE_CONFLICT" });
  });

  it("deletes one explicitly scoped same-event table", async () => {
    const { query, filters } = deleteQuery({ id: tableId });
    mockFrom.mockReturnValue(query);
    const response = await DELETE(request("DELETE", undefined, `?id=${tableId}`));
    expect(response.status).toBe(200);
    expect(filters).toEqual([["id", tableId], ["event_id", eventId]]);
  });

  it("returns 404 when an explicitly scoped table is not in the event", async () => {
    const { query } = deleteQuery(null);
    mockFrom.mockReturnValue(query);
    const response = await DELETE(request("DELETE", undefined, `?id=${tableId}`));
    expect(response.status).toBe(404);
  });

  it("uses the existing schema and the server-only atomic RPC", () => {
    const source = fs.readFileSync(__filename.replace(/route\.test\.ts$/, "route.ts"), "utf8");
    expect(source).toContain('.from("tables")');
    expect(source).toContain('.from("guests")');
    expect(source).toContain("family_groups!guests_family_group_id_fkey");
    expect(source).toContain('.rpc("save_event_table_plan"');
    expect(source).not.toContain("service_role");
  });
});
