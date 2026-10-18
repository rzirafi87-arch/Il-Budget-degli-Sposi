/** @jest-environment node */
/**
 * Contract: without a valid session, /api/my/* must answer 401.
 * The only anonymous answers allowed are the documented public/demo reads,
 * and none of them may touch the database on behalf of an unknown user.
 * An authentication failure must never surface as 500, as a thrown
 * exception, or as a fake success.
 */
import fs from "node:fs";
import path from "node:path";

jest.mock("next/server", () => {
  class NextResponse {
    status: number;
    body: unknown;
    constructor(body: unknown, init?: { status?: number }) { this.body = body; this.status = init?.status ?? 200; }
    static json(body: unknown, init?: { status?: number }) { return new NextResponse(body, init); }
  }
  return { NextResponse, NextRequest: class {} };
});

// Any database access before authentication is a contract violation.
jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => new Proxy({}, {
    get: (_target, property) => {
      if (property === "auth") return { getUser: async () => ({ data: { user: null }, error: new Error("invalid") }) };
      throw new Error(`DB_ACCESS_WITHOUT_AUTH:${String(property)}`);
    },
  }),
}));

const ROOT = path.join(process.cwd(), "src/app/api/my");
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const ID = "11111111-1111-4111-8111-111111111111";

/** Public reference data: reads catalog/preset tables, never user data. */
const PUBLIC_READS = new Set(["wedding/budget-focus GET", "wedding/presets GET", "wedding/localized GET", "core-categories GET"]);
/** Feature-flagged off before auth is evaluated. */
const DISABLED = new Set(["subscription-transactions GET"]);

function routes(): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "route.ts") found.push(full);
    }
  };
  walk(ROOT);
  return found.sort();
}

function anonymousRequest(method: string) {
  const url = `http://localhost/api/my/x?id=${ID}&country=it`;
  return {
    method,
    url,
    nextUrl: new URL(url),
    headers: new Headers(),
    json: async () => ({}),
    text: async () => "{}",
    formData: async () => new FormData(),
    cookies: { get: () => undefined },
  };
}

type Result = { route: string; status: number | "THROW"; detail: string };

async function probe(): Promise<Result[]> {
  const results: Result[] = [];
  for (const file of routes()) {
    const name = path.relative(ROOT, path.dirname(file)).split(path.sep).join("/");
    const mod = (await import(file)) as Record<string, unknown>;
    for (const method of METHODS) {
      const handler = mod[method];
      if (typeof handler !== "function") continue;
      const route = `${name} ${method}`;
      try {
        const response = await (handler as (req: unknown, ctx: unknown) => Promise<{ status: number; body: unknown }>)(
          anonymousRequest(method),
          { params: Promise.resolve({ id: ID }) },
        );
        results.push({ route, status: response.status, detail: JSON.stringify(response.body).slice(0, 80) });
      } catch (error) {
        results.push({ route, status: "THROW", detail: (error as Error).message });
      }
    }
  }
  return results;
}

let results: Result[];
beforeAll(async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:9";
  process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-only";
  results = await probe();
});

describe("anonymous access to /api/my", () => {
  it("discovers the route surface", () => {
    expect(results.length).toBeGreaterThan(50);
  });

  it("every write without a session is rejected with 401", () => {
    const writes = results.filter(r => !r.route.endsWith(" GET"));
    const violations = writes.filter(r => r.status !== 401).map(r => `${r.route} → ${r.status} ${r.detail}`);
    expect(violations).toEqual([]);
  });

  it("no read turns a missing session into 500 or an exception", () => {
    const reads = results.filter(r => r.route.endsWith(" GET") && !PUBLIC_READS.has(r.route));
    const violations = reads.filter(r => r.status === "THROW" || r.status === 500).map(r => `${r.route} → ${r.status} ${r.detail}`);
    expect(violations).toEqual([]);
  });

  it("anonymous reads are only 401, disabled features, or demo data that never touched the database", () => {
    const reads = results.filter(r => r.route.endsWith(" GET") && !PUBLIC_READS.has(r.route));
    const unexpected = reads
      .filter(r => r.status !== 401 && !(DISABLED.has(r.route) && r.status === 409))
      .filter(r => r.status !== 200 || r.detail.includes("DB_ACCESS_WITHOUT_AUTH"))
      .map(r => `${r.route} → ${r.status} ${r.detail}`);
    expect(unexpected).toEqual([]);
  });
});
