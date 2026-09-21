#!/usr/bin/env node
import path from "node:path";
import { loadManifest, runSuites, TapValidationError } from "./lib/pgtap-runner.mjs";

function usage() {
  return [
    "usage:",
    "  node scripts/run-pgtap.mjs --manifest FILE [--database-url-env NAME]",
    "  node scripts/run-pgtap.mjs --file FILE [--file FILE...] [--database-url-env NAME]",
  ].join("\n");
}

function parseArguments(argv) {
  const result = { files: [], databaseUrlEnv: "LOCAL_DATABASE_URL", manifest: null };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--manifest") result.manifest = argv[++index];
    else if (argument === "--file") result.files.push(argv[++index]);
    else if (argument === "--database-url-env") result.databaseUrlEnv = argv[++index];
    else throw new TapValidationError(`unknown argument: ${argument}`);
  }
  if (!result.databaseUrlEnv) throw new TapValidationError("database URL environment name is empty");
  if (result.manifest && result.files.length > 0) {
    throw new TapValidationError("use either --manifest or --file, not both");
  }
  if (!result.manifest && result.files.length === 0) throw new TapValidationError("no suite source selected");
  return result;
}

try {
  const options = parseArguments(process.argv.slice(2));
  const cwd = process.cwd();
  const files = options.manifest
    ? loadManifest(options.manifest, cwd)
    : options.files.map((file) => path.relative(cwd, path.resolve(cwd, file)).split(path.sep).join("/"));
  const databaseUrl = process.env[options.databaseUrlEnv];
  const totals = runSuites({ databaseUrl, files, cwd });
  if (totals.failed !== 0 || totals.bailouts !== 0 || totals.passed !== totals.assertions) {
    throw new TapValidationError("pgTAP totals are not completely PASS", totals);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`PGTAP FAIL: ${message}`);
  const summary = error instanceof TapValidationError ? error.summary : null;
  console.error(
    `PGTAP SUMMARY status=FAIL suites=${summary ? 1 : 0} ` +
      `assertions=${summary?.assertions ?? 0} pass=${summary?.passed ?? 0} ` +
      `fail=${summary?.failed ?? 0} bailouts=${summary?.bailouts ?? 0} final_exit_code=1`,
  );
  console.error(usage());
  process.exitCode = 1;
}
