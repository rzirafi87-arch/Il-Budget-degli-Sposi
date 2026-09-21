import { createClient } from "@supabase/supabase-js";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  classifyPersistentMembership,
  fingerprint,
  planQaIdentityCleanup,
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
const emailDomain = process.env.PLAYWRIGHT_QA_EMAIL_DOMAIN;
const snapshotPath = path.resolve(process.env.PLAYWRIGHT_INTEGRITY_SNAPSHOT || ".production-smoke-integrity-baseline.json");
const summaryPath = path.resolve(process.env.PLAYWRIGHT_INTEGRITY_SUMMARY || ".production-smoke-integrity-summary.json");

for (const [name, value] of Object.entries({ url, serviceRole, runId, targetId, expectedEventId, expectedUserId, emailDomain })) {
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

async function authUsers() {
  const users = [];
  const perPage = 1_000;
  for (let page = 1; page <= 20; page += 1) {
    const result = await client.auth.admin.listUsers({ page, perPage });
    if (result.error) throw new Error(`Auth identity inventory failed: ${result.error.name || "UNKNOWN"}.`);
    const batch = result.data.users || [];
    users.push(...batch);
    if (batch.length < perPage) return users;
  }
  throw new Error("Auth identity inventory reached the fail-closed page limit.");
}

async function deleteQaRunIdentities(plan, capturedAt, reconciledAt) {
  const deleted = [];
  const lowerBound = Date.parse(capturedAt) - 5_000;
  const upperBound = Date.parse(reconciledAt) + 5_000;
  for (const identity of plan.candidates) {
    const owned = await client.from("events").select("id,owner_id,name,created_at").eq("owner_id", identity.id);
    if (owned.error) throw new Error("QA identity event ownership verification failed.");
    for (const event of owned.data || []) {
      const createdAt = Date.parse(event.created_at || "");
      if (event.owner_id !== identity.id || !Number.isFinite(createdAt) || createdAt < lowerBound || createdAt > upperBound) {
        throw new Error("Refusing QA identity cleanup because an owned event is outside the controlled smoke window.");
      }
      const removed = await client.from("events").delete().eq("id", event.id).eq("owner_id", identity.id).select("id").single();
      if (removed.error || removed.data?.id !== event.id) throw new Error("Exact QA-owned event cleanup failed.");
    }
    const current = await client.auth.admin.getUserById(identity.id);
    if (current.error || !current.data.user) throw new Error("QA identity disappeared before exact cleanup.");
    const revalidated = planQaIdentityCleanup([current.data.user], { runId, emailDomain, capturedAt, reconciledAt });
    if (revalidated.candidates.length !== 1 || fingerprint(revalidated.candidates[0]) !== fingerprint(identity)) {
      throw new Error("QA identity marker changed before exact cleanup.");
    }
    const result = await client.auth.admin.deleteUser(identity.id);
    if (result.error) throw new Error(`Exact QA identity cleanup failed: ${result.error.name || "UNKNOWN"}.`);
    deleted.push({ ...identity, ownedEventCount: (owned.data || []).length });
  }
  const remaining = planQaIdentityCleanup(await authUsers(), { runId, emailDomain, capturedAt, reconciledAt });
  if (remaining.candidates.length !== 0) throw new Error("QA identities remain after exact cleanup.");
  return deleted;
}

async function capture() {
  const capturedAt = new Date().toISOString();
  const [rateLimitBuckets, eventMembers, users] = await Promise.all([
    rows("rate_limit_buckets", "key"),
    rows("event_members", "id"),
    authUsers(),
  ]);
  if (eventMembers.length !== 22) throw new Error(`Expected 22 persistent event_members rows; found ${eventMembers.length}.`);
  persistentMembership(eventMembers);
  const preexistingQaIdentities = planQaIdentityCleanup(users, { runId, emailDomain, capturedAt, reconciledAt: capturedAt });
  if (preexistingQaIdentities.candidates.length !== 0) throw new Error("This run marker already belongs to a QA identity before browser execution.");
  const snapshot = {
    version: 2,
    runId,
    capturedAt,
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
    qaIdentityBaselineFingerprint: preexistingQaIdentities.candidateFingerprint,
  };
  writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o600 });
  console.log(`Production integrity baseline captured for run ${runId}: ${rateLimitBuckets.length} buckets, ${eventMembers.length} memberships.`);
}

async function reconcile() {
  const baseline = JSON.parse(readFileSync(snapshotPath, "utf8"));
  if (baseline.version !== 2 || baseline.runId !== runId) throw new Error("Production integrity baseline does not belong to this run.");
  const reconciledAt = new Date().toISOString();
  const [currentBuckets, currentMembers, users] = await Promise.all([
    rows("rate_limit_buckets", "key"),
    rows("event_members", "id"),
    authUsers(),
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
  const qaIdentities = planQaIdentityCleanup(users, {
    runId,
    emailDomain,
    capturedAt: baseline.capturedAt,
    reconciledAt,
  });
  const deletedQaIdentities = await deleteQaRunIdentities(qaIdentities, baseline.capturedAt, reconciledAt);

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
    version: 2,
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
    qaIdentities: {
      candidateCount: qaIdentities.candidates.length,
      candidateFingerprint: qaIdentities.candidateFingerprint,
      deleted: deletedQaIdentities,
      remaining: 0,
    },
  };
  writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  const report = [
    "### Production smoke integrity reconciliation",
    `- run marker: ${runId}`,
    `- exact QA rate-limit buckets removed: ${rateLimit.candidates.length}`,
    "- QA rate-limit buckets remaining: 0",
    `- non-QA rate-limit fingerprint restored: ${restoredFingerprint}`,
    `- exact run-scoped QA identities removed: ${deletedQaIdentities.length}`,
    "- run-scoped QA identities remaining: 0",
    `- event_members: ${membership.classification} (${membership.reason})`,
    `- non-target event_members fingerprint unchanged: ${membership.otherRowsFingerprint}`,
  ].join("\n");
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
}

if (action === "snapshot") await capture();
else await reconcile();
