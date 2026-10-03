import { defineConfig, devices } from "@playwright/test";
import { browserProcessEnv } from "./playwright.browser-env";

const locales = ["it", "en", "es", "fr", "de"] as const;
const mobileWidths = [320, 360, 375, 390, 412, 430] as const;
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const vercelAutomationBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const branch52IsolatedSpecs = [
  "milestone8-lifecycle.spec.ts",
  "branch52-location-supplier.spec.ts",
  "branch52-supplier-work.spec.ts",
  "branch52-milestone5-ux.spec.ts",
  "branch52-security-matrix.spec.ts",
  "branch53-persistence.spec.ts",
  "i18n-runtime.spec.ts",
];

export default defineConfig({
  testDir: "./e2e",
  testIgnore: branch52IsolatedSpecs,
  outputDir: ".playwright-results",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: process.env.CI
    ? [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]]
    : "list",
  use: {
    actionTimeout: 0,
    trace: "on-first-retry",
    launchOptions: { env: browserProcessEnv() },
    baseURL: externalBaseUrl || "http://127.0.0.1:3000",
    extraHTTPHeaders: vercelAutomationBypassSecret
      ? { "x-vercel-protection-bypass": vercelAutomationBypassSecret }
      : undefined,
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
