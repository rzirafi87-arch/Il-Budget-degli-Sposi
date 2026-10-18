import fs from "node:fs";
import path from "node:path";

/**
 * Public legal and trust content must be true today: no placeholders,
 * no claims about features that do not exist, no invented cookies and
 * no "last updated" date that changes on every visit.
 */
const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8").replace(/^﻿/, "");
const LOCALES = ["it", "en", "es", "fr", "de"] as const;
const PRIVACY_EMAIL = "privacy@ilbudgetdeglisposi.it";

type Json = Record<string, unknown>;
function policies(locale: string): Json {
  const messages = JSON.parse(read(`src/messages/${locale}.json`)) as Json;
  const direct = messages.policies as Json | undefined;
  const nested = (messages.home as Json | undefined)?.policies as Json | undefined;
  const found = direct ?? nested;
  if (!found) throw new Error(`policies missing for ${locale}`);
  return found;
}
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const routes = "src/app/[locale]/(routes)";
const legalPages = ["privacy-policy", "cookie-policy", "termini-servizio"].map(page => `${routes}/${page}/page.tsx`);

describe("public legal truthfulness", () => {
  it.each(LOCALES)("%s policies contain no placeholder contact data", locale => {
    const text = strings(policies(locale)).join("\n");
    expect(text).not.toMatch(/X{3}/);
    expect(text).not.toMatch(/Via Esempio/i);
  });

  it.each(LOCALES)("%s rich-text contacts render real content instead of empty placeholders", locale => {
    const privacy = policies(locale).privacy as Json;
    const contact = (privacy.s8 as Json).contact as string;
    const rights = (privacy.s15 as Json).email as string;
    const cookieLink = (privacy.s10 as Json).p1 as string;
    for (const message of [contact, rights]) {
      expect(message).not.toContain("{strong}");
      expect(message).toContain(`<strong>${PRIVACY_EMAIL}</strong>`);
    }
    expect(cookieLink).not.toContain("{link}");
    expect(cookieLink).toMatch(/<link>[^<]+<\/link>/);
  });

  it.each(LOCALES)("%s cookie contacts use the real privacy address", locale => {
    const cookie = policies(locale).cookie as Json;
    expect((cookie.s9 as Json).p1).toContain(PRIVACY_EMAIL);
  });

  it("privacy page does not render removed placeholder lines", () => {
    const page = read(`${routes}/privacy-policy/page.tsx`);
    expect(page).not.toContain("privacy.s14.addr");
    expect(page).not.toContain("privacy.s14.phone");
  });

  it.each(legalPages)("%s shows a fixed revision date, not today's date", file => {
    const page = read(file);
    expect(page).not.toContain("formatDate(new Date())");
    expect(page).toContain("LEGAL_LAST_UPDATED");
  });

  it("cookie policy lists only storage the app really uses", () => {
    const page = read(`${routes}/cookie-policy/page.tsx`);
    for (const invented of ["session_token", "auth_token</code>", "csrf_token", "user_preferences", "cookie_consent"]) {
      expect(page).not.toContain(invented);
    }
    for (const real of ["sb-…-auth-token", "<code className=\"break-all\">language</code>", "country</code>", "eventType</code>", "analytics_consent"]) {
      expect(page).toContain(real);
    }
    // Every cookie named in the policy is actually written by the app.
    const source = ["src/providers/LocaleProvider.tsx", "src/components/EventModuleGuard.tsx", "src/components/QuickSettings.tsx", "src/components/ConsentAwareAnalytics.tsx"].map(read).join("\n");
    for (const cookie of ["language=", "eventType=", "country=", "ANALYTICS_CONSENT_COOKIE"]) {
      expect(source).toContain(cookie);
    }
  });

  it("footer makes no claims about payments, compliance or permanent gratuity", () => {
    const footer = read("src/components/Footer.tsx");
    for (const claim of ["securePayments", "gdprCompliant", "free100"]) {
      expect(footer).not.toContain(claim);
    }
  });

  it("cookie preferences entry point is hidden when no consent-gated tool exists", () => {
    const button = read("src/components/CookiePreferencesButton.tsx");
    expect(button).toMatch(/if \(!process\.env\.NEXT_PUBLIC_GA_ID\) return null;/);
  });
});
