import fs from "fs";
import path from "path";

const mockStripeSessionCreate = jest.fn();
const mockStripeConstructEvent = jest.fn();
const mockStripeConstructor = jest.fn(() => ({
  checkout: { sessions: { create: mockStripeSessionCreate } },
  webhooks: { constructEvent: mockStripeConstructEvent },
}));
const mockGetServiceClient = jest.fn(() => {
  throw new Error("database must not be reached");
});
const mockSendSubscriptionActivated = jest.fn();
const mockSendSubscriptionExpiryWarning = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      body,
      status: init?.status ?? 200,
      headers: new Headers(init?.headers),
    }),
  },
}));

jest.mock("stripe", () => ({
  __esModule: true,
  default: mockStripeConstructor,
}));

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: mockGetServiceClient,
}));

jest.mock("@/lib/emailService", () => ({
  sendSubscriptionActivated: mockSendSubscriptionActivated,
  sendSubscriptionExpiryWarning: mockSendSubscriptionExpiryWarning,
}));

type DisabledResponse = {
  body: unknown;
  status: number;
  headers: Headers;
};

function request(authorization?: string) {
  return {
    headers: { get: jest.fn(() => authorization ?? null) },
    json: jest.fn(() => {
      throw new Error("payload must not be read");
    }),
    text: jest.fn(() => {
      throw new Error("body must not be read");
    }),
    nextUrl: { searchParams: new URLSearchParams("token=manipulated") },
  };
}

function expectDisabled(response: DisabledResponse) {
  expect(response.status).toBe(409);
  expect(response.body).toEqual({ error: "FEATURE_DISABLED", feature: "payments" });
  expect(response.headers.get("cache-control")).toBe("no-store");
}

describe("fail-closed monetization capability", () => {
  const originalStripeSecret = process.env.STRIPE_SECRET_KEY;
  const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  afterAll(() => {
    if (originalStripeSecret === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = originalStripeSecret;
    if (originalWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
  });

  it("keeps the authoritative capability disabled", async () => {
    const { flags } = await import("@/config/flags");
    expect(flags.payments_stripe).toBe(false);
  });

  it("blocks anonymous and authenticated checkout before secrets, Stripe, payload, or database", async () => {
    const { POST } = await import("./stripe/checkout/route");

    expectDisabled(await POST(request() as never) as unknown as DisabledResponse);
    process.env.STRIPE_SECRET_KEY = "configured-but-disabled";
    expectDisabled(await POST(request("Bearer owner-token") as never) as unknown as DisabledResponse);

    expect(mockStripeConstructor).not.toHaveBeenCalled();
    expect(mockStripeSessionCreate).not.toHaveBeenCalled();
    expect(mockGetServiceClient).not.toHaveBeenCalled();
  });

  it("blocks webhook retries and replay before signature handling, DML, email, or Stripe", async () => {
    process.env.STRIPE_SECRET_KEY = "configured-but-disabled";
    process.env.STRIPE_WEBHOOK_SECRET = "configured-but-disabled";
    const { POST } = await import("./stripe/webhook/route");

    const replay = request();
    expectDisabled(await POST(replay as never) as unknown as DisabledResponse);
    expectDisabled(await POST(replay as never) as unknown as DisabledResponse);

    expect(replay.text).not.toHaveBeenCalled();
    expect(mockStripeConstructor).not.toHaveBeenCalled();
    expect(mockStripeConstructEvent).not.toHaveBeenCalled();
    expect(mockGetServiceClient).not.toHaveBeenCalled();
    expect(mockSendSubscriptionActivated).not.toHaveBeenCalled();
  });

  it("blocks featured, history, package, cron, and paid supplier paths before any DML", async () => {
    const featured = await import("./subscription-featured/route");
    const transactions = await import("./subscription-transactions/route");
    const myTransactions = await import("./my/subscription-transactions/route");
    const packages = await import("./subscription-packages/route");
    const cron = await import("./cron/check-subscriptions/route");
    const supplier = await import("./suppliers/[id]/route");
    const manipulated = request("Bearer owner-token");

    const responses = await Promise.all([
      featured.PUT(manipulated as never),
      transactions.GET(manipulated as never),
      transactions.POST(manipulated as never),
      myTransactions.GET(manipulated as never),
      packages.GET(manipulated as never),
      cron.GET(manipulated as never),
      supplier.PUT(manipulated as never, { params: Promise.resolve({ id: "manipulated" }) }),
    ]);

    responses.forEach((response) => expectDisabled(response as unknown as DisabledResponse));
    expect(manipulated.headers.get).not.toHaveBeenCalled();
    expect(manipulated.json).not.toHaveBeenCalled();
    expect(mockGetServiceClient).not.toHaveBeenCalled();
    expect(mockSendSubscriptionExpiryWarning).not.toHaveBeenCalled();
  });

  it("keeps the guard before all Stripe secret reads and client initialization", () => {
    for (const relative of ["stripe/checkout/route.ts", "stripe/webhook/route.ts"]) {
      const source = fs.readFileSync(path.join(process.cwd(), "src/app/api", relative), "utf8");
      const guard = source.indexOf("const unavailable = requirePaymentsCapability()");
      expect(guard).toBeGreaterThan(-1);
      expect(guard).toBeLessThan(source.indexOf("process.env.STRIPE_SECRET_KEY"));
      expect(guard).toBeLessThan(source.indexOf("new Stripe("));
    }
  });

  it("keeps every supplier pricing UI fail-closed without package or checkout calls", () => {
    for (const relative of [
      "src/app/[locale]/(routes)/pacchetti-fornitori/page.tsx",
      "src/app/[locale]/(routes)/abbonamenti-fornitori/page.tsx",
    ]) {
      const source = fs.readFileSync(path.join(process.cwd(), relative), "utf8");
      expect(source).toContain("flags.payments_stripe");
      expect(source).toMatch(/if \(paymentsEnabled\) \{\s*(?:load|fetch)Packages\(\)/);
    }

    const dashboard = fs.readFileSync(
      path.join(process.cwd(), "src/app/[locale]/(routes)/fornitori-dashboard/page.tsx"),
      "utf8",
    );
    expect(dashboard).toContain("flags.payments_stripe ? (");
    expect(dashboard).toContain('aria-disabled="true"');
  });
});
