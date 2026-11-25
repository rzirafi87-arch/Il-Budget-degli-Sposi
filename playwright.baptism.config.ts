import { defineConfig } from "@playwright/test";
import base from "./playwright.m8.config";

export default defineConfig({
  ...base,
  testMatch: "baptism-mobile.spec.ts",
  outputDir: ".playwright-results-baptism",
  reporter: [["list"], ["html", { outputFolder: "playwright-report-baptism", open: "never" }]],
  projects: [360, 390].map(width => ({
    name: `baptism-${width}`,
    use: { locale: "it", viewport: { width, height: 844 } },
  })),
});
