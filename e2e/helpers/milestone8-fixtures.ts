import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

const url = process.env.PLAYWRIGHT_SUPABASE_URL;
const serviceRole = process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY;
const emailDomain = process.env.PLAYWRIGHT_QA_EMAIL_DOMAIN;

export const milestone8FixtureReady = Boolean(url && serviceRole && emailDomain);

export type QaIdentity = { id: string; email: string; password: string; marker: string };
export type LocationSupplierFixture = {
  eventId: string;
  locationId: string;
  supplierId: string;
  savedLocationId: string;
  savedSupplierId: string;
  privateLocationId: string;
  privateSupplierId: string;
  locationName: string;
  supplierName: string;
  privateSupplierName: string;
};

function admin(): SupabaseClient {
  if (!url || !serviceRole) throw new Error("Milestone 8 fixture administration is unavailable.");
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function createQaIdentity(label: string): Promise<QaIdentity> {
  if (!emailDomain) throw new Error("PLAYWRIGHT_QA_EMAIL_DOMAIN is required.");
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const marker = `qa-m8-${label}-${nonce}`;
  const email = `${marker}@${emailDomain}`;
  const password = `M8-${nonce}-Initial!9`;
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { qa_marker: marker, qa_scope: "branch-48-milestone-8" },
  });
  if (error || !data.user) throw new Error(`QA identity creation failed: ${error?.name || "UNKNOWN"}`);
  return { id: data.user.id, email, password, marker };
}

export async function deleteQaIdentity(identity: QaIdentity) {
  const client = admin();
  const { data, error } = await client.auth.admin.getUserById(identity.id);
  if (error || data.user?.user_metadata?.qa_marker !== identity.marker) {
    throw new Error("Refusing QA cleanup because the identity marker does not match.");
  }
  const { data: owned, error: ownedError } = await client.from("events").select("id,name,owner_id").eq("owner_id", identity.id);
  if (ownedError) throw new Error("QA event ownership verification failed.");
  if ((owned || []).some(event => event.owner_id !== identity.id || !String(event.name || "").startsWith("QA-M8-"))) {
    throw new Error("Refusing QA cleanup because an owned event lacks the Milestone 8 marker.");
  }
  for (const event of owned || []) {
    const removed = await client.from("events").delete().eq("id", event.id).eq("owner_id", identity.id).select("id").single();
    if (removed.error || removed.data?.id !== event.id) throw new Error("QA event cleanup failed.");
  }
  const result = await client.auth.admin.deleteUser(identity.id);
  if (result.error) throw new Error(`QA identity cleanup failed: ${result.error.name}`);
}

