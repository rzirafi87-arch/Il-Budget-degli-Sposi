import { expect, test, type Page, type TestInfo } from "@playwright/test";
import {
  createGuestUxFixture,
  createQaIdentity,
  deleteGuestUxFixture,
  deleteQaIdentity,
  login,
  milestone8FixtureReady,
  type GuestUxFixture,
} from "./helpers/milestone8-fixtures";

const mobileWidths = [320, 360, 375, 390, 412, 430] as const;
const locales = ["it", "en", "es", "fr", "de"] as const;
test.setTimeout(240_000);

async function assertGuestLayout(page: Page, fixture: GuestUxFixture) {
  const primary = page.getByTestId(`mobile-guest-${fixture.primaryGuestId}`);
  const secondary = page.getByTestId(`mobile-guest-${fixture.secondaryGuestId}`);
  await expect(primary).toBeVisible();
  await expect(secondary).toBeVisible();
  await expect(primary.locator("textarea").first()).toHaveValue(fixture.primaryName);
  await expect(primary.locator("textarea").first()).toHaveAccessibleName(new RegExp(fixture.primaryName));
  await expect(primary.locator("select").first()).toHaveAccessibleName(new RegExp(fixture.primaryName));
  await expect(primary.getByTestId("selected-family-name")).toHaveText(fixture.familyName);
  await expect(primary.locator('input[type="checkbox"]').first()).toBeChecked();
  await expect(secondary.locator("textarea").first()).toHaveValue(fixture.secondaryName);
  await expect(secondary.getByTestId("selected-family-name")).not.toBeEmpty();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  const touchTargets = primary.locator('textarea, select, summary, button, label:has(input[type="checkbox"])');
  for (let index = 0; index < await touchTargets.count(); index += 1) {
    const target = touchTargets.nth(index);
    if (!(await target.isVisible())) continue;
    const box = await target.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
}

test("[M5][guest-mobile] authenticated guest UX, taxonomy hierarchy, and cleanup", async ({ page }, testInfo: TestInfo) => {
  expect(testInfo.project.name).toBe("m8-320");
  expect(milestone8FixtureReady).toBe(true);
  const identity = await createQaIdentity("m5-guest-mobile");
  let fixture: GuestUxFixture | null = null;

  try {
    fixture = await createGuestUxFixture(identity);
    await login(page, identity);

    for (const width of mobileWidths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/it/invitati");
      await assertGuestLayout(page, fixture);
      const screenshot = testInfo.outputPath(`m5-guests-${width}-light.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      await testInfo.attach(`guests-${width}-light`, { path: screenshot, contentType: "image/png" });
    }

    await page.setViewportSize({ width: 430, height: 844 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/it/invitati");
    await assertGuestLayout(page, fixture);
    const darkScreenshot = testInfo.outputPath("m5-guests-430-dark.png");
    await page.screenshot({ path: darkScreenshot, fullPage: true });
    await testInfo.attach("guests-430-dark", { path: darkScreenshot, contentType: "image/png" });

    for (const locale of locales) {
      await page.goto(`/${locale}/invitati`);
      await expect(page.getByTestId(`mobile-guest-${fixture.primaryGuestId}`).locator("textarea").first()).toHaveValue(fixture.primaryName);
      await expect(page.getByTestId(`mobile-guest-${fixture.primaryGuestId}`).getByTestId("selected-family-name")).toHaveText(fixture.familyName);
      await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
    }

    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto("/it/invitati");
    await page.evaluate(() => { document.documentElement.style.fontSize = "125%"; });
    await assertGuestLayout(page, fixture);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/it/invitati");
    const primaryCard = page.getByTestId(`mobile-guest-${fixture.primaryGuestId}`);
    const secondaryCard = page.getByTestId(`mobile-guest-${fixture.secondaryGuestId}`);
    const primaryName = primaryCard.locator("textarea").first();
    await primaryName.focus();
    await expect(primaryName).toBeFocused();
    await page.keyboard.press("Tab");
    const typeSelect = primaryCard.locator("select").first();
    await expect(typeSelect).toBeFocused();
    expect(await typeSelect.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");

    const editedName = `${fixture.primaryName} — aggiornato`;
    await primaryName.fill(editedName);
    await expect(secondaryCard.locator("textarea").first()).toHaveValue(fixture.secondaryName);
    await secondaryCard.getByRole("button", { name: /Elimina / }).click();
    await expect(secondaryCard).toHaveCount(0);
    const saveResponse = page.waitForResponse(response =>
      response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/guests"
    );
    await page.getByRole("button", { name: "Salva tutto", exact: true }).click();
    expect((await saveResponse).status()).toBe(200);
    await expect(page.getByTestId("mobile-guest-list").locator("article")).toHaveCount(1);
    await expect(page.getByTestId("mobile-guest-list").locator("textarea").first()).toHaveValue(editedName);

    await page.goto("/it/cerimonia");
    await page.getByRole("button", { name: "Rito civile", exact: true }).click();
    const placeKind = page.getByLabel("Tipo di luogo");
    await expect(placeKind.locator('option[value="municipality"]')).toHaveCount(1);
    await expect(placeKind.locator('option[value="church"]')).toHaveCount(0);
    await page.getByRole("button", { name: "Rito religioso", exact: true }).click();
    await expect(placeKind.locator('option[value="church"]')).toHaveCount(1);
    await expect(placeKind.locator('option[value="municipality"]')).toHaveCount(0);

    await page.goto("/it/idea-di-budget");
    const search = page.locator("main").getByRole("searchbox");
    for (const legacyLabel of ["Truccatrice", "Sposa make-up"]) {
      await search.fill(legacyLabel);
      await expect(page.getByText("Make-up artist", { exact: true })).toHaveCount(1);
    }
    await search.fill("Chiesa / Comune");
    await expect(page.getByText("Costi del luogo della cerimonia", { exact: true })).toHaveCount(1);
    await expect(page.getByText("Chiesa / Comune", { exact: true })).toHaveCount(0);
  } finally {
    if (fixture) {
      await deleteGuestUxFixture(fixture);
      console.info("[M5] guest fixture cleanup complete; residue=0");
    }
    await deleteQaIdentity(identity);
    console.info("[M5] identity cleanup complete");
  }
});
