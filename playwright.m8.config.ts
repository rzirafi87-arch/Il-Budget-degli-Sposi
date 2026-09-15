import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "milestone8-lifecycle.spec.ts",
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
    ...devices["Desktop Chrome"],
  },
  projects: [
    { name: "m8-320", grep: /\[M8\]\[(reset|matrix|responsive-320)\]/, use: { locale: "it", viewport: { width: 320, height: 844 } } },
    { name: "m8-430", grep: /\[M8\]\[(responsive-430|idea-budget)\]/, use: { locale: "it", viewport: { width: 430, height: 844 } } },
  ],
  webServer: {
    command: "npm run start -- -H 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
