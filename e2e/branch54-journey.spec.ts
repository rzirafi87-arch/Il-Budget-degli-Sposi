import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createQaIdentity, createGuestUxFixture, deleteGuestUxFixture, deleteQaIdentity, login } from "./helpers/milestone8-fixtures";

test("[B54][journey] persisted first value, recovery, mobile and accessibility", async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  // This journey writes fixtures only against explicitly disposable loopback Supabase.
  const url = process.env.PLAYWRIGHT_SUPABASE_URL || "";
  expect(["localhost", "127.0.0.1"].includes(new URL(url).hostname)).toBe(true);
  const identity = await createQaIdentity("branch54");
  const fixture = await createGuestUxFixture(identity);
  const admin = createClient(url, process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  try {
    await login(page, identity);
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1"); // persisted guests only
    const signedIn = await createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } }).auth.signInWithPassword(identity);
    expect(signedIn.error).toBeNull();
    const headers = { Authorization: `Bearer ${signedIn.data.session!.access_token}` };
    const budget = await page.request.post("/api/event/update-budget", { headers, data: { total_budget: 2500 } });
    expect(budget.ok()).toBe(true);
    const first = await page.request.post("/api/budget-items", { headers, data: { name: "QA first value", country_code: "it", amount: 25 } });
    expect(first.ok()).toBe(true);
    await page.reload();
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
    await page.goto("/it/profilo");
    await page.getByRole("button", { name: /esci/i }).click();
    await expect(page).toHaveURL(/\/it\/?$/);
    await login(page, identity);
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");

    for (const width of [360, 375, 390, 412, 430]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of ["onboarding", "dashboard", "budget", "invitati", "documenti"]) {
        const endpoint = ({ dashboard: "/api/event/resolve", budget: "/api/my/expenses", invitati: "/api/my/guests", documenti: "/api/my/documents" } as Record<string, string>)[route];
        const loaded = endpoint ? page.waitForResponse(response => response.request().method() === "GET" && new URL(response.url()).pathname === endpoint) : null;
        await page.goto(`/it/${route}`);
        if (loaded) expect((await loaded).ok(), `${route} data at ${width}px`).toBe(true);
        await expect(page.locator("main").first()).toBeVisible();
        if (route === "dashboard") await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
        await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      }
      await page.screenshot({ path: testInfo.outputPath(`b54-documents-${width}.png`), fullPage: true });
    }
    for (const locale of ["it", "en", "es", "fr", "de"]) {
      await page.goto(`/${locale}/dashboard`);
      await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
      await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
    }
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const violations = await page.evaluate(async () => {
      const axe = (window as unknown as { axe: { run: (context: string) => Promise<{ violations: Array<{ id: string; impact: string | null }> }> } }).axe;
      return (await axe.run('[role="progressbar"]')).violations.filter(value => ["serious", "critical"].includes(value.impact || ""));
    });
    expect(violations).toEqual([]);
    await page.route("**/api/my/expenses", route => route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"temporary"}' }));
    await page.goto("/it/budget");
    const recoveryAlert = page.getByRole("alert").filter({ hasText: "Non riusciamo a caricare i dati" });
    await expect(recoveryAlert).toBeVisible();
    await page.unroute("**/api/my/expenses");
    await page.getByRole("button", { name: "Riprova", exact: true }).click();
    await expect(recoveryAlert).toHaveCount(0);
    await admin.auth.admin.signOut(signedIn.data.session!.access_token);
  } finally {
    expect((await admin.from("budget_items").delete().eq("event_id", fixture.eventId)).error).toBeNull();
    await deleteGuestUxFixture(fixture);
    await deleteQaIdentity(identity);
  }
});
