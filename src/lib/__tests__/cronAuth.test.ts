/** @jest-environment node */
/**
 * B57 contract: cron endpoints run only with `Authorization: Bearer <CRON_SECRET>`.
 * A spoofable `x-vercel-cron` header or a `?token=` query parameter is never enough,
 * and nothing is read from the database before authorization succeeds.
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

jest.mock("@/lib/emailService", () => ({ sendAppointmentReminder: jest.fn(), sendSubscriptionExpiryWarning: jest.fn() }));
jest.mock("@/lib/monetizationCapability", () => ({ requirePaymentsCapability: () => null }));

const mockDbCalls: string[] = [];
jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => new Proxy({}, {
    get: (_target, property) => {
      mockDbCalls.push(String(property));
      throw new Error("DB_AFTER_AUTH_ONLY");
    },
  }),
}));

import { isAuthorizedCronRequest } from "@/lib/cronAuth";

const SECRET = "s3cr3t-value-for-tests";

function request(headers: Record<string, string> = {}, query = "") {
  const lower = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  const url = `https://app.example.test/api/cron/x${query}`;
  return { headers: { get: (name: string) => lower.get(name.toLowerCase()) ?? null }, nextUrl: new URL(url), url } as never;
}

const ORIGINAL = process.env.CRON_SECRET;
beforeEach(() => {
  process.env.CRON_SECRET = SECRET;
  mockDbCalls.length = 0;
});
afterAll(() => {
  if (ORIGINAL === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = ORIGINAL;
});

describe("isAuthorizedCronRequest", () => {
  it("accepts the exact bearer secret", () => {
    expect(isAuthorizedCronRequest(request({ Authorization: `Bearer ${SECRET}` }))).toBe(true);
  });
  it.each([
    ["no header", {}],
    ["wrong secret", { Authorization: "Bearer nope" }],
    ["secret without Bearer scheme", { Authorization: SECRET }],
    ["x-vercel-cron header only", { "x-vercel-cron": "1" }],
  ])("rejects %s", (_label, headers) => {
    expect(isAuthorizedCronRequest(request(headers as Record<string, string>))).toBe(false);
  });
  it("fails closed when CRON_SECRET is unset", () => {
    delete process.env.CRON_SECRET;
    expect(isAuthorizedCronRequest(request({ Authorization: "Bearer " }))).toBe(false);
    expect(isAuthorizedCronRequest(request({ Authorization: "Bearer undefined" }))).toBe(false);
  });
});

describe.each([
  ["check-appointments", () => import("@/app/api/cron/check-appointments/route")],
  ["check-subscriptions", () => import("@/app/api/cron/check-subscriptions/route")],
])("/api/cron/%s", (_name, load) => {
  const call = async (headers: Record<string, string>, query = "") => {
    const route = (await load()) as unknown as { GET: (req: never) => Promise<{ status: number }> };
    return route.GET(request(headers, query));
  };

  it("rejects the spoofable x-vercel-cron header with 401 before any DB access", async () => {
    const res = await call({ "x-vercel-cron": "1" });
    expect(res.status).toBe(401);
    expect(mockDbCalls).toEqual([]);
  });

  it("rejects the secret passed as a query parameter with 401", async () => {
    const res = await call({}, `?token=${SECRET}`);
    expect(res.status).toBe(401);
    expect(mockDbCalls).toEqual([]);
  });

  it("passes authorization with the bearer secret", async () => {
    await call({ Authorization: `Bearer ${SECRET}` });
    expect(mockDbCalls.length).toBeGreaterThan(0);
  });
});
