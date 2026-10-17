jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
    }),
  },
}));

import fs from "node:fs";

type AccessMode = "owner" | "partner" | "legacy" | "anonymous" | "revoked" | "stranger";
let accessMode: AccessMode = "owner";
const eventId = "53310000-0000-4000-8000-000000000010";
const ownerId = "53310000-0000-4000-8000-000000000001";
const partnerId = "53310000-0000-4000-8000-000000000002";
const legacyId = "53310000-0000-4000-8000-000000000003";
const tableId = "53310000-0000-4000-8000-000000000020";
const guestA = "53310000-0000-4000-8000-000000000030";
const guestB = "53310000-0000-4000-8000-000000000031";

const mockRequireAccess = jest.fn(async () => {
  if (accessMode === "anonymous") throw { status: 401, code: "AUTHENTICATION_REQUIRED" };
  if (accessMode === "revoked" || accessMode === "stranger") throw { status: 404, code: "EVENT_NOT_FOUND" };
  return {
    currentEvent: { eventId, accessRole: accessMode },
    userId: accessMode === "partner" ? partnerId : accessMode === "legacy" ? legacyId : ownerId,
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
import { DELETE, GET, PATCH, POST, PUT } from "./route";

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

describe("/api/my/tables transactional contracts", () => {
  beforeEach(() => {
    accessMode = "owner";
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: { savedTables: 1 }, error: null });
  });

  it.each([["POST", POST], ["PUT", PUT], ["PATCH", PATCH]] as const)("rejects malformed %s JSON before RPC", async (method, handler) => {
    const req = request(method);
    jest.mocked(req.json).mockImplementation(async () => JSON.parse('{"tables":'));
    const response = await handler(req);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "INVALID_JSON" });
    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it.each([["POST", POST], ["PUT", PUT], ["PATCH", PATCH]] as const)("authorizes %s before parsing malformed JSON", async (method, handler) => {
    for (const mode of ["anonymous", "revoked", "stranger"] as const) {
      accessMode = mode;
      const req = request(method);
      jest.mocked(req.json).mockRejectedValue(new SyntaxError("private parser detail"));
      const response = await handler(req);
      expect(response.status).toBe(mode === "anonymous" ? 401 : 404);
      expect(req.json).not.toHaveBeenCalled();
      expect(mockRpc).not.toHaveBeenCalled();
    }
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

  it("passes a server-verified legacy collaborator to the shared atomic RPC", async () => {
    accessMode = "legacy";
    const response = await POST(request("POST", tablePlan()));
    expect(response.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith("save_event_table_plan", expect.objectContaining({
      p_event_id: eventId,
      p_actor_id: legacyId,
    }));
  });

  it("returns complete family metadata for already assigned guests", async () => {
    const tableQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(async () => ({
            data: [{
              id: tableId, table_number: 1, table_name: "Famiglia", table_type: "family",
              total_seats: 8, notes: null,
              table_assignments: [{ id: "assignment", guest_id: guestA, seat_number: 1 }],
            }],
            error: null,
          })),
        })),
      })),
    };
    const guestQuery = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(async () => ({
            data: [{
              id: guestA, name: "Ada", guest_type: "bride", attending: true,
              exclude_from_family_table: true, family_group_id: "family-a",
              family_groups: { family_name: "Rossi" },
            }],
            error: null,
          })),
        })),
      })),
    };
    mockFrom.mockReturnValueOnce(tableQuery).mockReturnValueOnce(guestQuery);
    const response = await GET(request("GET"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      tables: [{ assignedGuests: [{
        guestId: guestA,
        guestType: "bride",
        familyGroupId: "family-a",
        familyName: "Rossi",
        excludeFromFamilyTable: true,
        attending: true,
      }] }],
    });
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

  it.each(["owner", "partner", "legacy"] as const)("serializes an authorized %s delete through the event-locked RPC", async (mode) => {
    accessMode = mode;
    mockRpc.mockResolvedValue({ data: { status: "deleted" }, error: null });
    const response = await DELETE(request("DELETE", undefined, `?id=${tableId}`));
    expect(response.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith("delete_event_table", {
      p_event_id: eventId,
      p_actor_id: mode === "partner" ? partnerId : mode === "legacy" ? legacyId : ownerId,
      p_table_id: tableId,
    });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("treats a duplicate delete as an idempotent success", async () => {
    mockRpc.mockResolvedValue({ data: { status: "already_deleted" }, error: null });
    const response = await DELETE(request("DELETE", undefined, `?id=${tableId}`));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, idempotent: true });
  });

  it.each(["anonymous", "revoked", "stranger"] as const)("denies %s before a table delete", async (mode) => {
    accessMode = mode;
    const response = await DELETE(request("DELETE", undefined, `?id=${tableId}`));
    expect(response.status).toBe(mode === "anonymous" ? 401 : 404);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("does not expose a cross-event table through the delete route", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: "42501", message: "TABLE_EVENT_MISMATCH" } });
    const response = await DELETE(request("DELETE", undefined, `?id=${tableId}`));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "TABLE_NOT_FOUND" });
  });

  it("uses the existing schema and the server-only atomic RPC", () => {
    const source = fs.readFileSync(__filename.replace(/route\.test\.ts$/, "route.ts"), "utf8");
    expect(source).toContain('.from("tables")');
    expect(source).toContain('.from("guests")');
    expect(source).toContain("family_groups!guests_family_group_id_fkey");
    expect(source).toContain("sameEventGuests");
    expect(source).toContain("excludeFromFamilyTable");
    expect(source).toContain("familyGroupId");
    expect(source).not.toContain("seat_number, guests");
    expect(source).toContain('.rpc("save_event_table_plan"');
    expect(source).toContain('.rpc("delete_event_table"');
    expect(source).not.toContain('.from("tables")\n      .delete()');
    expect(source).not.toContain("service_role");
  });
});
