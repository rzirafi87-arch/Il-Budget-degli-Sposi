import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadManifest, parseTapOutput, runSuites, TapValidationError } from "./pgtap-runner.mjs";

test("accepts a complete numbered TAP plan", () => {
  const summary = parseTapOutput("1..2\nok 1 - first\nok 2 - second\n", "pass.sql");
  assert.deepEqual(summary, {
    suite: "pass.sql",
    planned: 2,
    assertions: 2,
    passed: 2,
    failed: 0,
    bailouts: 0,
  });
});

for (const [name, output, expected] of [
  ["not ok", "1..1\nnot ok 1 - controlled\n", /failing assertion/],
  ["bailout", "1..1\nBail out! controlled\n", /bailout detected/],
  ["missing plan", "ok 1 - orphan\n", /missing TAP plan/],
  ["incomplete plan", "1..2\nok 1 - only\n", /plan mismatch/],
  ["wrong numbering", "1..2\nok 1 - first\nok 3 - third\n", /numbering mismatch/],
  ["no assertions", "1..1\n", /no TAP assertions/],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(() => parseTapOutput(output, `${name}.sql`), expected);
  });
}

test("manifest rejects an accidentally unlisted pgTAP file", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pgtap-manifest-"));
  const testsDirectory = path.join(root, "tests");
  fs.mkdirSync(testsDirectory);
  fs.writeFileSync(path.join(testsDirectory, "listed.sql"), "select plan(1);\n");
  fs.writeFileSync(path.join(testsDirectory, "skipped.sql"), "select plan(1);\n");
  fs.writeFileSync(path.join(testsDirectory, "pgtap-suites.txt"), "tests/listed.sql\n");

  assert.throws(
    () => loadManifest("tests/pgtap-suites.txt", root),
    (error) => error instanceof TapValidationError && /unlisted pgTAP suites/.test(error.message),
  );
});

test("manifest rejects a declared file without a TAP plan", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pgtap-empty-"));
  const testsDirectory = path.join(root, "tests");
  fs.mkdirSync(testsDirectory);
  fs.writeFileSync(path.join(testsDirectory, "empty.sql"), "select 1;\n");
  fs.writeFileSync(path.join(testsDirectory, "pgtap-suites.txt"), "tests/empty.sql\n");

  assert.throws(() => loadManifest("tests/pgtap-suites.txt", root), /has no pgTAP plan/);
});

function fakePsql(output, status) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pgtap-psql-"));
  const executable = path.join(root, "psql");
  fs.writeFileSync(
    executable,
    `#!/usr/bin/env node\nprocess.stdout.write(${JSON.stringify(output)});\nprocess.exit(${status});\n`,
  );
  fs.chmodSync(executable, 0o755);
  fs.writeFileSync(path.join(root, "suite.sql"), "select plan(1);\n");
  return { root, executable };
}

test("runner returns a complete PASS summary", () => {
  const fake = fakePsql("1..1\nok 1 - controlled\n", 0);
  const summary = runSuites({
    databaseUrl: "postgresql://unused.invalid/test",
    files: ["suite.sql"],
    cwd: fake.root,
    psql: fake.executable,
    log: () => {},
  });
  assert.deepEqual(summary, { suites: 1, assertions: 1, passed: 1, failed: 0, bailouts: 0 });
});

test("runner propagates a non-zero psql exit", () => {
  const fake = fakePsql("", 3);
  assert.throws(
    () => runSuites({
      databaseUrl: "postgresql://unused.invalid/test",
      files: ["suite.sql"],
      cwd: fake.root,
      psql: fake.executable,
      log: () => {},
    }),
    /psql exited with status 3/,
  );
});
