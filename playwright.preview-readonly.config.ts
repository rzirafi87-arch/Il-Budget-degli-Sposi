import { defineConfig, devices } from "@playwright/test";

const locales = ["it", "en", "es", "fr", "de"] as const;
const mobileWidths = [320, 360, 375, 390, 412, 430] as const;
const runtimeViewports = [320, 390, 430, "desktop"] as const;
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL || "http://127.0.0.1:3000";
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

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
    ...locales.flatMap((locale) => runtimeViewports.map((viewport) => ({
      name: `runtime-${locale}-${viewport}`,
      testMatch: /i18n-runtime\.spec\.ts/,
      use: {
        locale,
        viewport: viewport === "desktop" ? { width: 1440, height: 960 } : { width: viewport, height: 844 },
      },
    }))),
  ],
  webServer: externalBaseURL ? undefined : {
    command: process.env.CI ? "npm run start -- -H 127.0.0.1" : "npm run dev -- -H 127.0.0.1",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
