import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OLD_APP_BASE_URL",
  "GITHUB_RUN_ID",
];
for (const name of required) assert.ok(process.env[name], `${name} is required`);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.OLD_APP_BASE_URL;
assert.match(supabaseUrl, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/);
assert.match(appUrl, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/);

const report = {
  refs: {
    oldApp: "7aaf48c0736fa50187864145f1d7d41fc1265014",
    newSchema: "e778846d0fffa437be1d17fd891df59e39b7f384",
    lastMigration: "20260928131021_branch_53_delete_remediation.sql",
  },
  runId: process.env.GITHUB_RUN_ID,
  gates: {},
  browser: { skipped: 0, consoleErrors: [], http5xx: [] },
  cleanup: {},
};

function pass(name, detail = "PASS") {
  report.gates[name] = { status: "PASS", detail };
  console.log(`GATE_PASS ${name}: ${detail}`);
}

function clientFor(token) {
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

const admin = createClient(supabaseUrl, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const marker = `qa-b53-compat-${process.env.GITHUB_RUN_ID}-${Date.now()}`;
const password = "Qa-Branch53-Compatibility!9";
const users = [];
let eventId;
let storagePath;
let browser;
let primaryError;

async function createIdentity(label) {
  const email = `${marker}-${label}@qa.local`;
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { qa_scope: "branch-53-old-app-new-schema", qa_marker: marker },
  });
  assert.ifError(created.error);
  assert.ok(created.data.user);
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signed = await authClient.auth.signInWithPassword({ email, password });
  assert.ifError(signed.error);
  assert.ok(signed.data.session?.access_token);
  const identity = {
    id: created.data.user.id,
    email,
    token: signed.data.session.access_token,
    authClient,
  };
  users.push(identity);
  return identity;
}

async function api(path, token, init = {}) {
  const response = await fetch(new URL(path, appUrl), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body };
}

async function expectResolved(identity, role) {
  const result = await api("/api/my/current-event", identity.token);
  assert.equal(result.status, 200);
  assert.equal(result.body.status, "RESOLVED");
  assert.equal(result.body.currentEvent.eventId, eventId);
  assert.equal(result.body.currentEvent.accessRole, role);
}

async function expectDenied(identity) {
  const current = await api("/api/my/current-event", identity.token);
  assert.equal(current.status, 200);
  assert.equal(current.body.status, "NO_EVENT");
  const gift = await api("/api/my/gift-list", identity.token);
  assert.equal(gift.status, 404);
}

async function count(table, column, value) {
  const result = await admin.from(table).select("id", { count: "exact", head: true }).eq(column, value);
  assert.ifError(result.error);
  return result.count ?? 0;
}

