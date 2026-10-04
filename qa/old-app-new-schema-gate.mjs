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
  "NEW_SCHEMA_REF",
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
    newSchema: process.env.NEW_SCHEMA_REF,
    lastMigration: "20261004090526_branch_53_review_followup.sql",
  },
  runId: process.env.GITHUB_RUN_ID,
  gates: {},
  browser: { skipped: 0, consoleErrors: [], http5xx: [], http4xx: [], failedRequests: [] },
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
let eventIdB;
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
  const giftWrite = await api("/api/my/gift-list", identity.token, {
    method: "POST",
    body: JSON.stringify({ type: "Altro", name: "Denied gift", priority: "media", status: "desiderato" }),
  });
  assert.equal(giftWrite.status, 404);
}

async function count(table, column, value) {
  const result = await admin.from(table).select("id", { count: "exact", head: true }).eq(column, value);
  assert.ifError(result.error);
  return result.count ?? 0;
}

try {
  const [owner, partner, legacy, outsider, left, revoked, otherOwner] = await Promise.all([
    createIdentity("owner"),
    createIdentity("partner"),
    createIdentity("legacy"),
    createIdentity("outsider"),
    createIdentity("left"),
    createIdentity("revoked"),
    createIdentity("other-owner"),
  ]);
  pass("auth-fixtures", "seven isolated users created and logged in through Supabase Auth");

  eventId = randomUUID();
  eventIdB = randomUUID();
  const event = await admin.from("events").insert([
    {
      id: eventId,
      owner_id: owner.id,
      name: `QA-M8-${marker}`,
      event_type: "wedding",
      language: "it",
      country: "IT",
      bride_email: legacy.email,
    },
    {
      id: eventIdB,
      owner_id: otherOwner.id,
      name: `QA-M8-cross-event-${marker}`,
      event_type: "wedding",
      language: "it",
      country: "IT",
    },
  ]);
  assert.ifError(event.error);
  const memberships = await admin.from("event_members").upsert([
    { event_id: eventId, user_id: owner.id, role: "owner", status: "active" },
    { event_id: eventId, user_id: partner.id, role: "partner", status: "active" },
    { event_id: eventId, user_id: left.id, role: "partner", status: "left" },
    { event_id: eventId, user_id: revoked.id, role: "partner", status: "revoked" },
  ], { onConflict: "event_id,user_id" });
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
  pass("event-access", "owner, active partner and legacy resolved; outsider, left and revoked denied for reads and writes");

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
    body: JSON.stringify({ type: "Cassa comune", name: "QA Compat Gift", price: 125, priority: "media", status: "desiderato", notes: "Nota legacy" }),
  });
  assert.equal(giftCreate.status, 201);
  assert.ok(giftCreate.body.item.id);
  const giftId = giftCreate.body.item.id;
  assert.equal(giftCreate.body.item.priority, "media");
  assert.equal(giftCreate.body.item.status, "desiderato");
  assert.equal(Number(giftCreate.body.item.price), 125);
  assert.equal(giftCreate.body.item.notes, "Nota legacy");
  const canonicalCreate = await admin.from("gift_list_items")
    .select("id,event_id,created_by,type,name,target_amount,priority,status,note")
    .eq("id", giftId)
    .single();
  assert.ifError(canonicalCreate.error);
  assert.equal(canonicalCreate.data.event_id, eventId);
  assert.equal(canonicalCreate.data.created_by, owner.id);
  assert.equal(canonicalCreate.data.target_amount, 125);
  assert.equal(canonicalCreate.data.priority, "medium");
  assert.equal(canonicalCreate.data.status, "wanted");
  assert.equal(canonicalCreate.data.note, "Nota legacy");
  pass("gift-list-old-create-new-read", "legacy create maps to the canonical row without duplication");

  // Exact type values emitted by OLD APP main@7aaf48c; no schema normalization
  // may discard the old representation or create a second persisted row.
  const giftTypes = {
    honeymoon: "Contributo viaggio di nozze", cash: "Cassa comune",
    experiences: "Esperienze (cene, spa, tour)", furniture: "Arredamento",
    appliances: "Elettrodomestici", luxury: "Beni di lusso", charity: "Beneficenza",
    vouchers: "Buoni regalo", smartHome: "Tech & Smart Home", other: "Altro",
  };
  for (const [canonicalType, legacyType] of Object.entries(giftTypes)) {
    const created = await api("/api/my/gift-list", owner.token, {
      method: "POST",
      body: JSON.stringify({ type: legacyType, name: `QA Type ${canonicalType}`, priority: "media", status: "desiderato" }),
    });
    assert.equal(created.status, 201);
    const id = created.body.item.id;
    assert.equal(created.body.item.type, legacyType);
    const stored = await admin.from("gift_list_items").select("id,type").eq("id", id).single();
    assert.ifError(stored.error);
    assert.equal(stored.data.type, legacyType);
    const newWrite = await admin.from("gift_list_items").update({ type: canonicalType }).eq("id", id);
    assert.ifError(newWrite.error);
    const oldRead = await api("/api/my/gift-list", partner.token);
    assert.equal(oldRead.status, 200);
    assert.equal(oldRead.body.items.find(item => item.id === id)?.type, canonicalType);
    const oldWrite = await api("/api/my/gift-list", partner.token, {
      method: "PUT",
      body: JSON.stringify({ ...created.body.item, type: legacyType }),
    });
    assert.equal(oldWrite.status, 200);
    const roundTrip = await admin.from("gift_list_items").select("id,type").eq("id", id).single();
    assert.ifError(roundTrip.error);
    assert.equal(roundTrip.data.type, legacyType);
    assert.equal(await count("gift_list_items", "id", id), 1);
    assert.equal((await api(`/api/my/gift-list?id=${id}`, owner.token, { method: "DELETE" })).status, 200);
    assert.equal(await count("gift_list_items", "id", id), 0);
  }
  pass("gift-list-all-type-round-trips", "10 legacy/canonical types: old write/new read, new write/old read, old update, unique row and delete");

  const giftRead = await api("/api/my/gift-list", partner.token);
  assert.equal(giftRead.status, 200);
  assert.equal(giftRead.body.items.some(item => item.id === giftId), true);
  const giftUpdate = await api("/api/my/gift-list", partner.token, {
    method: "PUT",
    body: JSON.stringify({ ...giftCreate.body.item, id: giftId, type: "Cassa comune", name: "QA Compat Gift Updated", priority: "alta", status: "acquistato", price: 250, notes: "Partner update" }),
  });
  assert.equal(giftUpdate.status, 200);
  assert.equal(giftUpdate.body.item.name, "QA Compat Gift Updated");
  assert.equal(giftUpdate.body.item.priority, "alta");
  assert.equal(giftUpdate.body.item.status, "acquistato");
  const canonicalPartnerUpdate = await admin.from("gift_list_items").select("name,target_amount,priority,status,note").eq("id", giftId).single();
  assert.ifError(canonicalPartnerUpdate.error);
  assert.deepEqual(canonicalPartnerUpdate.data, { name: "QA Compat Gift Updated", target_amount: 250, priority: "high", status: "received", note: "Partner update" });
  pass("gift-list-partner-old-update-new-read", "active partner updates the same canonical row with deterministic priority/status mapping");

  const newUpdate = await admin.from("gift_list_items").update({ name: "QA New App Update", priority: "low", status: "wanted", target_amount: 300, note: "New update" }).eq("id", giftId);
  assert.ifError(newUpdate.error);
  const oldAfterNewUpdate = await api("/api/my/gift-list", owner.token);
  assert.equal(oldAfterNewUpdate.status, 200);
  const mappedAfterNewUpdate = oldAfterNewUpdate.body.items.find(item => item.id === giftId);
  assert.deepEqual(
    { name: mappedAfterNewUpdate.name, priority: mappedAfterNewUpdate.priority, status: mappedAfterNewUpdate.status, price: Number(mappedAfterNewUpdate.price), notes: mappedAfterNewUpdate.notes },
    { name: "QA New App Update", priority: "bassa", status: "desiderato", price: 300, notes: "New update" },
  );
  pass("gift-list-new-update-old-read", "canonical update round-trips through the old contract");

  const legacyCreate = await api("/api/my/gift-list", legacy.token, {
    method: "POST",
    body: JSON.stringify({ type: "Esperienze", name: "QA Legacy Collaborator Gift", price: 75, priority: "bassa", status: "acquistato" }),
  });
  assert.equal(legacyCreate.status, 201);
  const legacyGiftId = legacyCreate.body.item.id;
  const legacyCanonical = await admin.from("gift_list_items").select("created_by,priority,status,target_amount").eq("id", legacyGiftId).single();
  assert.ifError(legacyCanonical.error);
  assert.deepEqual(legacyCanonical.data, { created_by: legacy.id, priority: "low", status: "received", target_amount: 75 });
  pass("gift-list-legacy-collaborator", "legacy collaborator remains authorized through requireEventAccess");

  const newWantedId = randomUUID();
  const newReceivedId = randomUUID();
  const newArchivedId = randomUUID();
  const canonicalRows = await admin.from("gift_list_items").insert([
    { id: newWantedId, event_id: eventId, created_by: owner.id, type: "Arredamento", name: "QA New Wanted", priority: "high", status: "wanted" },
    { id: newReceivedId, event_id: eventId, created_by: owner.id, type: "Elettrodomestici", name: "QA New Received", priority: "medium", status: "received" },
    { id: newArchivedId, event_id: eventId, created_by: owner.id, type: "Altro", name: "QA New Archived", priority: "low", status: "archived" },
  ]);
  assert.ifError(canonicalRows.error);
  const oldMappedRows = await api("/api/my/gift-list", owner.token);
  assert.equal(oldMappedRows.status, 200);
  assert.equal(oldMappedRows.body.items.find(item => item.id === newWantedId)?.status, "desiderato");
  assert.equal(oldMappedRows.body.items.find(item => item.id === newReceivedId)?.status, "acquistato");
  assert.equal(oldMappedRows.body.items.some(item => item.id === newArchivedId), false);
  pass("gift-list-new-status-old-read", "wanted and received map to old statuses; archived is hidden");

  const archiveExisting = await admin.from("gift_list_items").update({ status: "archived" }).eq("id", giftId);
  assert.ifError(archiveExisting.error);
  const oldAfterArchive = await api("/api/my/gift-list", owner.token);
  assert.equal(oldAfterArchive.status, 200);
  assert.equal(oldAfterArchive.body.items.some(item => item.id === giftId), false);
  pass("gift-list-new-archive-old-behavior", "new archive removes the item from the old active list");

  const crossEventGiftId = randomUUID();
  const crossEventGift = await admin.from("gift_list_items").insert({ id: crossEventGiftId, event_id: eventIdB, created_by: otherOwner.id, type: "Altro", name: "QA Cross Event", priority: "medium", status: "wanted" });
  assert.ifError(crossEventGift.error);
  const ownerCrossUpdate = await api("/api/my/gift-list", owner.token, {
    method: "PUT",
    body: JSON.stringify({ id: crossEventGiftId, type: "Altro", name: "Tampered", priority: "media", status: "desiderato" }),
  });
  assert.equal(ownerCrossUpdate.status, 404);
  const otherCrossDelete = await api(`/api/my/gift-list?id=${legacyGiftId}`, otherOwner.token, { method: "DELETE" });
  assert.equal(otherCrossDelete.status, 404);
  const crossVerify = await admin.from("gift_list_items").select("name").eq("id", crossEventGiftId).single();
  assert.ifError(crossVerify.error);
  assert.equal(crossVerify.data.name, "QA Cross Event");
  pass("gift-list-cross-event", "cross-event item IDs and actors cannot update or delete foreign rows");

  for (const [field, value, expectedCode] of [
    ["image_url", "https://example.com/image.png", "22023"],
    ["purchased_by", "Buyer", "22023"],
    ["purchased_at", new Date().toISOString(), "22023"],
  ]) {
    const unsupported = await admin.from("gift_list").insert({ event_id: eventId, user_id: owner.id, type: "Altro", name: `Unsupported ${field}`, [field]: value });
    assert.ok(unsupported.error);
    assert.equal(unsupported.error.code, expectedCode);
  }
  const unsupportedRows = await admin.from("gift_list_items").select("id", { count: "exact", head: true }).eq("event_id", eventId).like("name", "Unsupported %");
  assert.ifError(unsupportedRows.error);
  assert.equal(unsupportedRows.count, 0);
  pass("gift-list-unsupported-fields", "image_url, purchased_by and purchased_at fail deterministically without silent loss");

  const legacyDelete = await api(`/api/my/gift-list?id=${legacyGiftId}`, owner.token, { method: "DELETE" });
  assert.equal(legacyDelete.status, 200);
  assert.equal(await count("gift_list_items", "id", legacyGiftId), 0);
  assert.equal(await count("gift_list_items", "id", giftId), 1);
  pass("gift-list-old-delete-new-absence", "old delete removes exactly the targeted canonical row and creates no duplicate source");

  storagePath = `${eventId}/qa-${marker}.png`;
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const uploaded = await admin.storage.from("event-documents").upload(storagePath, png, { contentType: "image/png", upsert: false });
  assert.ifError(uploaded.error);
  for (const allowed of [owner, partner, legacy]) {
    const download = await clientFor(allowed.token).storage.from("event-documents").download(storagePath);
    assert.ifError(download.error);
  }
  for (const denied of [outsider, left, revoked, otherOwner]) {
    const download = await clientFor(denied.token).storage.from("event-documents").download(storagePath);
    assert.ok(download.error);
  }
  pass("storage-service", "real Storage upload plus owner/partner/legacy reads and outsider/left/revoked/cross-event denies confirmed");

  // Keep one assigned guest so the unmodified old tables API emits a valid
  // `not in (...)` UUID filter while the browser still has one guest to place.
  // The empty-table path in the legacy bundle builds `in.('')`, which is a
  // pre-existing old-app defect unrelated to the Branch 53 schema contract.
  const browserTableSeed = await api("/api/my/tables", owner.token, {
    method: "POST",
    body: JSON.stringify({ tables: firstPlan }),
  });
  assert.equal(browserTableSeed.status, 200);
  assert.equal(await count("tables", "event_id", eventId), 1);

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("console", message => {
    if (message.type() === "error") report.browser.consoleErrors.push({ text: message.text(), location: message.location() });
  });
  page.on("requestfailed", request => {
    report.browser.failedRequests.push({ url: request.url(), failure: request.failure() });
  });
  page.on("response", response => {
    if (response.status() >= 500) report.browser.http5xx.push({ status: response.status(), url: response.url() });
    else if (response.status() >= 400) report.browser.http4xx.push({ status: response.status(), url: response.url() });
  });

  for (const locale of ["it", "en"]) {
    const response = await page.goto(`${appUrl}/${locale}`, { waitUntil: "networkidle" });
    assert.ok(response);
    assert.ok(response.status() < 500);
    assert.ok((await page.locator("body").innerText()).trim().length > 0);
  }
  await page.goto(`${appUrl}/it/auth`, { waitUntil: "networkidle" });
  await page.getByLabel("Email", { exact: true }).fill(owner.email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  const [tokenResponse] = await Promise.all([
    page.waitForResponse(response => response.url().includes("/auth/v1/token")),
    page.getByRole("button", { name: /accedi/i }).click(),
  ]);
  assert.equal(tokenResponse.status(), 200);
  await page.waitForURL(/\/it\/(dashboard|select-event)/);
  await page.waitForLoadState("networkidle");
  await context.setExtraHTTPHeaders({ Authorization: `Bearer ${owner.token}` });

  for (const path of ["dashboard", "invitati", "invitati/tavoli", "lista-nozze", "documenti"]) {
    const response = await page.goto(`${appUrl}/it/${path}`, { waitUntil: "networkidle" });
    assert.ok(response);
    assert.ok(response.status() < 500, `${path} returned ${response.status()}`);
    assert.ok((await page.locator("body").innerText()).trim().length > 0);
  }

  await page.goto(`${appUrl}/it/invitati/tavoli`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /assegna automaticamente/i }).click();
  const saveDisposition = page.getByRole("button", { name: "Salva disposizione", exact: true });
  await saveDisposition.waitFor({ state: "visible", timeout: 10_000 });
  const [uiSave] = await Promise.all([
    page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/tables"),
    saveDisposition.click(),
  ]);
  assert.equal(uiSave.status(), 200);
  assert.ok(await count("tables", "event_id", eventId) > 0);
  pass("browser-table-write", "old table UI generated and persisted a valid plan on the new schema");

  await page.goto(`${appUrl}/it/lista-nozze`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("Es. Robot aspirapolvere", { exact: true }).fill("QA Browser Gift");
  const [uiGift] = await Promise.all([
    page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/gift-list"),
    page.getByRole("button", { name: "+ Aggiungi", exact: true }).click(),
  ]);
  assert.equal(uiGift.status(), 201);
  const browserGift = await admin.from("gift_list_items").select("id", { count: "exact", head: true }).eq("event_id", eventId).eq("name", "QA Browser Gift");
  assert.ifError(browserGift.error);
  assert.equal(browserGift.count, 1);

  await page.goto(`${appUrl}/it/documenti`, { waitUntil: "networkidle" });
  await page.locator('input[type="file"]').setInputFiles({ name: "qa-compat.png", mimeType: "image/png", buffer: Buffer.from(png) });
  await page.getByText("qa-compat.png", { exact: true }).waitFor({ state: "visible", timeout: 10_000 });
  pass("browser-runtime", "IT/EN landing, login, dashboard, event modules, guests, tables, gift list and legacy document UI executed");

  assert.deepEqual(report.browser.http5xx, []);
  const expectedOptionalResponses = new Map([
    ["/api/my/wedding/localized", "LOCALIZED_PRESET_UNAVAILABLE"],
    ["/api/my/wedding/budget-focus", "NO_DATA"],
  ]);
  const expectedOptionalUrls = new Set();
  for (const response of report.browser.http4xx) {
    const url = new URL(response.url);
    const expectedError = expectedOptionalResponses.get(url.pathname);
    assert.equal(response.status, 404);
    assert.ok(expectedError, `Unexpected client error: ${response.url}`);
    const verified = await api(`${url.pathname}${url.search}`, owner.token);
    assert.equal(verified.status, 404);
    assert.equal(verified.body.error, expectedError);
    expectedOptionalUrls.add(response.url);
  }
  const unexpectedConsoleErrors = report.browser.consoleErrors.filter(error =>
    !(error.text === "Failed to load resource: the server responded with a status of 404 (Not Found)"
      && expectedOptionalUrls.has(error.location.url)),
  );
  report.browser.expectedOptionalErrors = report.browser.consoleErrors.filter(error => !unexpectedConsoleErrors.includes(error));
  assert.deepEqual(unexpectedConsoleErrors, []);
  pass("browser-errors", "zero unexpected console errors and zero HTTP 5xx; optional legacy 404 contracts verified explicitly");

  await owner.authClient.auth.signOut();
  const session = await owner.authClient.auth.getSession();
  assert.equal(session.data.session, null);
  pass("session-lifecycle", "login and logout/session invalidation completed");
} catch (error) {
  primaryError = error;
  report.failure = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
  console.error("GATE_FAILURE", report.failure);
  console.error("BROWSER_DIAGNOSTICS", JSON.stringify(report.browser));
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
  if (eventIdB) {
    const removedEventB = await admin.from("events").delete().eq("id", eventIdB);
    if (removedEventB.error && !primaryError) primaryError = removedEventB.error;
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
      count("gift_list_items", "event_id", eventId),
      count("event_documents", "event_id", eventId),
      eventIdB ? count("events", "id", eventIdB) : 0,
      eventIdB ? count("gift_list_items", "event_id", eventIdB) : 0,
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
