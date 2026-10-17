import { expect, test } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

test("[B54] signup validation, keyboard, short viewport and accessibility", async ({ page }, testInfo) => {
  const [locale] = testInfo.project.name.split("-");
  const messages = JSON.parse(fs.readFileSync(path.join(process.cwd(), `src/messages/branch54.${locale}.json`), "utf8")).branch54;
  // Intercept all mutations: this test must never create remote QA data.
  let submitted = 0;
  await page.route("**/api/auth/register", async route => { submitted += 1; await route.fulfill({ status: 200, contentType: "application/json", body: "{}" }); });
  await page.goto(`/${locale}/auth`);
  const main = page.locator("main");
  const registerLabels: Record<string, RegExp> = { it: /registrati/i, en: /register/i, es: /registr/i, fr: /inscri/i, de: /registr/i };
  await main.getByRole("button", { name: registerLabels[locale] }).click();
  const email = main.getByLabel(messages.email, { exact: true });
  const password = main.locator('input[autocomplete="new-password"]');
  await email.fill("invalid-address");
  await password.fill("short");
  await password.press("Enter");
  expect(submitted).toBe(0);
  expect(await email.evaluate((element: HTMLInputElement) => element.validity.typeMismatch)).toBe(true);
  const toggle = main.locator('button[aria-controls]');
  await toggle.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(password).toHaveAttribute("type", "password");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  for (const control of await main.locator('input, select, button').all()) {
    if (!(await control.isVisible())) continue;
    expect(await control.getAttribute("type") === "hidden").toBe(false);
    await expect(control).toHaveAccessibleName(/.+/);
  }
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (context: string) => Promise<{ violations: Array<{ id: string; impact: string | null }> }> } }).axe;
    return (await axe.run("main")).violations.filter(value => ["serious", "critical"].includes(value.impact || ""));
  });
  expect(violations).toEqual([]);
  await page.setViewportSize({ width: testInfo.project.use.viewport!.width, height: 420 });
  await email.fill("branch54@example.invalid");
  await password.fill("Valid-password!54");
  await password.scrollIntoViewIfNeeded();
  await password.press("Enter");
  await expect.poll(() => submitted).toBe(1);
  await expect(main.locator('input[autocomplete="new-password"]')).toHaveCount(0);
});
