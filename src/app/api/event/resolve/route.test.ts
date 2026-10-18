const mockFrom = jest.fn();
const mockResolve = jest.fn();
jest.mock("@/lib/currentEvent", () => ({ resolveCurrentEvent: (...args: unknown[]) => mockResolve(...args) }));
jest.mock("@/lib/supabaseServer", () => ({ getServiceClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: "owner" } } }) }, from: (...args: unknown[]) => mockFrom(...args) }) }));
jest.mock("next/server", () => ({ NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, json: async () => body }) } }));
import { GET } from "./route";
import type { NextRequest } from "next/server";
const request = { headers: new Headers({ authorization: "Bearer test" }) } as NextRequest;

beforeEach(() => {
  mockResolve.mockResolvedValue({ status: "RESOLVED", currentEvent: { eventId: "current" } });
  mockFrom.mockImplementation((table: string) => {
    const result = table === "events" ? { data: { id: "current", language: "it", country: "IT", event_type: "wedding" }, error: null } : { data: [], count: table === "saved_suppliers" ? 1 : 0, error: null };
    const query = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), in: jest.fn().mockReturnThis(), maybeSingle: async () => result, then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve) };
    return query;
  });
});
it("reads first-value signals from the authorized current event", async () => {
  const response = await GET(request);
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.event).toMatchObject({ id: "current", has_saved_suppliers: true, has_budget_items: false, has_expenses: false });
});
it("returns recoverable failure, never a missing-event success, when reads fail", async () => {
  mockFrom.mockImplementation(() => { throw new Error("private backend details"); });
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  const response = await GET(request);
  expect(response.status).toBe(503);
  const body = await response.json();
  expect(body.error).toBe("EVENT_PROGRESS_READ_FAILED");
  expect(body.reference).toMatch(/^[0-9a-f-]{36}$/);
  expect(JSON.stringify(body)).not.toContain("private backend details");
  expect(spy).toHaveBeenCalledWith("EVENT_PROGRESS_READ_FAILED", { reference: body.reference, operation: "unexpected" });
  spy.mockRestore();
});

it("logs safe operation and database code under the returned reference", async () => {
  const baseline = mockFrom.getMockImplementation()!;
  mockFrom.mockImplementation((table: string) => table === "guests" ? {
    select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ count: null, error: { code: "42P01", message: "private query details" } }).then(resolve),
  } : baseline(table));
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    const response = await GET(request);
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(spy).toHaveBeenCalledWith("EVENT_PROGRESS_READ_FAILED", { reference: body.reference, operation: "guests", code: "42P01" });
    expect(JSON.stringify(spy.mock.calls)).not.toContain("private query details");
    expect(body).not.toHaveProperty("code");
  } finally { spy.mockRestore(); }
});

it.each([false, true])("counts manual budget items, never an applied idea (manual=%s)", async (manual) => {
  mockFrom.mockImplementation((table: string) => {
    let manualOnly = false;
    const result = () => table === "events"
      ? { data: { id: "current", language: "it", country: "IT", event_type: "wedding" }, error: null }
      : { data: [], count: table === "budget_items" ? (manualOnly ? Number(manual) : 1) : 0, error: null };
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn(function (this: unknown, column: string, value: string) { if (column === "source" && value === "manual") manualOnly = true; return this; }),
      in: jest.fn().mockReturnThis(),
      maybeSingle: async () => result(),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve),
    };
    return query;
  });
  const response = await GET(request);
  expect(response.status).toBe(200);
  expect((await response.json()).event).toMatchObject({ has_budget_items: manual, has_expenses: false, has_saved_suppliers: false });
});
it.each([
  { status: "planned", from_dashboard: true, expected: false },
  { status: "planned", from_dashboard: false, expected: true },
  { status: "planned", from_dashboard: null, expected: true },
  { status: "pending", from_dashboard: true, expected: true },
  { status: "approved", from_dashboard: true, expected: true },
  { status: "rejected", from_dashboard: false, expected: false },
])("derives first value from a real expense, excluding saved idea snapshots: %j", async ({ status, from_dashboard, expected }) => {
  const baseline = mockFrom.getMockImplementation()!;
  mockFrom.mockImplementation((table: string) => table === "expenses" ? {
    select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [{ amount: 0, status, from_dashboard }], error: null }).then(resolve),
  } : baseline(table));
  const response = await GET(request);
  expect(response.status).toBe(200);
  expect((await response.json()).event.has_expenses).toBe(expected);
});
