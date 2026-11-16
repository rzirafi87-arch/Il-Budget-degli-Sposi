import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Public form tests intercept writes. Keep them separate from the certified
// Production harness and from real isolated database lifecycle tests.
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: "branch54-signup.spec.ts",
  outputDir: ".playwright-results-b54",
});