export async function createLocationSupplierFixture(identity: QaIdentity): Promise<LocationSupplierFixture> {
  const client = admin();
  const suffix = identity.marker.slice(-18);
  const fixture: LocationSupplierFixture = {
    eventId: randomUUID(),
    locationId: randomUUID(),
    supplierId: randomUUID(),
    savedLocationId: randomUUID(),
    savedSupplierId: randomUUID(),
    privateLocationId: randomUUID(),
    privateSupplierId: randomUUID(),
    locationName: `QA-M3 Location ${suffix}`,
    supplierName: `QA-M3 Supplier ${suffix}`,
    privateSupplierName: `QA-M3 Private Supplier ${suffix}`,
  };
  const event = await client.from("events").insert({
    id: fixture.eventId,
    owner_id: identity.id,
    name: `QA-M8-M3-${identity.marker}`,
    event_type: "wedding",
    language: "it",
    country: "IT",
  }).select("id,owner_id,name").single();
  if (event.error || event.data?.owner_id !== identity.id) throw new Error("M3 QA event creation failed.");
  const membership = await client.from("event_members").upsert({
    event_id: fixture.eventId,
    user_id: identity.id,
    role: "owner",
    status: "active",
  }, { onConflict: "event_id,user_id" });
  if (membership.error) throw new Error("M3 QA owner membership creation failed.");
  const location = await client.from("locations").insert({
    id: fixture.locationId,
    name: fixture.locationName,
    region: "Lazio",
    province: "RM",
    city: "Roma",
    country_code: "it",
    location_type: "villa",
    source: "admin_import",
    external_id: `qa-m3-location-${fixture.locationId}`,
    verification_status: "VERIFIED",
    confidence_score: 100,
  });
  if (location.error) throw new Error(`M3 QA location creation failed: ${location.error.code || "UNKNOWN"}`);
  const supplier = await client.from("suppliers").insert({
    id: fixture.supplierId,
    name: fixture.supplierName,
    region: "Lazio",
    province: "RM",
    city: "Roma",
    country_code: "it",
    category: "catering",
    source: "admin_import",
    external_id: `qa-m3-supplier-${fixture.supplierId}`,
    verification_status: "VERIFIED",
    confidence_score: 100,
  });
  if (supplier.error) throw new Error(`M3 QA supplier creation failed: ${supplier.error.code || "UNKNOWN"}`);
  const globalLink = await client.from("supplier_locations").insert({
    supplier_id: fixture.supplierId,
    location_id: fixture.locationId,
    relationship_type: "works_at",
    source: "branch52_playwright",
  });
  if (globalLink.error) throw new Error("M3 QA curated association creation failed.");
  const savedLocation = await client.from("saved_locations").insert({
    id: fixture.savedLocationId,
    event_id: fixture.eventId,
    location_id: fixture.locationId,
    location_role: "reception",
  });
  const savedSupplier = await client.from("saved_suppliers").insert({
    id: fixture.savedSupplierId,
    event_id: fixture.eventId,
    supplier_id: fixture.supplierId,
  });
  if (savedLocation.error || savedSupplier.error) throw new Error("M3 QA saved catalog fixture creation failed.");
  const privateRows = await client.from("event_private_catalog_records").insert([
    {
      id: fixture.privateLocationId,
      event_id: fixture.eventId,
      entity_type: "location",
      client_key: randomUUID(),
      snapshot_data: { name: `QA-M3 Private Location ${suffix}` },
      snapshot_fingerprint: "0".repeat(64),
      created_by: identity.id,
    },
    {
      id: fixture.privateSupplierId,
      event_id: fixture.eventId,
      entity_type: "supplier",
      client_key: randomUUID(),
      snapshot_data: { name: fixture.privateSupplierName },
      snapshot_fingerprint: "0".repeat(64),
      created_by: identity.id,
    },
  ]);
  if (privateRows.error) throw new Error("M3 QA private catalog fixture creation failed.");
  return fixture;
}

export async function deleteLocationSupplierFixture(fixture: LocationSupplierFixture) {
  const client = admin();
  const deletions = [
    await client.from("event_location_supplier_links").delete().eq("event_id", fixture.eventId),
    await client.from("saved_locations").delete().eq("id", fixture.savedLocationId).eq("event_id", fixture.eventId),
    await client.from("saved_suppliers").delete().eq("id", fixture.savedSupplierId).eq("event_id", fixture.eventId),
    await client.from("event_private_catalog_records").delete().eq("event_id", fixture.eventId),
    await client.from("supplier_locations").delete().eq("supplier_id", fixture.supplierId).eq("location_id", fixture.locationId),
    await client.from("suppliers").delete().eq("id", fixture.supplierId),
    await client.from("locations").delete().eq("id", fixture.locationId),
  ];
  if (deletions.some(item => item.error)) throw new Error("M3 QA fixture cleanup failed.");
  const [links, savedLocations, savedSuppliers, privateRows, globalLinks, suppliers, locations] = await Promise.all([
    client.from("event_location_supplier_links").select("id", { count: "exact", head: true }).eq("event_id", fixture.eventId),
    client.from("saved_locations").select("id", { count: "exact", head: true }).eq("id", fixture.savedLocationId),
    client.from("saved_suppliers").select("id", { count: "exact", head: true }).eq("id", fixture.savedSupplierId),
    client.from("event_private_catalog_records").select("id", { count: "exact", head: true }).eq("event_id", fixture.eventId),
    client.from("supplier_locations").select("supplier_id", { count: "exact", head: true }).eq("supplier_id", fixture.supplierId),
    client.from("suppliers").select("id", { count: "exact", head: true }).eq("id", fixture.supplierId),
    client.from("locations").select("id", { count: "exact", head: true }).eq("id", fixture.locationId),
  ]);
  const residue = [links, savedLocations, savedSuppliers, privateRows, globalLinks, suppliers, locations]
    .reduce((total, result) => total + (result.count ?? 0), 0);
  if (residue !== 0) throw new Error(`M3 QA fixture residue count is ${residue}.`);
}

