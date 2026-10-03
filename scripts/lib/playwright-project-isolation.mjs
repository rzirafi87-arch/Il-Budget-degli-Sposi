import path from "node:path";

export const ISOLATED_SPEC_FILES = Object.freeze([
  "milestone8-lifecycle.spec.ts",
  "branch52-location-supplier.spec.ts",
  "branch52-supplier-work.spec.ts",
  "branch52-milestone5-ux.spec.ts",
  "branch52-security-matrix.spec.ts",
]);

export const STANDARD_SPEC_FILES = Object.freeze([
  "authenticated-wedding.spec.ts",
  "language-rollout.spec.ts",
  "partner-lifecycle.spec.ts",
  "signup-email-delivery.spec.ts",
]);

const widths = [320, 360, 375, 390, 412, 430];
const locales = ["it", "en", "es", "fr", "de"];
export const STANDARD_PROJECTS = Object.freeze(
  locales.flatMap(locale => widths.map(width => `${locale}-${width}`)),
);

export const PREVIEW_READ_ONLY_SPEC_FILE = "language-rollout.spec.ts";
export const PREVIEW_RUNTIME_SPEC_FILE = "i18n-runtime.spec.ts";
export const PREVIEW_RUNTIME_PROJECTS = Object.freeze(
  locales.flatMap(locale => [320, 390, 430, "desktop"].map(viewport => `runtime-${locale}-${viewport}`)),
);

export const ISOLATED_JOURNEYS = Object.freeze([
  ["milestone8-lifecycle.spec.ts", "[M8][diagnostic]", "m8-320"],
  ["milestone8-lifecycle.spec.ts", "[M8][reset]", "m8-320"],
  ["milestone8-lifecycle.spec.ts", "[M8][matrix]", "m8-320"],
  ["milestone8-lifecycle.spec.ts", "[M8][responsive-320]", "m8-320"],
  ["branch52-location-supplier.spec.ts", "[M3][associations-320]", "m8-320"],
  ["branch52-supplier-work.spec.ts", "[M4][supplier-work-320]", "m8-320"],
  ["branch52-milestone5-ux.spec.ts", "[M5][guest-mobile]", "m8-320"],
  ["branch52-security-matrix.spec.ts", "[M6][security-matrix]", "m8-390"],
  ["milestone8-lifecycle.spec.ts", "[M8][responsive-430]", "m8-430"],
  ["milestone8-lifecycle.spec.ts", "[M8][idea-budget]", "m8-430"],
  ["branch52-location-supplier.spec.ts", "[M3][associations-430]", "m8-430"],
  ["branch52-supplier-work.spec.ts", "[M4][supplier-work-430]", "m8-430"],
]);

export function collectionEntries(report) {
  const entries = [];
  const visit = suites => {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          entries.push({
            file: path.basename(spec.file || ""),
            title: spec.title || "",
            project: test.projectName || "",
          });
        }
      }
      visit(suite.suites);
    }
  };
  visit(report?.suites);
  return entries;
}

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoDuplicates(entries, label) {
  const keys = entries.map(entry => `${entry.file}\u0000${entry.title}\u0000${entry.project}`);
  requireCondition(new Set(keys).size === keys.length, `${label} contains an involuntary duplicate collection.`);
}

