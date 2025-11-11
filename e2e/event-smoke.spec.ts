import { test, expect } from "@playwright/test";

test("Birthday opens", async ({ page }) => {
  await page.goto("http://localhost:3000/it/birthday");
  await expect(page.getByText("Birthday")).toBeVisible();
});

test("Engagement Party opens", async ({ page }) => {
  await page.goto("http://localhost:3000/it/engagement-party");
  await expect(page.getByText("Engagement Party")).toBeVisible();
});

test("Baby Shower opens", async ({ page }) => {
  await page.goto("http://localhost:3000/it/baby-shower");
  await expect(page.getByText("Baby Shower")).toBeVisible();
});
