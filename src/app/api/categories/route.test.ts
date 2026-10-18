/** @jest-environment node */
/**
 * B57 contract: /api/categories?event=<id> returns an event's categories only to
 * a member of that event. Without a session it answers 401 and reads nothing.
 */

jest.mock("next/server", () => {
  class NextResponse {
    status: number;
    body: unknown;
    constructor(body: unknown, init?: { status?: number }) { this.body = body; this.status = init?.status ?? 200; }
    static json(body: unknown, init?: { status?: number }) { return new NextResponse(body, init); }
  }
  return { NextResponse, NextRequest: class {} };
});

const mockQueries: Array<{ table: string; eventId?: string }> = [];
let mockAccess: "granted" | "denied" | "anonymous" = "anonymous";

jest.mock("@/lib/apiSecurity", () => {
  class ApiSecurityError extends Error {
    code: string;
    status: number;
    constructor(errorCode: string, httpStatus: number) { super(errorCode); this.code = errorCode; this.status = httpStatus; }
  }
  return {
    ApiSecurityError,
    parseUuid: (value: unknown) => {
      if (typeof value !== "string" || !/^[0-9a-f-]{36}$/i.test(value)) throw new ApiSecurityError("INVALID_EVENT_ID", 400);
      return value;
    },
    requireEventAccess: async (_req: unknown, _mode: string, eventId: string) => {
      if (mockAccess === "anonymous") throw new ApiSecurityError("AUTHENTICATION_REQUIRED", 401);
      if (mockAccess === "denied") throw new ApiSecurityError("EVENT_NOT_FOUND", 404);
      return { userId: "user-1", currentEvent: { eventId } };
    },
    apiSecurityErrorResponse: (error: { status?: number; code?: string }) => {
      const { NextResponse } = jest.requireMock("next/server");
      return NextResponse.json({ error: error.code ?? "OPERATION_FAILED" }, { status: error.status ?? 500 });
    },
  };
});

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({
    from: (table: string) => {
      const entry: { table: string; eventId?: string } = { table };
      mockQueries.push(entry);
      const builder = {
        select: () => builder,
        eq: (_column: string, value: string) => { entry.eventId = value; return builder; },
        order: async () => ({ data: [{ id: "c1", name: "Location" }], error: null }),
      };
      return builder;
    },
  }),
}));

import { GET } from "./route";

const EVENT_ID = "11111111-1111-4111-8111-111111111111";
const request = (query: string) => ({ url: `https://app.example.test/api/categories${query}`, headers: { get: () => null } }) as never;

beforeEach(() => {
  mockQueries.length = 0;
  mockAccess = "anonymous";
});

it("answers 401 without a session and reads nothing", async () => {
  const res = (await GET(request(`?event=${EVENT_ID}`))) as unknown as { status: number };
  expect(res.status).toBe(401);
  expect(mockQueries).toHaveLength(0);
});

it("answers 404 for an event the caller cannot access and reads nothing", async () => {
  mockAccess = "denied";
  const res = (await GET(request(`?event=${EVENT_ID}`))) as unknown as { status: number };
  expect(res.status).toBe(404);
  expect(mockQueries).toHaveLength(0);
});

it("answers 400 for a malformed event id", async () => {
  mockAccess = "granted";
  const res = (await GET(request("?event=not-a-uuid"))) as unknown as { status: number };
  expect(res.status).toBe(400);
  expect(mockQueries).toHaveLength(0);
});

it("returns the categories of an accessible event", async () => {
  mockAccess = "granted";
  const res = (await GET(request(`?event=${EVENT_ID}`))) as unknown as { status: number; body: unknown };
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ categories: [{ id: "c1", name: "Location" }] });
  expect(mockQueries).toEqual([{ table: "categories", eventId: EVENT_ID }]);
});
