import assert from "node:assert/strict";
import test from "node:test";
import {
  ISOLATED_JOURNEYS,
  STANDARD_PROJECTS,
  STANDARD_SPEC_FILES,
  verifyProjectIsolation,
} from "./playwright-project-isolation.mjs";

function report(entries) {
  return {
    suites: [{
      specs: entries.map(entry => ({
        file: `/repo/e2e/${entry.file}`,
        title: entry.title,
        tests: [{ projectName: entry.project }],
      })),
    }],
  };
}

function validEntries() {
  const standard = STANDARD_SPEC_FILES.flatMap(file =>
    STANDARD_PROJECTS.map(project => ({ file, title: `required ${file}`, project })),
  );
  const isolated = ISOLATED_JOURNEYS.map(([file, marker, project]) => ({ file, title: `${marker} required journey`, project }));
  return { standard, isolated };
}

test("accepts the exact standard matrix and isolated Branch 52 mapping", () => {
  const { standard, isolated } = validEntries();
  assert.deepEqual(verifyProjectIsolation(report(standard), report(isolated)), {
    standardCases: 120,
    standardProjects: 30,
    isolatedJourneys: 12,
    isolatedProjects: ["m8-320", "m8-390", "m8-430"],
  });
});

test("rejects a Branch 52 journey collected by de-430", () => {
  const { standard, isolated } = validEntries();
  isolated[0] = { ...isolated[0], project: "de-430" };
  assert.throws(() => verifyProjectIsolation(report(standard), report(isolated)), /incorrect project/);
});

test("rejects missing or duplicate mandatory journeys", () => {
  const { standard, isolated } = validEntries();
  assert.throws(() => verifyProjectIsolation(report(standard), report(isolated.slice(1))), /12 journeys/);
  assert.throws(() => verifyProjectIsolation(report(standard), report([...isolated, isolated[0]])), /duplicate collection/);
});

test("rejects isolated specs in the standard collection", () => {
  const { standard, isolated } = validEntries();
  standard[0] = { ...standard[0], file: isolated[0].file };
  assert.throws(() => verifyProjectIsolation(report(standard), report(isolated)), /non-standard or Branch 52 spec/);
});
