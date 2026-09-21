import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyPersistentMembership,
  planRateLimitCleanup,
  verifyRateLimitRestoration,
} from "./production-smoke-integrity.mjs";

const beforeMembership = {
  id: "qa-membership",
  event_id: "qa-event",
  user_id: "qa-user",
  role: "partner",
  status: "left",
  created_at: "2026-09-15T00:00:00Z",
  accepted_at: "2026-09-20T00:00:00Z",
  updated_at: "2026-09-20T00:01:00Z",
};
const otherMembership = { id: "real-membership", event_id: "real-event", user_id: "real-user", role: "owner", status: "active" };

test("classifies a functionally restored QA lifecycle as B", () => {
  const after = { ...beforeMembership, accepted_at: "2026-09-21T00:00:00Z", updated_at: "2026-09-21T00:01:00Z" };
  const result = classifyPersistentMembership([beforeMembership, otherMembership], [after, otherMembership], beforeMembership.id);
  assert.equal(result.classification, "B");
});

test("stops on a functional membership change", () => {
  const after = { ...beforeMembership, status: "active", updated_at: "2026-09-21T00:01:00Z" };
  const result = classifyPersistentMembership([beforeMembership, otherMembership], [after, otherMembership], beforeMembership.id);
  assert.equal(result.classification, "C");
});

test("attributes only the exact five-bucket smoke signature", () => {
  const baseline = [{ key: "a".repeat(64), request_count: 7, window_started_at: "2026-09-20T00:00:00Z" }];
  const counts = [1, 1, 1, 2, 4];
  const current = [...baseline, ...counts.map((request_count, index) => ({
    key: String(index + 1).repeat(64),
    request_count,
    window_started_at: `2026-09-21T13:3${index}:00Z`,
  }))];
  const plan = planRateLimitCleanup(baseline, current, "2026-09-21T13:29:59Z", "2026-09-21T13:40:01Z");
  assert.equal(plan.candidates.length, 5);
  assert.equal(verifyRateLimitRestoration(baseline, baseline).length, 64);
});

test("stops before cleanup when a non-QA bucket changed", () => {
  const baseline = [{ key: "a".repeat(64), request_count: 7, window_started_at: "2026-09-20T00:00:00Z" }];
  const current = [{ ...baseline[0], request_count: 8 }];
  assert.throws(
    () => planRateLimitCleanup(baseline, current, "2026-09-21T13:29:59Z", "2026-09-21T13:40:01Z"),
    /Non-QA rate-limit bucket/,
  );
});