try {
  const [owner, partner, legacy, outsider, left, revoked] = await Promise.all([
    createIdentity("owner"),
    createIdentity("partner"),
    createIdentity("legacy"),
    createIdentity("outsider"),
    createIdentity("left"),
    createIdentity("revoked"),
  ]);
  pass("auth-fixtures", "six isolated users created and logged in through Supabase Auth");

  eventId = randomUUID();
  const event = await admin.from("events").insert({
    id: eventId,
    owner_id: owner.id,
    name: `QA-M8-${marker}`,
    event_type: "wedding",
    language: "it",
    country: "IT",
    bride_email: legacy.email,
  });
  assert.ifError(event.error);
  const memberships = await admin.from("event_members").insert([
    { event_id: eventId, user_id: owner.id, role: "owner", status: "active" },
    { event_id: eventId, user_id: partner.id, role: "partner", status: "active" },
    { event_id: eventId, user_id: left.id, role: "partner", status: "left" },
    { event_id: eventId, user_id: revoked.id, role: "partner", status: "revoked" },
  ]);
  assert.ifError(memberships.error);

  const guestIds = [randomUUID(), randomUUID()];
  const guests = await admin.from("guests").insert([
    { id: guestIds[0], event_id: eventId, name: "QA Compat Guest One", guest_type: "bride", attending: true, rsvp_received: true, menu_preferences: [] },
    { id: guestIds[1], event_id: eventId, name: "QA Compat Guest Two", guest_type: "groom", attending: true, rsvp_received: true, menu_preferences: [] },
  ]);
  assert.ifError(guests.error);

  await expectResolved(owner, "owner");
  await expectResolved(partner, "partner");
  await expectResolved(legacy, "legacy");
  await expectDenied(outsider);
  await expectDenied(left);
  await expectDenied(revoked);
  pass("event-access", "owner, active partner and legacy resolved; outsider, left and revoked denied");

  const rlsExpectations = [
    [owner, 2], [partner, 2], [legacy, 2], [outsider, 0], [left, 0], [revoked, 0],
  ];
  for (const [identity, expected] of rlsExpectations) {
    const result = await clientFor(identity.token).from("guests").select("id").eq("event_id", eventId);
    assert.ifError(result.error);
    assert.equal(result.data.length, expected);
  }
  pass("rls-data-api", "authenticated Data API honors owner/partner/legacy and deny states");

  const workspace = await api("/api/my/guests", owner.token);
  assert.equal(workspace.status, 200);
  assert.equal(workspace.body.guests.length, 2);
  workspace.body.guests[0].name = "QA Compat Guest One Updated";
  const guestSave = await api("/api/my/guests", owner.token, {
    method: "POST",
    body: JSON.stringify(workspace.body),
  });
  assert.equal(guestSave.status, 200);
  const guestVerify = await admin.from("guests").select("name").eq("id", guestIds[0]).single();
  assert.ifError(guestVerify.error);
  assert.equal(guestVerify.data.name, "QA Compat Guest One Updated");
  pass("guests-old-api", "legacy GET and transactional snapshot write persisted metadata");

  const firstPlan = [{
    tableNumber: 1,
    tableName: "QA Compat Table A",
    tableType: "family",
    totalSeats: 2,
    notes: "initial",
    assignedGuests: [{ guestId: guestIds[0], seatNumber: 1 }, { guestId: guestIds[1], seatNumber: 2 }],
  }];
  const tableCreate = await api("/api/my/tables", owner.token, { method: "POST", body: JSON.stringify({ tables: firstPlan }) });
  assert.equal(tableCreate.status, 200);
  let tableRows = await admin.from("tables").select("id,table_number,table_name,total_seats").eq("event_id", eventId);
  assert.ifError(tableRows.error);
  assert.equal(tableRows.data.length, 1);
  assert.equal(tableRows.data[0].table_name, "QA Compat Table A");
  let assignments = await admin.from("table_assignments").select("guest_id,seat_number").eq("table_id", tableRows.data[0].id).order("seat_number");
  assert.ifError(assignments.error);
  assert.deepEqual(assignments.data.map(row => row.seat_number), [1, 2]);

  const secondPlan = [{
    tableNumber: 1,
    tableName: "QA Compat Table B",
    tableType: "friends",
    totalSeats: 3,
    notes: "regenerated",
    assignedGuests: [{ guestId: guestIds[0], seatNumber: 1 }],
  }];
  const tableUpdate = await api("/api/my/tables", owner.token, { method: "POST", body: JSON.stringify({ tables: secondPlan }) });
  assert.equal(tableUpdate.status, 200);
  tableRows = await admin.from("tables").select("id,table_number,table_name,total_seats").eq("event_id", eventId);
  assert.ifError(tableRows.error);
  assert.equal(tableRows.data.length, 1);
  assert.equal(tableRows.data[0].table_name, "QA Compat Table B");
  assert.equal(tableRows.data[0].total_seats, 3);
  assignments = await admin.from("table_assignments").select("guest_id,seat_number").eq("table_id", tableRows.data[0].id);
  assert.ifError(assignments.error);
  assert.equal(assignments.data.length, 1);

  const partnerRead = await api("/api/my/tables", partner.token);
  assert.equal(partnerRead.status, 200);
  assert.equal(partnerRead.body.tables.length, 1);
  const tableDelete = await api("/api/my/tables", partner.token, { method: "POST", body: JSON.stringify({ tables: [] }) });
  assert.equal(tableDelete.status, 200);
  assert.equal(await count("tables", "event_id", eventId), 0);
  assert.equal(await count("table_assignments", "guest_id", guestIds[0]), 0);
  pass("tables-old-api", "read, create, assign, regenerate, modify, partner access and delete-all are compatible with new constraints");

  const giftCreate = await api("/api/my/gift-list", owner.token, {
    method: "POST",
    body: JSON.stringify({ type: "Cassa comune", name: "QA Compat Gift", price: 125, priority: "media", status: "desiderato" }),
  });
  assert.equal(giftCreate.status, 201);
  assert.ok(giftCreate.body.item.id);
  const giftId = giftCreate.body.item.id;
  const giftRead = await api("/api/my/gift-list", partner.token);
  assert.equal(giftRead.status, 200);
  assert.equal(giftRead.body.items.some(item => item.id === giftId), true);
  const giftUpdate = await api("/api/my/gift-list", owner.token, {
    method: "PUT",
    body: JSON.stringify({ ...giftCreate.body.item, id: giftId, type: "Cassa comune", name: "QA Compat Gift Updated", status: "acquistato" }),
  });
  assert.equal(giftUpdate.status, 200);
  assert.equal(giftUpdate.body.item.name, "QA Compat Gift Updated");
  const giftDelete = await api(`/api/my/gift-list?id=${giftId}`, owner.token, { method: "DELETE" });
  assert.equal(giftDelete.status, 200);
  assert.equal(await count("gift_list", "event_id", eventId), 0);
  pass("gift-list-old-api", "old gift_list CRUD remains functional beside Branch 53 gift_list_items");

  storagePath = `${eventId}/qa-${marker}.png`;
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const uploaded = await admin.storage.from("event-documents").upload(storagePath, png, { contentType: "image/png", upsert: false });
  assert.ifError(uploaded.error);
  const ownerDownload = await clientFor(owner.token).storage.from("event-documents").download(storagePath);
  assert.ifError(ownerDownload.error);
  const outsiderDownload = await clientFor(outsider.token).storage.from("event-documents").download(storagePath);
  assert.ok(outsiderDownload.error);
  pass("storage-service", "real Storage upload plus owner read and outsider deny confirmed against local stack");

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("console", message => {
    if (message.type() === "error") report.browser.consoleErrors.push(message.text());
  });
  page.on("response", response => {
    if (response.status() >= 500) report.browser.http5xx.push({ status: response.status(), url: response.url() });
  });

  for (const locale of ["it", "en"]) {
    const response = await page.goto(`${appUrl}/${locale}`, { waitUntil: "domcontentloaded" });
    assert.ok(response);
    assert.ok(response.status() < 500);
    assert.ok((await page.locator("body").innerText()).trim().length > 0);
  }
  await page.goto(`${appUrl}/it/auth`);
  await page.getByLabel("Email", { exact: true }).fill(owner.email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  const tokenResponse = page.waitForResponse(response => response.url().includes("/auth/v1/token"));
  await page.getByRole("button", { name: /accedi/i }).click();
  assert.equal((await tokenResponse).status(), 200);
  await page.waitForURL(/\/it\/(dashboard|select-event)/);
  await context.setExtraHTTPHeaders({ Authorization: `Bearer ${owner.token}` });

  for (const path of ["dashboard", "invitati", "invitati/tavoli", "lista-nozze", "documenti"]) {
    const response = await page.goto(`${appUrl}/it/${path}`, { waitUntil: "networkidle" });
    assert.ok(response);
    assert.ok(response.status() < 500, `${path} returned ${response.status()}`);
    assert.ok((await page.locator("body").innerText()).trim().length > 0);
  }

  await page.goto(`${appUrl}/it/invitati/tavoli`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /assegna automaticamente/i }).click();
  const uiSave = page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/tables");
  await page.getByRole("button", { name: /^salva/i }).click();
  assert.equal((await uiSave).status(), 200);
  assert.ok(await count("tables", "event_id", eventId) > 0);
  pass("browser-table-write", "old table UI generated and persisted a valid plan on the new schema");

  await page.goto(`${appUrl}/it/lista-nozze`, { waitUntil: "networkidle" });
  await page.getByLabel(/nome/i).first().fill("QA Browser Gift");
  const uiGift = page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/gift-list");
  await page.getByRole("button", { name: /^aggiungi$/i }).click();
  assert.equal((await uiGift).status(), 201);
  assert.equal(await count("gift_list", "event_id", eventId), 1);

  await page.goto(`${appUrl}/it/documenti`, { waitUntil: "networkidle" });
  await page.locator('input[type="file"]').setInputFiles({ name: "qa-compat.png", mimeType: "image/png", buffer: Buffer.from(png) });
  await page.getByText("qa-compat.png", { exact: true }).waitFor({ state: "visible", timeout: 10_000 });
  pass("browser-runtime", "IT/EN landing, login, dashboard, event modules, guests, tables, gift list and legacy document UI executed");

  assert.deepEqual(report.browser.http5xx, []);
  assert.deepEqual(report.browser.consoleErrors, []);
  pass("browser-errors", "zero critical console errors and zero HTTP 5xx");

  await owner.authClient.auth.signOut();
  const session = await owner.authClient.auth.getSession();
  assert.equal(session.data.session, null);
  pass("session-lifecycle", "login and logout/session invalidation completed");
} catch (error) {
  primaryError = error;
  report.failure = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
  console.error("GATE_FAILURE", report.failure);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (storagePath) {
    const removed = await admin.storage.from("event-documents").remove([storagePath]);
    if (removed.error && !primaryError) primaryError = removed.error;
  }
  if (eventId) {
    const removedEvent = await admin.from("events").delete().eq("id", eventId);
    if (removedEvent.error && !primaryError) primaryError = removedEvent.error;
  }
  for (const user of users.reverse()) {
    await user.authClient.auth.signOut().catch(() => {});
    const removed = await admin.auth.admin.deleteUser(user.id);
    if (removed.error && !primaryError) primaryError = removed.error;
  }

  if (eventId) {
    const dbResidue = await Promise.all([
      count("events", "id", eventId),
      count("guests", "event_id", eventId),
      count("tables", "event_id", eventId),
      count("gift_list", "event_id", eventId),
      count("event_documents", "event_id", eventId),
    ]);
    report.cleanup.databaseRows = dbResidue.reduce((sum, value) => sum + value, 0);
    const listed = await admin.storage.from("event-documents").list(eventId);
    report.cleanup.storageObjects = listed.error ? -1 : (listed.data?.length ?? 0);
  }
  let authResidue = 0;
  for (const user of users) {
    const lookup = await admin.auth.admin.getUserById(user.id);
    if (!lookup.error && lookup.data.user) authResidue += 1;
  }
  report.cleanup.authUsers = authResidue;
  report.cleanup.externalWrites = 0;
  if (report.cleanup.databaseRows !== 0 || report.cleanup.storageObjects !== 0 || authResidue !== 0) {
    primaryError ||= new Error(`Cleanup residue: ${JSON.stringify(report.cleanup)}`);
  }
  report.result = primaryError ? "FAIL" : "PASS";
  await writeFile("gate-evidence.json", `${JSON.stringify(report, null, 2)}\n`);
  console.log(`CLEANUP_EVIDENCE ${JSON.stringify(report.cleanup)}`);
  console.log(`OLD_APP_NEW_SCHEMA=${report.result}`);
}

if (primaryError) throw primaryError;
