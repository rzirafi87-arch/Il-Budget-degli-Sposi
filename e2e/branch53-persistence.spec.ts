import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import {
  createQaIdentity,
  deleteQaIdentity,
  login,
  milestone8FixtureReady,
  type QaIdentity,
} from "./helpers/milestone8-fixtures";

const supabaseUrl = process.env.PLAYWRIGHT_SUPABASE_URL;
const serviceRole = process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY;

type ApiResult<T> = { status: number; body: T };

async function loginAs(page: Page, identity: QaIdentity) {
  await page.goto("/it");
  await page.evaluate(() => localStorage.clear());
  await page.context().clearCookies();
  await login(page, identity);
}

async function browserApi<T>(page: Page, path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
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
      headers: { Authorization: `Bearer ${token}`, ...init.headers },
    });
    return { status: response.status, body: await response.json() };
  }, { path, init });
}

async function browserSessionUserId(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const value = JSON.parse(localStorage.getItem(key) || "null") as { user?: { id?: string } } | null;
      if (value?.user?.id) return value.user.id;
    }
    return null;
  });
}

test("[B53][persistence-mobile] documents, gifts and tables persist for owner and partner", async ({ page }, testInfo) => {
  expect(testInfo.project.name).toBe("m8-390");
  expect(milestone8FixtureReady && supabaseUrl && serviceRole).toBeTruthy();
  test.setTimeout(240_000);

  const db = createClient(supabaseUrl!, serviceRole!, { auth: { persistSession: false, autoRefreshToken: false } });
  const identities: QaIdentity[] = [];
  const eventId = randomUUID();
  const guestAId = randomUUID();
  const guestBId = randomUUID();
  const documentName = `qa-b53-${Date.now()}.pdf`;
  const giftName = `Viaggio QA ${Date.now()}`;
  const updatedGiftName = `${giftName} partner`;
  const tableName = `Tavolo QA ${Date.now()}`;
  const guestAName = `Invitato QA A ${Date.now()}`;
  const guestBName = `Invitato QA B ${Date.now()}`;

  try {
    const owner = await createQaIdentity("b53-owner"); identities.push(owner);
    const partner = await createQaIdentity("b53-partner"); identities.push(partner);
    const event = await db.from("events").insert({
      id: eventId,
      owner_id: owner.id,
      name: `QA-M8-B53-${owner.marker}`,
      event_type: "wedding",
      language: "it",
      country: "IT",
    });
    expect(event.error).toBeNull();
    const members = await db.from("event_members").upsert([
      { event_id: eventId, user_id: owner.id, role: "owner", status: "active" },
      { event_id: eventId, user_id: partner.id, role: "partner", status: "active" },
    ], { onConflict: "event_id,user_id" });
    expect(members.error).toBeNull();
    const guests = await db.from("guests").insert([
      { id: guestAId, event_id: eventId, name: guestAName, guest_type: "common", attending: true },
      { id: guestBId, event_id: eventId, name: guestBName, guest_type: "common", attending: true },
    ]);
    expect(guests.error).toBeNull();

    await loginAs(page, owner);

    await page.goto("/it/dashboard?runtime=i18n#overview");
    await expect(page.locator("html")).toHaveAttribute("lang", "it");
    await expect(page.locator("html")).toHaveAttribute("data-runtime-locale", "it");
    await expect(page.getByText("Budget, attività e prossimi passi: tutto ciò che serve per organizzare con serenità.", { exact: true })).toBeVisible();
    expect(await browserSessionUserId(page)).toBe(owner.id);
    const eventBeforeSwitch = await browserApi<{ event: { id: string } }>(page, "/api/event/resolve");
    expect(eventBeforeSwitch.status).toBe(200);
    expect(eventBeforeSwitch.body.event.id).toBe(eventId);

    const settings = page.locator('[aria-controls="quick-settings-dialog"]:visible');
    await settings.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await Promise.all([
      page.waitForURL(url => url.pathname === "/en/dashboard" && url.search === "?runtime=i18n" && url.hash === "#overview"),
      page.locator("#quick-settings-language").selectOption("en"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("data-runtime-locale", "en");
    await expect(page.getByText("Budget, tasks and next steps: everything you need to plan with confidence.", { exact: true })).toBeVisible();
    expect(await browserSessionUserId(page)).toBe(owner.id);
    await page.reload();
    await expect(page).toHaveURL(/\/en\/dashboard\?runtime=i18n#overview$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.getByRole("button", { name: "Dashboard", exact: true }).click();
    await page.getByRole("link", { name: "Documents", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/documenti$/);
    await expect(page.getByRole("heading", { name: "Documents and quotes", exact: true })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/en\/dashboard\?runtime=i18n#overview$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/en\/documenti$/);

    const documentTitles = {
      it: "Documenti e preventivi",
      en: "Documents and quotes",
      es: "Documentos y presupuestos",
      fr: "Documents et devis",
      de: "Dokumente und Angebote",
    } as const;
    for (const [runtimeLocale, title] of Object.entries(documentTitles)) {
      await page.goto(`/${runtimeLocale}/documenti`);
      await expect(page.locator("html")).toHaveAttribute("lang", runtimeLocale);
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
      expect(await browserSessionUserId(page)).toBe(owner.id);
    }
    const eventAfterSwitch = await browserApi<{ event: { id: string } }>(page, "/api/event/resolve");
    expect(eventAfterSwitch.status).toBe(200);
    expect(eventAfterSwitch.body.event.id).toBe(eventId);

    await page.goto("/it/documenti");
    const upload = page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/documents");
    await page.locator('input[type="file"]').setInputFiles({ name: documentName, mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\nQA Branch 53") });
    const uploadResponse = await upload;
    expect(uploadResponse.status()).toBe(201);
    const uploaded = await uploadResponse.json() as { document: { id: string } };
    await expect(page.getByText(documentName, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText(documentName, { exact: true })).toBeVisible();
    const download = await browserApi<{ url: string }>(page, `/api/my/documents/${uploaded.document.id}/download`);
    expect(download.status).toBe(200);
    expect((await page.request.get(download.body.url)).status()).toBe(200);
    page.once("dialog", dialog => dialog.accept());
    const documentDelete = page.waitForResponse(response => response.request().method() === "DELETE" && new URL(response.url()).pathname === `/api/my/documents/${uploaded.document.id}`);
    await page.getByRole("button", { name: `Elimina ${documentName}` }).click();
    expect((await documentDelete).status()).toBe(200);
    await expect(page.getByText(documentName, { exact: true })).toHaveCount(0);

    await page.goto("/it/lista-nozze");
    await page.getByLabel("Nome", { exact: true }).fill(giftName);
    await page.getByLabel("Prezzo stimato (€)", { exact: true }).fill("500");
    const giftCreate = page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/gift-list");
    await page.getByRole("button", { name: "+ Aggiungi", exact: true }).click();
    const giftCreateResponse = await giftCreate;
    expect(giftCreateResponse.status()).toBe(201);
    const createdGift = await giftCreateResponse.json() as { item: { id: string } };
    await page.reload();
    await expect(page.getByTestId(`gift-item-${createdGift.item.id}`)).toContainText(giftName);

    await loginAs(page, partner);
    await page.goto("/it/lista-nozze");
    const giftCard = page.getByTestId(`gift-item-${createdGift.item.id}`);
    await expect(giftCard).toContainText(giftName);
    await giftCard.getByRole("button", { name: "Modifica", exact: true }).click();
    await page.getByLabel("Nome", { exact: true }).fill(updatedGiftName);
    const giftUpdate = page.waitForResponse(response => response.request().method() === "PUT" && new URL(response.url()).pathname === "/api/my/gift-list");
    await page.getByRole("button", { name: "Salva modifiche", exact: true }).click();
    expect((await giftUpdate).status()).toBe(200);
    await page.reload();
    await expect(page.getByTestId(`gift-item-${createdGift.item.id}`)).toContainText(updatedGiftName);

    await loginAs(page, owner);
    await page.goto("/it/lista-nozze");
    await expect(page.getByTestId(`gift-item-${createdGift.item.id}`)).toContainText(updatedGiftName);
    page.once("dialog", dialog => dialog.accept());
    const giftDelete = page.waitForResponse(response => response.request().method() === "DELETE" && new URL(response.url()).pathname === "/api/my/gift-list");
    await page.getByTestId(`gift-item-${createdGift.item.id}`).getByRole("button", { name: "Elimina", exact: true }).click();
    expect((await giftDelete).status()).toBe(200);
    await page.reload();
    await expect(page.getByTestId(`gift-item-${createdGift.item.id}`)).toHaveCount(0);

    await page.goto("/it/invitati/tavoli");
    await page.getByRole("button", { name: "Aggiungi tavolo", exact: true }).click();
    const newTable = page.getByTestId("table-new-0");
    await newTable.getByLabel("Nome tavolo", { exact: true }).fill(tableName);
    await newTable.getByLabel("Capienza", { exact: true }).fill("2");
    await newTable.getByLabel("Assegna un invitato", { exact: true }).selectOption({ label: guestAName });
    const tableSave = page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/tables");
    await page.getByRole("button", { name: "Salva disposizione", exact: true }).click();
    expect((await tableSave).status()).toBe(200);
    const ownerTables = await browserApi<{ tables: Array<{ id: string; tableName: string }> }>(page, "/api/my/tables");
    expect(ownerTables.status).toBe(200);
    const persistedTable = ownerTables.body.tables.find(table => table.tableName === tableName);
    expect(persistedTable).toBeDefined();
    await page.reload();
    await expect(page.getByTestId(`table-${persistedTable!.id}`)).toContainText(guestAName);

    await loginAs(page, partner);
    await page.goto("/it/invitati/tavoli");
    const sharedTable = page.getByTestId(`table-${persistedTable!.id}`);
    await expect(sharedTable).toContainText(guestAName);
    await sharedTable.getByLabel("Assegna un invitato", { exact: true }).selectOption({ label: guestBName });
    const partnerSave = page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/tables");
    await page.getByRole("button", { name: "Salva disposizione", exact: true }).click();
    expect((await partnerSave).status()).toBe(200);
    await page.reload();
    await expect(page.getByTestId(`table-${persistedTable!.id}`)).toContainText(guestBName);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

    page.once("dialog", dialog => dialog.accept());
    const tableDelete = page.waitForResponse(response => response.request().method() === "DELETE" && new URL(response.url()).pathname === "/api/my/tables");
    await page.getByTestId(`table-${persistedTable!.id}`).getByRole("button", { name: "Elimina", exact: true }).click();
    expect((await tableDelete).status()).toBe(200);
    await page.reload();
    await expect(page.getByTestId(`table-${persistedTable!.id}`)).toHaveCount(0);
  } finally {
    const documents = await db.from("event_documents").select("object_path").eq("event_id", eventId);
    const paths = (documents.data || []).map(document => document.object_path).filter(Boolean);
    if (paths.length > 0) await db.storage.from("event-documents").remove(paths);
    await db.from("events").delete().eq("id", eventId);
    for (const identity of identities.reverse()) await deleteQaIdentity(identity);
    console.info("[B53] fixture cleanup complete; residue=0");
  }
});
