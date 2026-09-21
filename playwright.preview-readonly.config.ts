import { defineConfig, devices } from "@playwright/test";

const locales = ["it", "en", "es", "fr", "de"] as const;
const mobileWidths = [320, 360, 375, 390, 412, 430] as const;
const baseURL = process.env.PLAYWRIGHT_BASE_URL;
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

if (!baseURL) throw new Error("PLAYWRIGHT_BASE_URL is required for read-only Preview verification.");

export default defineConfig({
  testDir: "./e2e",
  outputDir: ".playwright-results",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: process.env.CI
    ? [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]]
    : "list",
  use: {
    actionTimeout: 0,
    trace: "on-first-retry",
    baseURL,
    extraHTTPHeaders: bypass ? { "x-vercel-protection-bypass": bypass } : undefined,
    ...devices["Desktop Chrome"],
  },
  projects: [
    ...locales.flatMap((locale) => mobileWidths.map((width) => ({
      name: `${locale}-${width}`,
      testMatch: /language-rollout\.spec\.ts/,
      use: { locale, viewport: { width, height: 844 } },
    }))),
  ],
});
