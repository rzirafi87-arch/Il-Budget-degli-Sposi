import { expect, test } from "@playwright/test";

const expectedCopy: Record<string, RegExp> = {
  it: /informazioni sul dispositivo/i,
  en: /device information/i,
  es: /información del dispositivo/i,
  fr: /informations sur l’appareil/i,
  de: /geräteinformationen/i,
};

test.describe.configure({ mode: "parallel" });

test("localized mobile and accessibility smoke", async ({ page }, testInfo) => {
  const [locale, width] = testInfo.project.name.split("-");
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(`/${locale}/responsive-showcase`, { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator("body")).toContainText(expectedCopy[locale]);
  await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);

  const audit = await page.evaluate(() => ({
    blank: document.body.innerText.trim().length === 0,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    imagesWithoutAlt: Array.from(document.images).filter((image) => !image.hasAttribute("alt")).length,
    unlabeledControls: Array.from(document.querySelectorAll("input, select, textarea")).filter((control) => {
      const id = control.getAttribute("id");
      return !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby") && !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`));
    }).length,
  }));
  expect(audit, `showcase ${locale}/${width}`).toEqual({ blank: false, horizontalOverflow: false, imagesWithoutAlt: 0, unlabeledControls: 0 });
  expect(consoleErrors, `console errors ${locale}/${width}`).toEqual([]);
});