export async function login(page: Page, identity: Pick<QaIdentity, "email" | "password">) {
  await page.goto("/it/auth");
  const main = page.locator("main");
  await main.getByLabel("Email", { exact: true }).fill(identity.email);
  await main.getByLabel("Password", { exact: true }).fill(identity.password);
  const tokenResponse = page.waitForResponse(response =>
    response.request().method() === "POST"
    && new URL(response.url()).pathname.endsWith("/auth/v1/token")
  );
  await main.getByRole("button", { name: /accedi/i }).click();
  expect((await tokenResponse).status()).toBe(200);
  await page.waitForURL(/\/it\/(select-language|select-country|select-event|dashboard)/);
}

export async function renameCurrentEvent(identity: QaIdentity, eventId: string, name: string) {
  expect(name.startsWith("QA-M8-")).toBe(true);
  const { data, error } = await admin().from("events").update({ name }).eq("id", eventId).eq("owner_id", identity.id).select("id,name,owner_id").single();
  if (error || data?.id !== eventId || data.owner_id !== identity.id || data.name !== name) throw new Error("QA event marker update failed.");
}

export async function seedDeletionDependency(identity: QaIdentity, eventId: string) {
  const client = admin();
  const event = await client.from("events").select("id,owner_id,name").eq("id", eventId).single();
  if (event.error || event.data.owner_id !== identity.id || !String(event.data.name).startsWith("QA-M8-")) throw new Error("Refusing dependency seed.");
  const inserted = await client.from("budget_items").insert({ event_id: eventId, name: "QA-M8-DEPENDENCY-" + identity.marker, amount: 123, country_code: "IT" }).select("id").single();
  if (inserted.error || !inserted.data) throw new Error("QA dependency creation failed.");
  return inserted.data.id;
}

export async function verifyDeletedCascade(eventId: string, dependencyId: string) {
  const client = admin();
  const [event, dependency] = await Promise.all([
    client.from("events").select("id").eq("id", eventId).maybeSingle(),
    client.from("budget_items").select("id").eq("id", dependencyId).maybeSingle(),
  ]);
  if (event.error || dependency.error || event.data || dependency.data) throw new Error("Event cascade verification failed.");
}

export async function apiDeleteAttempt(page: Page, eventId: string, confirmationName: string) {
  return page.evaluate(async ({ eventId, confirmationName }) => {
    let token = "";
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const value = JSON.parse(localStorage.getItem(key) || "null") as { access_token?: string } | null;
      if (value?.access_token) token = value.access_token;
    }
    const response = await fetch("/api/event/delete", {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, confirmationName }),
    });
    return { status: response.status, body: await response.json() };
  }, { eventId, confirmationName });
}

export async function currentEvent(page: Page) {
  return page.evaluate(async () => {
    let token = "";
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const value = JSON.parse(localStorage.getItem(key) || "null") as { access_token?: string } | null;
      if (value?.access_token) token = value.access_token;
    }
    const response = await fetch("/api/my/current-event", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    return { status: response.status, body: await response.json() };
  });
}
