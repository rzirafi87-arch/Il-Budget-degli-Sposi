/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";
import { buildContentSecurityPolicy, securityHeaders } from "@/config/securityHeaders";

function directives(policy: string): Map<string, string[]> {
  return new Map(
    policy.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
      const [name, ...values] = part.split(/\s+/);
      return [name, values] as [string, string[]];
    }),
  );
}

describe("Content-Security-Policy (B57)", () => {
  const production = directives(buildContentSecurityPolicy({ supabaseUrl: "https://abc.supabase.co", environment: "production" }));

  it("forbids framing, plugins, foreign <base> and foreign form targets", () => {
    expect(production.get("frame-ancestors")).toEqual(["'none'"]);
    expect(production.get("object-src")).toEqual(["'none'"]);
    expect(production.get("base-uri")).toEqual(["'self'"]);
    expect(production.get("form-action")).toEqual(["'self'"]);
    expect(production.get("default-src")).toEqual(["'self'"]);
    expect(production.has("upgrade-insecure-requests")).toBe(true);
  });

  it("lets the browser talk only to itself, the project's Supabase and Google Analytics", () => {
    const connect = production.get("connect-src") ?? [];
    expect(connect).toEqual(expect.arrayContaining(["'self'", "https://abc.supabase.co", "wss://abc.supabase.co"]));
    expect(connect.filter((origin) => !["'self'", "https://abc.supabase.co", "wss://abc.supabase.co"].includes(origin)).every((origin) => /google(tagmanager|-analytics)?\.com$|analytics\.google\.com$/.test(origin))).toBe(true);
    expect(connect).not.toContain("*");
    expect(connect).not.toContain("https:");
  });

  it("never allows eval or wildcard script sources in production", () => {
    const scripts = production.get("script-src") ?? [];
    expect(scripts).not.toContain("'unsafe-eval'");
    expect(scripts).not.toContain("*");
    expect(scripts).not.toContain("https:");
    expect(scripts).not.toContain("https://vercel.live");
  });

  it("allows the Vercel toolbar only on Preview and eval only in development", () => {
    const preview = directives(buildContentSecurityPolicy({ supabaseUrl: "https://abc.supabase.co", environment: "preview" }));
    expect(preview.get("script-src")).toContain("https://vercel.live");
    expect(preview.get("script-src")).not.toContain("'unsafe-eval'");
    const development = directives(buildContentSecurityPolicy({ environment: "development" }));
    expect(development.get("script-src")).toContain("'unsafe-eval'");
    expect(development.has("upgrade-insecure-requests")).toBe(false);
  });

  it("falls back to Supabase hosts when the URL is missing or invalid", () => {
    for (const supabaseUrl of [undefined, "not a url"]) {
      const connect = directives(buildContentSecurityPolicy({ supabaseUrl, environment: "production" })).get("connect-src");
      expect(connect).toEqual(expect.arrayContaining(["https://*.supabase.co", "wss://*.supabase.co"]));
    }
  });

  it("keeps the existing hardening headers", () => {
    const keys = securityHeaders().map((header) => header.key);
    for (const key of ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) {
      expect(keys).toContain(key);
    }
  });

  it("is applied to every route by next.config.ts", () => {
    const config = fs.readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");
    expect(config).toMatch(/import \{ securityHeaders \} from "\.\/src\/config\/securityHeaders"/);
    expect(config).toMatch(/source: "\/\(\.\*\)",\s*headers: securityHeaders\(/);
  });
});
