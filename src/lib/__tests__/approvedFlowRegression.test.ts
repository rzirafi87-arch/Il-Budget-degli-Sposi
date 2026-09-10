import fs from "node:fs";
import path from "node:path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("approved application flow regressions", () => {
  it("keeps event selection only inside Quick Settings", () => {
    const shell = read("src/components/ClientLayoutShell.tsx");
    const settings = read("src/components/QuickSettings.tsx");
    expect(shell).not.toContain("TopBarSelector");
    expect(shell).not.toContain("CurrentEventSelector");
    expect(settings).toContain("CurrentEventSelector");
  });

  it("does not route configured or multi-event users through select-event-type", () => {
    const wizard = read("src/app/[locale]/(routes)/select-event-type/page.tsx");
    expect(wizard).toContain('status.kind === "complete" || status.kind === "needs-event-selection"');
    expect(wizard).toContain('router.replace(`/${locale}/dashboard`)');
    expect(wizard).not.toContain("TopBarSelector");
  });

  it("never redirects protected pages to the removed wizard route", () => {
    const guard = read("src/components/EventModuleGuard.tsx");
    expect(guard).not.toContain('router.replace(`/${locale}/wizard`)');
    expect(guard).toContain('router.replace(`/${locale}/select-event-type`)');
  });

  it("keeps the ceremony parent route available and canonical", () => {
    const ceremony = read("src/app/[locale]/(routes)/cerimonia/page.tsx");
    const legacy = read("src/app/[locale]/(routes)/cerimonia/chiesa/page.tsx");
    expect(ceremony).toContain('fetch("/api/ceremony"');
    expect(legacy).toContain('redirect(`/${locale}/cerimonia`)');
  });

  it("never queries wedding_date from events", () => {
    const currentEvent = read("src/lib/currentEvent.ts");
    expect(currentEvent).toContain("inserted_at,event_date");
    expect(currentEvent).not.toMatch(/from\("events"\)[\s\S]{0,300}wedding_date/);
  });

  it("renders the legacy appointments route without requiring a missing locale provider", () => {
    const appointments = read("src/app/it/documenti/appuntamenti/AppuntamentiClient.tsx");
    expect(appointments).not.toContain('from "next-intl"');
    expect(appointments).not.toContain("useTranslations()");
    expect(appointments).toContain("getOnboardingStatus()");
    expect(appointments).toContain('window.location.replace("/it/auth")');
    expect(appointments).toContain('status.kind === "needs-event-selection"');
  });

  it("requires event_id for expense creation", () => {
    const expenses = read("src/app/api/my/expenses/route.ts");
    expect(expenses).toMatch(/from\("expenses"\)\.insert\(\{[\s\S]{0,160}event_id:\s*eventId/);
  });
});
