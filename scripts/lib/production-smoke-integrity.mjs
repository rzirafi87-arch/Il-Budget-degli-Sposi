import { createHash } from "node:crypto";

export function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
  }
  return value;
}

export function fingerprint(value) {
  return createHash("sha256").update(JSON.stringify(stableValue(value))).digest("hex");
}

function fail(message) {
  throw new Error(message);
}

function sorted(rows, key = "id") {
  return [...rows].sort((left, right) => String(left[key]).localeCompare(String(right[key])));
}

function withoutTechnicalTimestamps(row) {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => !["accepted_at", "updated_at"].includes(key)),
  );
}

export function classifyPersistentMembership(baselineRows, currentRows, targetId) {
  const baseline = sorted(baselineRows);
  const current = sorted(currentRows);
  const before = baseline.find(row => row.id === targetId);
  const after = current.find(row => row.id === targetId);
  if (!before || !after || baseline.length !== current.length) {
    return { classification: "D", reason: "membership identity or row count is not determinable" };
  }

  const beforeOther = baseline.filter(row => row.id !== targetId);
  const afterOther = current.filter(row => row.id !== targetId);
  if (fingerprint(beforeOther) !== fingerprint(afterOther)) {
    return { classification: "C", reason: "a non-target event_members row changed" };
  }

  const beforeFunctional = withoutTechnicalTimestamps(before);
  const afterFunctional = withoutTechnicalTimestamps(after);
  if (fingerprint(beforeFunctional) !== fingerprint(afterFunctional)) {
    return { classification: "C", reason: "the persistent QA membership changed functionally" };
  }

  const acceptedChanged = before.accepted_at !== after.accepted_at;
  const updatedChanged = before.updated_at !== after.updated_at;
  if (!acceptedChanged && updatedChanged) {
    return {
      classification: "A",
      reason: "only updated_at changed",
      before,
      after,
      functionalFingerprint: fingerprint(beforeFunctional),
      otherRowsFingerprint: fingerprint(beforeOther),
    };
  }
  if (acceptedChanged) {
    return {
      classification: "B",
      reason: "the expected QA lifecycle returned to the initial functional state",
      before,
      after,
      functionalFingerprint: fingerprint(beforeFunctional),
      otherRowsFingerprint: fingerprint(beforeOther),
    };
  }
  return { classification: "D", reason: "the expected QA lifecycle timestamp transition was not observed" };
}

export function planRateLimitCleanup(baselineRows, currentRows, capturedAt, reconciledAt) {
  const baseline = sorted(baselineRows, "key");
  const current = sorted(currentRows, "key");
  const baselineByKey = new Map(baseline.map(row => [row.key, row]));
  const currentByKey = new Map(current.map(row => [row.key, row]));

  for (const row of baseline) {
    const present = currentByKey.get(row.key);
    if (!present || fingerprint(present) !== fingerprint(row)) {
      fail(`Non-QA rate-limit bucket ${row.key} was modified or removed.`);
    }
  }

  const candidates = current.filter(row => !baselineByKey.has(row.key));
  if (candidates.length !== 5) fail(`Expected exactly 5 new Production smoke buckets; found ${candidates.length}.`);
  if (candidates.some(row => !/^[0-9a-f]{64}$/.test(row.key))) fail("A candidate rate-limit key is not a SHA-256 technical key.");
  if (candidates.some(row => !Number.isInteger(row.request_count) || row.request_count < 1)) fail("A candidate rate-limit count is invalid.");

  const expectedCounts = [1, 1, 1, 2, 4];
  const actualCounts = candidates.map(row => row.request_count).sort((a, b) => a - b);
  if (JSON.stringify(actualCounts) !== JSON.stringify(expectedCounts)) {
    fail(`Production smoke bucket signature mismatch: ${actualCounts.join(",")}.`);
  }

  const lowerBound = Date.parse(capturedAt) - 5_000;
  const upperBound = Date.parse(reconciledAt) + 5_000;
  if (candidates.some(row => {
    const timestamp = Date.parse(row.window_started_at);
    return !Number.isFinite(timestamp) || timestamp < lowerBound || timestamp > upperBound;
  })) fail("A candidate rate-limit timestamp falls outside the controlled smoke window.");

  return {
    candidates: sorted(candidates, "key"),
    baselineFingerprint: fingerprint(baseline),
    candidateFingerprint: fingerprint(sorted(candidates, "key")),
  };
}

export function verifyRateLimitRestoration(baselineRows, restoredRows) {
  const before = sorted(baselineRows, "key");
  const after = sorted(restoredRows, "key");
  if (fingerprint(before) !== fingerprint(after)) fail("Non-QA rate-limit buckets are not byte-identical after cleanup.");
  return fingerprint(after);
}
