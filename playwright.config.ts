import { defineConfig, devices } from "@playwright/test";

const locales = ["it", "en", "es", "fr", "de"] as const;
const mobileWidths = [320, 360, 375, 390, 412, 430] as const;
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  outputDir: ".playwright-results",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: "list",
  use: {
    actionTimeout: 0,
    trace: "on-first-retry",
    baseURL: externalBaseUrl || "http://127.0.0.1:3000",
    ...devices["Desktop Chrome"],
  },
  projects: locales.flatMap((locale) =>
    mobileWidths.map((width) => ({
      name: `${locale}-${width}`,
      use: {
        locale,
        viewport: { width, height: 844 },
      },
    })),
  ),
  webServer: externalBaseUrl
    ? undefined
    : {
        command: process.env.CI
          ? "npm run start -- -H 127.0.0.1"
          : "npm run dev -- -H 127.0.0.1",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
