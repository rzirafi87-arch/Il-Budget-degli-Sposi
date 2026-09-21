import { defineConfig, devices } from "@playwright/test";
import { browserProcessEnv } from "./playwright.browser-env";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["milestone8-lifecycle.spec.ts", "branch52-location-supplier.spec.ts", "branch52-supplier-work.spec.ts", "branch52-milestone5-ux.spec.ts", "branch52-security-matrix.spec.ts"],
  outputDir: ".playwright-results-m8",
  timeout: 120_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report-m8", open: "never" }]],
  use: {
    actionTimeout: 0,
    trace: "off",
    screenshot: "off",
    video: "off",
    baseURL: "http://127.0.0.1:3000",
    launchOptions: { env: browserProcessEnv() },
    ...devices["Desktop Chrome"],
  },
  projects: [
    { name: "m8-diagnostic", grep: /\[M8\]\[diagnostic\]/, use: { locale: "it", viewport: { width: 320, height: 844 } } },
    { name: "m8-320", grep: /\[M8\]\[(reset|matrix|responsive-320)\]|\[M3\]\[associations-320\]|\[M4\]\[supplier-work-320\]|\[M5\]\[guest-mobile\]/, use: { locale: "it", viewport: { width: 320, height: 844 } } },
    { name: "m8-390", grep: /\[M6\]\[security-matrix\]/, use: { locale: "it", viewport: { width: 390, height: 844 } } },
    { name: "m8-430", grep: /\[M8\]\[(responsive-430|idea-budget)\]|\[M3\]\[associations-430\]|\[M4\]\[supplier-work-430\]/, use: { locale: "it", viewport: { width: 430, height: 844 } } },
  ],
  webServer: {
    command: "npm run start -- -H 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