export function verifyProjectIsolation(standardReport, isolatedReport) {
  const standard = collectionEntries(standardReport);
  const isolated = collectionEntries(isolatedReport);
  const isolatedFiles = new Set(ISOLATED_SPEC_FILES);
  const standardFiles = new Set(STANDARD_SPEC_FILES);
  const standardProjects = new Set(STANDARD_PROJECTS);
  const allowedIsolatedProjects = new Set(["m8-320", "m8-390", "m8-430"]);

  assertNoDuplicates(standard, "Standard collection");
  assertNoDuplicates(isolated, "Branch 52 collection");

  requireCondition(standard.length === 120, `Standard collection must contain 120 project cases; found ${standard.length}.`);
  requireCondition(
    standard.every(entry => standardFiles.has(entry.file)),
    "Standard collection contains a non-standard or Branch 52 spec.",
  );
  requireCondition(
    standard.every(entry => standardProjects.has(entry.project)),
    "Standard collection contains an unexpected Playwright project.",
  );
  requireCondition(
    standard.every(entry => !isolatedFiles.has(entry.file)),
    "A Branch 52 isolated spec was collected by a standard project.",
  );
  for (const file of STANDARD_SPEC_FILES) {
    const projects = standard.filter(entry => entry.file === file).map(entry => entry.project);
    requireCondition(projects.length === STANDARD_PROJECTS.length, `${file} is not collected across the complete standard matrix.`);
    requireCondition(
      STANDARD_PROJECTS.every(project => projects.includes(project)),
      `${file} is missing a required standard project.`,
    );
  }

  requireCondition(isolated.length === ISOLATED_JOURNEYS.length, `Branch 52 collection must contain 12 journeys; found ${isolated.length}.`);
  requireCondition(
    isolated.every(entry => isolatedFiles.has(entry.file)),
    "Branch 52 configuration collected a spec outside the isolated allowlist.",
  );
  requireCondition(
    isolated.every(entry => allowedIsolatedProjects.has(entry.project)),
    "Branch 52 spec was collected by an incorrect project.",
  );
  requireCondition(
    isolated.every(entry => !standardProjects.has(entry.project)),
    "Branch 52 spec was collected by de-430 or another standard project.",
  );

  for (const [file, titleMarker, project] of ISOLATED_JOURNEYS) {
    const matches = isolated.filter(entry => entry.file === file && entry.title.includes(titleMarker));
    requireCondition(matches.length === 1, `${titleMarker} must be collected exactly once; found ${matches.length}.`);
    requireCondition(matches[0].project === project, `${titleMarker} must run in ${project}; found ${matches[0].project}.`);
  }

  return {
    standardCases: standard.length,
    standardProjects: new Set(standard.map(entry => entry.project)).size,
    isolatedJourneys: isolated.length,
    isolatedProjects: [...new Set(isolated.map(entry => entry.project))].sort(),
  };
}

export function verifyPreviewReadOnlyCollection(previewReport) {
  const preview = collectionEntries(previewReport);
  const standardProjects = new Set(STANDARD_PROJECTS);
  const runtimeProjects = new Set(PREVIEW_RUNTIME_PROJECTS);

  assertNoDuplicates(preview, "Preview read-only collection");
  requireCondition(
    preview.length === STANDARD_PROJECTS.length + PREVIEW_RUNTIME_PROJECTS.length,
    `Preview read-only collection must contain 50 non-mutating project cases; found ${preview.length}.`,
  );
  requireCondition(
    preview.every(entry => entry.file === PREVIEW_READ_ONLY_SPEC_FILE || entry.file === PREVIEW_RUNTIME_SPEC_FILE),
    "Preview read-only collection contains an authenticated or mutating spec.",
  );
  requireCondition(
    preview.every(entry => standardProjects.has(entry.project) || runtimeProjects.has(entry.project)),
    "Preview read-only collection contains an unexpected Playwright project.",
  );
  requireCondition(
    STANDARD_PROJECTS.every(project => preview.some(entry => entry.project === project)),
    "Preview read-only collection is missing a required locale/viewport project.",
  );
  requireCondition(
    PREVIEW_RUNTIME_PROJECTS.every(project => preview.some(entry => entry.project === project && entry.file === PREVIEW_RUNTIME_SPEC_FILE)),
    "Preview read-only collection is missing a required runtime locale/viewport project.",
  );
  requireCondition(
    preview.every(entry => entry.file === PREVIEW_RUNTIME_SPEC_FILE ? runtimeProjects.has(entry.project) : standardProjects.has(entry.project)),
    "Preview read-only spec was collected by the wrong project family.",
  );

  return {
    previewCases: preview.length,
    previewProjects: new Set(preview.map(entry => entry.project)).size,
  };
}
