import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PLAN_PATTERN = /^1\.\.(\d+)(?:\s+#.*)?$/i;
const TEST_PATTERN = /^(not )?ok(?:\s+(\d+))?(?:\s+-\s?.*)?$/i;
const BAILOUT_PATTERN = /^Bail out!/i;
const PLAN_SOURCE_PATTERN = /\bselect\s+plan\s*\(/i;

export class TapValidationError extends Error {
  constructor(message, summary = null) {
    super(message);
    this.name = "TapValidationError";
    this.summary = summary;
  }
}

function cleanLine(line) {
  return line.replace(/\u001b\[[0-9;]*m/g, "").trim();
}

export function parseTapOutput(output, suiteName = "pgTAP suite") {
  const lines = output.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const plans = [];
  const tests = [];
  const bailouts = [];

  for (const line of lines) {
    const plan = line.match(PLAN_PATTERN);
    if (plan) plans.push({ line, count: Number(plan[1]) });

    const test = line.match(TEST_PATTERN);
    if (test) {
      tests.push({
        line,
        ok: !test[1],
        number: test[2] === undefined ? null : Number(test[2]),
      });
    }

    if (BAILOUT_PATTERN.test(line)) bailouts.push(line);
  }

  const issues = [];
  if (bailouts.length > 0) issues.push(`bailout detected: ${bailouts.join(" | ")}`);
  if (plans.length === 0) issues.push("missing TAP plan");
  if (plans.length > 1) issues.push(`multiple TAP plans detected (${plans.length})`);
  if (tests.length === 0) issues.push("suite emitted no TAP assertions");

  const planned = plans.length === 1 ? plans[0].count : null;
  if (planned !== null && planned <= 0) issues.push(`invalid or empty TAP plan: 1..${planned}`);
  if (planned !== null && tests.length !== planned) {
    issues.push(`plan mismatch: planned ${planned}, executed ${tests.length}`);
  }

  const unnumbered = tests.filter((test) => test.number === null);
  if (unnumbered.length > 0) issues.push(`${unnumbered.length} assertion(s) are unnumbered`);

  const numbered = tests.filter((test) => test.number !== null);
  for (let index = 0; index < numbered.length; index += 1) {
    const expected = index + 1;
    if (numbered[index].number !== expected) {
      issues.push(
        `assertion numbering mismatch at position ${expected}: got ${numbered[index].number}`,
      );
      break;
    }
  }

  const failures = tests.filter((test) => !test.ok);
  if (failures.length > 0) {
    issues.push(`${failures.length} failing assertion(s): ${failures.map((test) => test.line).join(" | ")}`);
  }

  const summary = {
    suite: suiteName,
    planned,
    assertions: tests.length,
    passed: tests.length - failures.length,
    failed: failures.length,
    bailouts: bailouts.length,
  };

  if (issues.length > 0) {
    throw new TapValidationError(`${suiteName}: ${issues.join("; ")}`, summary);
  }

  return summary;
}

function readSqlFilesRecursively(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...readSqlFilesRecursively(resolved));
    if (entry.isFile() && entry.name.endsWith(".sql")) result.push(resolved);
  }
  return result;
}

function normalizePath(filePath, cwd) {
  return path.relative(cwd, path.resolve(cwd, filePath)).split(path.sep).join("/");
}

export function loadManifest(manifestPath, cwd = process.cwd()) {
  const resolvedManifest = path.resolve(cwd, manifestPath);
  if (!fs.existsSync(resolvedManifest)) {
    throw new TapValidationError(`pgTAP manifest does not exist: ${manifestPath}`);
  }

  const files = fs
    .readFileSync(resolvedManifest, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => normalizePath(line, cwd));

  if (files.length === 0) throw new TapValidationError("pgTAP manifest is empty");
  if (new Set(files).size !== files.length) {
    throw new TapValidationError("pgTAP manifest contains duplicate suite paths");
  }

  for (const file of files) {
    const resolvedFile = path.resolve(cwd, file);
    if (!fs.existsSync(resolvedFile)) {
      throw new TapValidationError(`manifest suite does not exist: ${file}`);
    }
    const source = fs.readFileSync(resolvedFile, "utf8");
    if (!PLAN_SOURCE_PATTERN.test(source)) {
      throw new TapValidationError(`manifest suite has no pgTAP plan: ${file}`);
    }
  }

  const testRoot = path.dirname(resolvedManifest);
  const discovered = readSqlFilesRecursively(testRoot)
    .filter((file) => PLAN_SOURCE_PATTERN.test(fs.readFileSync(file, "utf8")))
    .map((file) => normalizePath(file, cwd))
    .sort();
  const declared = [...files].sort();

  const undeclared = discovered.filter((file) => !declared.includes(file));
  const undiscovered = declared.filter((file) => !discovered.includes(file));
  if (undeclared.length > 0 || undiscovered.length > 0) {
    throw new TapValidationError(
      [
        undeclared.length > 0 ? `unlisted pgTAP suites: ${undeclared.join(", ")}` : null,
        undiscovered.length > 0 ? `manifest suites not discovered: ${undiscovered.join(", ")}` : null,
      ].filter(Boolean).join("; "),
    );
  }

  return files;
}

export function executePsqlSuite({ databaseUrl, file, cwd = process.cwd(), psql = "psql" }) {
  const result = spawnSync(
    psql,
    [
      "--no-psqlrc",
      "--set",
      "ON_ERROR_STOP=1",
      "--tuples-only",
      "--no-align",
      "--quiet",
      "--dbname",
      databaseUrl,
      "--file",
      file,
    ],
    {
      cwd,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      env: process.env,
    },
  );

  return {
    status: typeof result.status === "number" ? result.status : 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error || null,
  };
}

export function runSuites({ databaseUrl, files, cwd = process.cwd(), psql = "psql", log = console.log }) {
  if (!databaseUrl) throw new TapValidationError("database URL is missing");
  if (!Array.isArray(files) || files.length === 0) {
    throw new TapValidationError("no pgTAP suites were selected");
  }

  log(`pgTAP suites selected: ${files.length}`);
  for (const file of files) log(`- ${file}`);

  const summaries = [];
  for (const file of files) {
    log(`RUN ${file}`);
    const result = executePsqlSuite({ databaseUrl, file, cwd, psql });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);

    if (result.error) {
      throw new TapValidationError(`${file}: could not execute psql: ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new TapValidationError(`${file}: psql exited with status ${result.status}`);
    }

    const summary = parseTapOutput(`${result.stdout}\n${result.stderr}`, file);
    summaries.push(summary);
    log(`PASS ${file}: ${summary.assertions}/${summary.planned} assertions`);
  }

  if (summaries.length !== files.length) {
    throw new TapValidationError(
      `suite execution mismatch: selected ${files.length}, executed ${summaries.length}`,
    );
  }

  const totals = summaries.reduce(
    (acc, summary) => ({
      suites: acc.suites + 1,
      assertions: acc.assertions + summary.assertions,
      passed: acc.passed + summary.passed,
      failed: acc.failed + summary.failed,
      bailouts: acc.bailouts + summary.bailouts,
    }),
    { suites: 0, assertions: 0, passed: 0, failed: 0, bailouts: 0 },
  );

  log(
    `PGTAP SUMMARY suites=${totals.suites} assertions=${totals.assertions} ` +
      `pass=${totals.passed} fail=${totals.failed} bailouts=${totals.bailouts} final_exit_code=0`,
  );
  return totals;
}
