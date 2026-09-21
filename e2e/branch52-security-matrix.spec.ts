import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import {
  createQaIdentity,
  currentEvent,
  deleteQaIdentity,
  login,
  milestone8FixtureReady,
  type QaIdentity,
} from "./helpers/milestone8-fixtures";

const supabaseUrl = process.env.PLAYWRIGHT_SUPABASE_URL;
const anonKey = process.env.PLAYWRIGHT_SUPABASE_ANON_KEY;
const serviceRole = process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY;

type ApiResult<T = Record<string, unknown>> = { status: number; body: T };

async function browserApi<T = Record<string, unknown>>(page: Page, path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  return page.evaluate(async ({ path, init }) => {
    let token = "";
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const value = JSON.parse(localStorage.getItem(key) || "null") as { access_token?: string } | null;
      if (value?.access_token) token = value.access_token;
    }
    const response = await fetch(path, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    return { status: response.status, body: await response.json() };
  }, { path, init });
}

async function accessToken(page: Page) {
  return page.evaluate(() => {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const value = JSON.parse(localStorage.getItem(key) || "null") as { access_token?: string } | null;
      if (value?.access_token) return value.access_token;
    }
    return "";
  });
}

async function loginAs(page: Page, identity: QaIdentity) {
  await page.goto("/it");
  await page.evaluate(() => localStorage.clear());
  await page.context().clearCookies();
  await login(page, identity);
}

