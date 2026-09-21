import { createClient } from "@supabase/supabase-js";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  classifyPersistentMembership,
  fingerprint,
  planRateLimitCleanup,
  verifyRateLimitRestoration,
} from "./lib/production-smoke-integrity.mjs";

const action = process.argv[2];
if (!new Set(["snapshot", "reconcile"]).has(action)) {
  throw new Error("Usage: node scripts/production-smoke-integrity.mjs <snapshot|reconcile>");
}

const url = process.env.PLAYWRIGHT_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY;
const runId = process.env.PLAYWRIGHT_QA_RUN_ID;
const targetId = process.env.PLAYWRIGHT_PERSISTENT_MEMBERSHIP_ID;
const expectedEventId = process.env.PLAYWRIGHT_PERSISTENT_EVENT_ID;
const expectedUserId = process.env.PLAYWRIGHT_PERSISTENT_PARTNER_USER_ID;
const snapshotPath = path.resolve(process.env.PLAYWRIGHT_INTEGRITY_SNAPSHOT || ".production-smoke-integrity-baseline.json");
const summaryPath = path.resolve(process.env.PLAYWRIGHT_INTEGRITY_SUMMARY || ".production-smoke-integrity-summary.json");

for (const [name, value] of Object.entries({ url, serviceRole, runId, targetId, expectedEventId, expectedUserId })) {
  if (!value) throw new Error(`${name} is required for Production smoke integrity.`);
}
if (!/^[0-9]+-[0-9]+$/.test(runId)) throw new Error("PLAYWRIGHT_QA_RUN_ID must identify one GitHub run and attempt.");

const client = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });

async function rows(table, order) {
  const result = await client.from(table).select("*").order(order, { ascending: true }).range(0, 999);
  if (result.error) throw new Error(`${table} integrity query failed: ${result.error.code || "UNKNOWN"}.`);
  if ((result.data || []).length === 1000) throw new Error(`${table} integrity query reached the fail-closed page limit.`);
  return result.data || [];
}

function persistentMembership(memberships) {
  const target = memberships.filter(row => row.id === targetId);
  if (target.length !== 1) throw new Error("Persistent QA membership identity is not unique.");
  const row = target[0];
  if (row.event_id !== expectedEventId || row.user_id !== expectedUserId || row.role !== "partner" || row.status !== "left") {
    throw new Error("Persistent QA membership does not match its verified technical identity and final state.");
  }
  return row;
}

async function capture() {
  const [rateLimitBuckets, eventMembers] = await Promise.all([
    rows("rate_limit_buckets", "key"),
    rows("event_members", "id"),
  ]);
  if (eventMembers.length !== 22) throw new Error(`Expected 22 persistent event_members rows; found ${eventMembers.length}.`);
  persistentMembership(eventMembers);
  const snapshot = {
    version: 1,
    runId,
    capturedAt: new Date().toISOString(),
    expectedRateLimitActivity: {
      register: 1,
      resendConfirmation: 1,
      passwordRecovery: 1,
      partnerInvite: 2,
      invitationInspect: 4,
    },
    rateLimitBuckets,
    rateLimitFingerprint: fingerprint(rateLimitBuckets),
    eventMembers,
    eventMembersFingerprint: fingerprint(eventMembers),
  };
  writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o600 });
  console.log(`Production integrity baseline captured for run ${runId}: ${rateLimitBuckets.length} buckets, ${eventMembers.length} memberships.`);
}

async function reconcile() {
  const baseline = JSON.parse(readFileSync(snapshotPath, "utf8"));
  if (baseline.version !== 1 || baseline.runId !== runId) throw new Error("Production integrity baseline does not belong to this run.");
  const reconciledAt = new Date().toISOString();
  const [currentBuckets, currentMembers] = await Promise.all([
    rows("rate_limit_buckets", "key"),
    rows("event_members", "id"),
  ]);
  persistentMembership(currentMembers);

  const membership = classifyPersistentMembership(baseline.eventMembers, currentMembers, targetId);
  if (!["A", "B"].includes(membership.classification)) {
    throw new Error(`Persistent QA membership classification ${membership.classification}: ${membership.reason}. STOP without cleanup.`);
  }
  const rateLimit = planRateLimitCleanup(
    baseline.rateLimitBuckets,
    currentBuckets,
    baseline.capturedAt,
    reconciledAt,
  );

  const exactKeys = rateLimit.candidates.map(row => row.key);
  const removed = await client.from("rate_limit_buckets").delete().in("key", exactKeys).select("key,request_count,window_started_at");
  if (removed.error) throw new Error(`Exact QA bucket cleanup failed: ${removed.error.code || "UNKNOWN"}.`);
  const removedFingerprint = fingerprint((removed.data || []).sort((left, right) => left.key.localeCompare(right.key)));
  if ((removed.data || []).length !== exactKeys.length || removedFingerprint !== rateLimit.candidateFingerprint) {
    throw new Error("Exact QA bucket cleanup result does not match the verified snapshot.");
  }

  const restoredBuckets = await rows("rate_limit_buckets", "key");
  const restoredFingerprint = verifyRateLimitRestoration(baseline.rateLimitBuckets, restoredBuckets);
  const summary = {
    version: 1,
    runId,
    reconciledAt,
    rateLimit: {
      baselineCount: baseline.rateLimitBuckets.length,
      candidateCount: rateLimit.candidates.length,
      candidateRows: rateLimit.candidates,
      remainingQaRunBuckets: 0,
      restoredCount: restoredBuckets.length,
      nonQaFingerprintBefore: rateLimit.baselineFingerprint,
      nonQaFingerprintAfter: restoredFingerprint,
    },
    eventMembers: {
      countBefore: baseline.eventMembers.length,
      countAfter: currentMembers.length,
      classification: membership.classification,
      reason: membership.reason,
      id: targetId,
      eventId: expectedEventId,
      userId: expectedUserId,
      roleBefore: membership.before.role,
      roleAfter: membership.after.role,
      statusBefore: membership.before.status,
      statusAfter: membership.after.status,
      createdAtBefore: membership.before.created_at,
      createdAtAfter: membership.after.created_at,
      acceptedAtBefore: membership.before.accepted_at,
      acceptedAtAfter: membership.after.accepted_at,
      updatedAtBefore: membership.before.updated_at,
      updatedAtAfter: membership.after.updated_at,
      functionalFingerprintBefore: membership.functionalFingerprint,
      functionalFingerprintAfter: membership.functionalFingerprint,
      nonTargetFingerprintBefore: membership.otherRowsFingerprint,
      nonTargetFingerprintAfter: membership.otherRowsFingerprint,
    },
  };
  writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  const report = [
    "### Production smoke integrity reconciliation",
    `- run marker: ${runId}`,
    `- exact QA rate-limit buckets removed: ${rateLimit.candidates.length}`,
    "- QA rate-limit buckets remaining: 0",
    `- non-QA rate-limit fingerprint restored: ${restoredFingerprint}`,
    `- event_members: ${membership.classification} (${membership.reason})`,
    `- non-target event_members fingerprint unchanged: ${membership.otherRowsFingerprint}`,
  ].join("\n");
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
}

if (action === "snapshot") await capture();
else await reconcile();
