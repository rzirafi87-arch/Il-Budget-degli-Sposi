import { expect, test } from "@playwright/test";

const email = process.env.PLAYWRIGHT_TEST_EMAIL;
const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

if (process.env.CI && (!email || !password)) {
  throw new Error("Authenticated QA requires PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD in CI.");
}

test("authenticated wedding journey, event context and logout", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "it-390", "One authenticated browser is sufficient; the full width matrix runs in language-rollout.spec.ts.");
  test.skip(!email || !password, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD for local authenticated QA.");

  await page.goto("/it/auth");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: /accedi/i }).click();
  await page.waitForURL(/\/it\/(dashboard|select-event)/);

  if (page.url().includes("select-event")) {
    await page.locator("select").first().selectOption({ index: 1 });
    await page.waitForURL(/\/it\/dashboard/);
  }

  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
  await expect(page.getByText(/configurazione progressiva/i).or(page.getByText(/budget advisor/i))).toBeVisible();

  const selector = page.locator('select[aria-label*="Cambia evento"]');
  if (await selector.count() && await selector.locator("option").count() > 1) {
    await selector.selectOption({ index: 1 });
    await expect(page.getByRole("dialog", { name: /cambiare evento/i })).toBeVisible();
    await page.getByRole("button", { name: /annulla/i }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }

  for (const path of ["budget", "invitati", "contabilita", "timeline", "location", "fornitori"]) {
    await page.goto(`/it/${path}`);
    await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `${path} must fit at 390px`).toBe(false);
  }

  await page.goto("/it/profilo");
  await page.getByRole("button", { name: /esci/i }).click();
  await page.waitForURL(/\/it$/);
  await page.goBack();
  await expect(page).not.toHaveURL(/\/profilo/);

  await page.goto("/it/auth");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: /accedi/i }).click();
  await page.waitForURL(/\/it\/(dashboard|select-event)/);
});
