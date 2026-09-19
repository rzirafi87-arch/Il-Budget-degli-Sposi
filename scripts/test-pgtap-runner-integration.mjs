#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const cases = [
  ["PASS suite", "scripts/fixtures/pgtap-runner/pass.sql", 0],
  ["not ok", "scripts/fixtures/pgtap-runner/not-ok.sql", 1],
  ["SQL error", "scripts/fixtures/pgtap-runner/sql-error.sql", 1],
  ["incomplete plan", "scripts/fixtures/pgtap-runner/incomplete-plan.sql", 1],
  ["no tests", "scripts/fixtures/pgtap-runner/no-tests.sql", 1],
  ["bailout", "scripts/fixtures/pgtap-runner/bailout.sql", 1],
];

let failures = 0;
for (const [name, file, expectedStatus] of cases) {
  const result = spawnSync(
    process.execPath,
    ["scripts/run-pgtap.mjs", "--file", file, "--database-url-env", "LOCAL_DATABASE_URL"],
    { encoding: "utf8", env: process.env, maxBuffer: 16 * 1024 * 1024 },
  );
  const status = typeof result.status === "number" ? result.status : 1;
  const passed = expectedStatus === 0 ? status === 0 : status !== 0;
  console.log(
    `${passed ? "PASS" : "FAIL"} controlled case=${name} expected=${expectedStatus === 0 ? "zero" : "non-zero"} actual=${status}`,
  );
  const evidencePattern = expectedStatus === 0
    ? /PGTAP SUMMARY.*final_exit_code=0/i
    : name === "not ok"
      ? /^not ok .*$/im
      : name === "SQL error"
        ? /^.*ERROR:.*$/im
        : name === "incomplete plan"
          ? /^PGTAP FAIL:.*plan mismatch.*$/im
          : name === "no tests"
            ? /^PGTAP FAIL:.*missing TAP plan.*$/im
            : /^Bail out!.*$/im;
  const evidence = `${result.stdout}\n${result.stderr}`.match(evidencePattern)?.[0];
  console.log(`EVIDENCE controlled case=${name}: ${evidence || "missing"}`);
  if (!evidence) failures += 1;
  if (!passed) {
    failures += 1;
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }
}

console.log(`PGTAP RUNNER CONTRACT cases=${cases.length} pass=${cases.length - failures} fail=${failures}`);
if (failures > 0) process.exitCode = 1;
