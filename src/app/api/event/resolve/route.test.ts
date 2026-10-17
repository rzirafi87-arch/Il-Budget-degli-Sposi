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
  spy.mockRestore();
});