test("[M6][security-matrix] real authorization, IDOR, snapshot, favorites, retry and Data API", async ({ page }, testInfo) => {
  expect(testInfo.project.name).toBe("m8-390");
  expect(milestone8FixtureReady && supabaseUrl && anonKey && serviceRole).toBeTruthy();
  test.setTimeout(240_000);

  const identities: QaIdentity[] = [];
  let owner!: QaIdentity;
  let partner!: QaIdentity;
  let revoked!: QaIdentity;
  let left!: QaIdentity;
  let stranger!: QaIdentity;
  let noEvent!: QaIdentity;
  const db = createClient(supabaseUrl!, serviceRole!, { auth: { persistSession: false, autoRefreshToken: false } });
  const eventId = randomUUID();
  const otherEventId = randomUUID();
  const supplierId = randomUUID();
  const otherSupplierId = randomUUID();
  const otherSavedSupplierId = randomUUID();

  try {
    owner = await createQaIdentity("m6-owner"); identities.push(owner);
    partner = await createQaIdentity("m6-partner"); identities.push(partner);
    revoked = await createQaIdentity("m6-revoked"); identities.push(revoked);
    left = await createQaIdentity("m6-left"); identities.push(left);
    stranger = await createQaIdentity("m6-stranger"); identities.push(stranger);
    noEvent = await createQaIdentity("m6-no-event"); identities.push(noEvent);
    const originalSupplierName = `QA-M6 Supplier ${owner.marker.slice(-12)}`;

    const events = await db.from("events").insert([
      { id: eventId, owner_id: owner.id, name: `QA-M8-M6-OWNER-${owner.marker}`, event_type: "wedding", language: "it", country: "IT" },
      { id: otherEventId, owner_id: stranger.id, name: `QA-M8-M6-OTHER-${stranger.marker}`, event_type: "wedding", language: "it", country: "IT" },
    ]);
    expect(events.error).toBeNull();
    const memberships = await db.from("event_members").upsert([
      { event_id: eventId, user_id: owner.id, role: "owner", status: "active" },
      { event_id: eventId, user_id: partner.id, role: "partner", status: "active" },
      { event_id: eventId, user_id: revoked.id, role: "partner", status: "revoked" },
      { event_id: eventId, user_id: left.id, role: "partner", status: "left" },
      { event_id: otherEventId, user_id: stranger.id, role: "owner", status: "active" },
    ], { onConflict: "event_id,user_id" });
    expect(memberships.error).toBeNull();
    const suppliers = await db.from("suppliers").insert([
      { id: supplierId, name: originalSupplierName, category: "catering", city: "Roma", province: "RM", region: "Lazio", country_code: "it", source: "admin_import", external_id: `qa-m6-${supplierId}` },
      { id: otherSupplierId, name: `QA-M6 Other ${stranger.marker.slice(-12)}`, category: "music", city: "Milano", province: "MI", region: "Lombardia", country_code: "it", source: "admin_import", external_id: `qa-m6-${otherSupplierId}` },
    ]);
    expect(suppliers.error).toBeNull();
    const otherSaved = await db.from("saved_suppliers").insert({ id: otherSavedSupplierId, event_id: otherEventId, supplier_id: otherSupplierId });
    expect(otherSaved.error).toBeNull();

    await loginAs(page, owner);
    const ownerContext = await currentEvent(page);
    expect(ownerContext.body.status).toBe("RESOLVED");
    expect(ownerContext.body.currentEvent.eventId).toBe(eventId);
    expect(ownerContext.body.currentEvent.accessRole).toBe("owner");

    await page.context().addCookies([{ name: "app-current-event", value: otherEventId, url: new URL(page.url()).origin, httpOnly: true, sameSite: "Lax" }]);
    const tamperedContext = await currentEvent(page);
    expect(tamperedContext.body.currentEvent.eventId).toBe(eventId);
    expect(tamperedContext.body.staleSelection).toBe(true);

    const [saveA, saveB] = await Promise.all([
      browserApi<{ savedSupplier: { id: string; catalog_snapshot: { name: string }; catalog_snapshot_fingerprint: string }; idempotent: boolean }>(page, "/api/my/suppliers", { method: "POST", body: JSON.stringify({ supplier_id: supplierId }) }),
      browserApi<{ savedSupplier: { id: string; catalog_snapshot: { name: string }; catalog_snapshot_fingerprint: string }; idempotent: boolean }>(page, "/api/my/suppliers", { method: "POST", body: JSON.stringify({ supplier_id: supplierId }) }),
    ]);
    expect([saveA.status, saveB.status].sort()).toEqual([200, 201]);
    const savedSupplier = saveA.body.savedSupplier || saveB.body.savedSupplier;
    expect(savedSupplier.catalog_snapshot.name).toBe(originalSupplierName);
    expect(savedSupplier.catalog_snapshot_fingerprint).toMatch(/^[a-f0-9]{64}$/);

    expect((await db.from("suppliers").update({ name: `${originalSupplierName} MUTATED` }).eq("id", supplierId)).error).toBeNull();
    const immutableSnapshot = await browserApi<{ savedSupplier: { resolved_record: { name: string } } }>(page, `/api/my/suppliers?resource_id=${savedSupplier.id}`);
    expect(immutableSnapshot.status).toBe(200);
    expect(immutableSnapshot.body.savedSupplier.resolved_record.name).toBe(originalSupplierName);

    const override = await browserApi<{ savedSupplier: { resolved_record: { name: string }; favorite: boolean } }>(page, "/api/my/suppliers", {
      method: "PATCH",
      body: JSON.stringify({ resource_id: savedSupplier.id, favorite: true, private_overrides: { name: "QA-M6 Private override" } }),
    });
    expect(override.status).toBe(200);
    expect(override.body.savedSupplier.resolved_record.name).toBe("QA-M6 Private override");
    expect(override.body.savedSupplier.favorite).toBe(true);

    const privateClientKey = randomUUID();
    const privatePayload = { entity_type: "supplier", client_key: privateClientKey, record: { name: "QA-M6 Private-only supplier", category: "flowers" } };
    const [privateA, privateB] = await Promise.all([
      browserApi<{ record: { id: string }; idempotent: boolean }>(page, "/api/my/private-catalog", { method: "POST", body: JSON.stringify(privatePayload) }),
      browserApi<{ record: { id: string }; idempotent: boolean }>(page, "/api/my/private-catalog", { method: "POST", body: JSON.stringify(privatePayload) }),
    ]);
    expect([privateA.status, privateB.status].sort()).toEqual([200, 201]);
    const privateId = privateA.body.record.id;
    expect(privateB.body.record.id).toBe(privateId);
    expect((await browserApi(page, "/api/my/private-catalog", { method: "PATCH", body: JSON.stringify({ resource_id: privateId, override: { phone: "+39 0123456789" } }) })).status).toBe(200);

    const favoritePayload = { item_type: "supplier", item_id: supplierId, notes: "QA-M6", rating: 5 };
    const [favoriteA, favoriteB] = await Promise.all([
      browserApi<{ favorite: { id: string }; idempotent: boolean }>(page, "/api/my/favorites", { method: "POST", body: JSON.stringify(favoritePayload) }),
      browserApi<{ favorite: { id: string }; idempotent: boolean }>(page, "/api/my/favorites", { method: "POST", body: JSON.stringify(favoritePayload) }),
    ]);
    expect([favoriteA.status, favoriteB.status].sort()).toEqual([200, 201]);
    expect(favoriteA.body.favorite.id).toBe(favoriteB.body.favorite.id);

    expect((await browserApi(page, "/api/my/private-catalog", { method: "POST", body: JSON.stringify({ ...privatePayload, client_key: randomUUID(), event_id: otherEventId, owner_id: stranger.id }) })).status).toBe(400);
    expect((await browserApi(page, "/api/my/private-catalog?resource_id=not-a-uuid")).status).toBe(400);
    expect((await browserApi(page, `/api/my/private-catalog?resource_id=${randomUUID()}`)).status).toBe(404);
    expect((await browserApi(page, `/api/my/suppliers?resource_id=${otherSavedSupplierId}`)).status).toBe(404);

    const ownerToken = await accessToken(page);
    const restHeaders = { apikey: anonKey!, Authorization: `Bearer ${ownerToken}`, "Content-Type": "application/json" };
    const anonymousGlobal = await fetch(`${supabaseUrl}/rest/v1/suppliers?id=eq.${supplierId}&select=id`, { headers: { apikey: anonKey! } });
    expect(anonymousGlobal.status).toBe(200);
    const anonymousWrite = await fetch(`${supabaseUrl}/rest/v1/suppliers?id=eq.${supplierId}`, { method: "PATCH", headers: { apikey: anonKey!, "Content-Type": "application/json" }, body: JSON.stringify({ name: "FORBIDDEN" }) });
    expect([401, 403]).toContain(anonymousWrite.status);
    const authenticatedWrite = await fetch(`${supabaseUrl}/rest/v1/suppliers?id=eq.${supplierId}`, { method: "PATCH", headers: restHeaders, body: JSON.stringify({ name: "FORBIDDEN" }) });
    expect([401, 403]).toContain(authenticatedWrite.status);
    const ownerPrivateRead = await fetch(`${supabaseUrl}/rest/v1/event_private_catalog_records?id=eq.${privateId}&select=id`, { headers: restHeaders });
    expect(ownerPrivateRead.status).toBe(200);
    expect(await ownerPrivateRead.json()).toEqual([{ id: privateId }]);

    await loginAs(page, partner);
    const partnerContext = await currentEvent(page);
    expect(partnerContext.body.currentEvent.accessRole).toBe("partner");
    expect((await browserApi(page, `/api/my/private-catalog?resource_id=${privateId}`)).status).toBe(200);

    for (const identity of [revoked, left]) {
      await loginAs(page, identity);
      expect((await currentEvent(page)).body.status).toBe("NO_EVENT");
      expect((await browserApi(page, `/api/my/private-catalog?resource_id=${privateId}`)).status).toBe(404);
    }

    await loginAs(page, stranger);
    expect((await currentEvent(page)).body.currentEvent.eventId).toBe(otherEventId);
    expect((await browserApi(page, `/api/my/private-catalog?resource_id=${privateId}`)).status).toBe(404);
    expect((await browserApi(page, `/api/my/private-catalog?resource_id=${randomUUID()}`)).status).toBe(404);

    await loginAs(page, noEvent);
    expect((await currentEvent(page)).body.status).toBe("NO_EVENT");
    expect((await browserApi(page, "/api/my/favorites")).status).toBe(200);
    expect((await browserApi(page, "/api/my/private-catalog")).status).toBe(404);

    await page.goto("/it");
    await page.evaluate(() => localStorage.clear());
    await page.context().clearCookies();
    expect((await page.request.get("/api/my/private-catalog")).status()).toBe(401);
  } finally {
    await db.from("user_favorites").delete().in("user_id", identities.map(identity => identity.id));
    await db.from("events").delete().in("id", [eventId, otherEventId]);
    await db.from("suppliers").delete().in("id", [supplierId, otherSupplierId]);
    for (const identity of identities.reverse()) await deleteQaIdentity(identity);
  }
});
