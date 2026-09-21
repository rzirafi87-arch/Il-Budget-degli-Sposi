import { spawnSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  verifyPreviewReadOnlyCollection,
  verifyProjectIsolation,
} from "./lib/playwright-project-isolation.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const playwrightCli = path.join(root, "node_modules", "@playwright", "test", "cli.js");

function collect(config) {
  const result = spawnSync(process.execPath, [
    playwrightCli,
    "test",
    `--config=${config}`,
    "--list",
    "--reporter=json",
  ], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "",
      PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL || "https://production-smoke.invalid",
    },
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Playwright collection failed for ${config}: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function verifyBrowserSecretIsolation() {
  const helper = readFileSync(path.join(root, "playwright.browser-env.ts"), "utf8");
  const standard = readFileSync(path.join(root, "playwright.config.ts"), "utf8");
  const production = readFileSync(path.join(root, "playwright.production-m8.config.ts"), "utf8");
  const workflow = readFileSync(path.join(root, ".github/workflows/production-smoke.yml"), "utf8");
  if (!helper.includes('"PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY"')) {
    throw new Error("The Chromium environment does not explicitly remove the Playwright service-role key.");
  }
  if (!helper.includes('"VERCEL_AUTOMATION_BYPASS_SECRET"')) {
    throw new Error("The Chromium process environment does not remove the Vercel automation bypass secret.");
  }
  for (const [name, source] of [["standard", standard], ["Branch 52", production]]) {
    if (!source.includes("launchOptions: { env: browserProcessEnv() }")) {
      throw new Error(`${name} Playwright configuration does not sanitize the Chromium process environment.`);
    }
  }
  if (!production.includes('"x-vercel-protection-bypass": vercelAutomationBypassSecret')) {
    throw new Error("The Branch 52 configuration does not authorize protected recovery redirects.");
  }
  for (const required of [
    "PLAYWRIGHT_SUPABASE_ANON_KEY: ${{ secrets.PLAYWRIGHT_SUPABASE_ANON_KEY }}",
    "VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}",
  ]) {
    if (!workflow.includes(required)) throw new Error(`Production smoke workflow is missing ${required.split(":")[0]}.`);
  }
}

verifyBrowserSecretIsolation();
const result = verifyProjectIsolation(
  collect("playwright.config.ts"),
  collect("playwright.production-m8.config.ts"),
);
const preview = verifyPreviewReadOnlyCollection(
  collect("playwright.preview-readonly.config.ts"),
);
const lines = [
  "Production smoke Playwright collection: PASS",
  `- standard: ${result.standardCases} project cases across ${result.standardProjects} IT/EN/ES/FR/DE projects`,
  `- Branch 52: ${result.isolatedJourneys} mandatory journeys across ${result.isolatedProjects.join(", ")}`,
  "- Branch 52 collected by standard projects: 0",
  "- duplicate mandatory journeys: 0",
  "- Chromium service-role exposure: 0",
  "- protected recovery redirect and security-matrix environment: configured",
  `- Preview read-only: ${preview.previewCases} public GET-only cases across ${preview.previewProjects} projects; authenticated/mutating specs: 0`,
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### ${lines.join("\n")}\n`);
