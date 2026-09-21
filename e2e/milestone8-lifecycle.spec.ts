import { expect, test, type Page } from "@playwright/test";
import {
  apiDeleteAttempt,
  createQaIdentity,
  currentEvent,
  deleteQaIdentity,
  login,
  milestone8FixtureReady,
  renameCurrentEvent,
  seedDeletionDependency,
  verifyDeletedCascade,
  type QaIdentity,
} from "./helpers/milestone8-fixtures";
import {
  emailAuditConfigured,
  resolveTransactionalEmailLink,
  transactionalEmailLinks,
  waitForTransactionalEmail,
} from "./helpers/transactional-email-audit";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;
const inbucketUrl = process.env.PLAYWRIGHT_INBUCKET_URL;

test.use({ trace: "retain-on-failure", screenshot: "only-on-failure", video: "off" });

async function clearOnboardingPreferences(page: Page) {
  await page.evaluate(() => {
    for (const key of ["language", "country", "eventType"]) {
      localStorage.removeItem(key);
      document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`;
    }
  });
}

async function finishFirstEvent(page: Page, identity: QaIdentity, name: string) {
  const empty = await currentEvent(page);
  expect(empty.status).toBe(200);
  expect(empty.body.status).toBe("NO_EVENT");
  await clearOnboardingPreferences(page);
  await page.goto("/it/select-language");
  await page.getByRole("button", { name: "Italiano", exact: true }).click({ noWaitAfter: true });
  await expect(page).toHaveURL(/\/it\/select-country/);
  await page.getByRole("button", { name: "Italia", exact: true }).click();
  await page.getByRole("button", { name: /^avanti$/i }).click({ noWaitAfter: true });
  await expect(page).toHaveURL(/\/it\/select-event-type/);
  await page.getByRole("button", { name: /^matrimonio disponibile/i }).click();
  await page.waitForURL(/\/it\/dashboard/);
  const resolved = await currentEvent(page);
  expect(resolved.status).toBe(200);
  expect(resolved.body.status).toBe("RESOLVED");
  await renameCurrentEvent(identity, resolved.body.currentEvent.eventId, name);
  await page.reload();
  return resolved.body.currentEvent.eventId as string;
}

async function createAdditionalEvent(page: Page, identity: QaIdentity, name: string) {
  await page.goto("/it/select-event-type?new=1");
  await page.getByRole("button", { name: /^matrimonio disponibile/i }).click();
  await page.waitForURL(/\/it\/dashboard/);
  const resolved = await currentEvent(page);
  await renameCurrentEvent(identity, resolved.body.currentEvent.eventId, name);
  await page.reload();
  return resolved.body.currentEvent.eventId as string;
}

async function openIdeaBudget(page: Page) {
  const loaded = page.waitForResponse(response =>
    response.request().method() === "GET"
    && new URL(response.url()).pathname === "/api/idea-di-budget"
  );
  await page.goto("/it/idea-di-budget");
  expect((await loaded).status()).toBe(200);
  await expect(page.getByRole("heading", { name: /idea di budget/i })).toBeVisible();
}

async function logout(page: Page) {
  await page.goto("/it/profilo");
  await page.getByRole("button", { name: /^esci$/i }).click();
  await page.waitForURL(/\/it$/);
}

async function recoveryLink(identity: QaIdentity, startedAt: number) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (inbucketUrl) {
      const root = inbucketUrl.replace(/\/$/, "");
      const listed = await fetch(`${root}/api/v1/messages`);
      if (!listed.ok) throw new Error(`Local recovery mailbox lookup failed with HTTP ${listed.status}.`);
      const payload = await listed.json() as {
        messages?: Array<{
          ID?: string;
          id?: string;
          Subject?: string;
          subject?: string;
          Created?: string;
          created?: string;
          To?: Array<{ Address?: string }> | string[];
        }>;
      };
      const messages = payload.messages || [];
      const item = messages.find(message => {
        const recipients = (message.To || []).map(value => typeof value === "string" ? value : value.Address || "");
        const created = Date.parse(message.Created || message.created || "");
        return recipients.includes(identity.email)
          && (!Number.isFinite(created) || created >= startedAt)
          && /reimposta|reset|password/i.test(message.Subject || message.subject || "");
      });
      const messageId = item?.ID || item?.id;
      if (messageId) {
        const detail = await fetch(`${root}/api/v1/message/${encodeURIComponent(messageId)}`);
        if (!detail.ok) throw new Error(`Local recovery email lookup failed with HTTP ${detail.status}.`);
        const message = await detail.json() as { HTML?: string; html?: string; Text?: string };
        const content = message.HTML || message.html || message.Text || "";
        const hrefs = transactionalEmailLinks(content);
        const link = hrefs.find(href => href.includes("/auth/v1/verify") && href.includes("type=recovery"));
        if (!link) throw new Error("Local recovery email did not contain the real verification callback.");
        return link;
      }
      await new Promise(resolve => setTimeout(resolve, 1_000));
      continue;
    }
    const message = await waitForTransactionalEmail({
      recipient: identity.email,
      requireLink: true,
      startedAt,
      subject: /reimposta la password/i,
      timeoutMs: Math.max(1, deadline - Date.now()),
    });
    const rawHrefs = transactionalEmailLinks(message.body);
    const hrefs = await Promise.all(rawHrefs.map(resolveTransactionalEmailLink));
    const link = hrefs.find(href => href.includes("/auth/v1/verify") && href.includes("type=recovery"));
    if (!link) throw new Error("Recovery email did not contain the real verification callback.");
    return link;
  }
  throw new Error("Recovery email was not found within 60 seconds.");
}

test.describe("[M8] isolated authenticated lifecycle", () => {
  test("[M8][diagnostic] minimal real onboarding reaches the first dashboard", async ({ page }, testInfo) => {
    expect(["m8-diagnostic", "m8-320"]).toContain(testInfo.project.name);
    expect(milestone8FixtureReady).toBe(true);
    const identity = await createQaIdentity("diagnostic");
    const phase = (name: string) => console.log(`[M8 diagnostic] ${name}: ${new URL(page.url()).pathname}`);
    try {
      await login(page, identity);
      phase("authenticated");
      const empty = await currentEvent(page);
      expect(empty.status).toBe(200);
      expect(empty.body.status).toBe("NO_EVENT");
      phase("no-event");
      await clearOnboardingPreferences(page);
      await page.goto("/it/select-language");
      phase("language");
      await page.getByRole("button", { name: "Italiano", exact: true }).click({ noWaitAfter: true });
      await expect(page).toHaveURL(/\/it\/select-country/);
      phase("country");
      await page.getByRole("button", { name: "Italia", exact: true }).click();
      await page.getByRole("button", { name: /^avanti$/i }).click({ noWaitAfter: true });
      await expect(page).toHaveURL(/\/it\/select-event-type/);
      phase("event-type");
      const ensureDefault = page.waitForResponse(response =>
        response.request().method() === "POST"
        && new URL(response.url()).pathname === "/api/event/ensure-default"
      );
      await page.getByRole("button", { name: /^matrimonio disponibile/i }).click();
      expect((await ensureDefault).status()).toBe(200);
      await page.waitForURL(/\/it\/dashboard/);
      phase("dashboard");
      const resolved = await currentEvent(page);
      expect(resolved.status).toBe(200);
      expect(resolved.body.status).toBe("RESOLVED");
      await renameCurrentEvent(identity, resolved.body.currentEvent.eventId, `QA-M8-DIAGNOSTIC-${identity.marker}`);
    } finally {
      await deleteQaIdentity(identity);
    }
  });

  test("[M8][reset] real request, email callback, password change and login", async ({ page }, testInfo) => {
    expect(testInfo.project.name).toBe("m8-320");
    expect(milestone8FixtureReady && Boolean(inbucketUrl || (emailAuditConfigured() && baseUrl))).toBe(true);
    test.setTimeout(150_000);
    const identity = await createQaIdentity("reset");
    const nextPassword = `${identity.password}-Changed!7`;
    try {
      await page.goto("/it/auth");
      await page.getByRole("button", { name: /password dimenticata/i }).click();
      await page.getByLabel("Email", { exact: true }).fill(identity.email);
      const startedAt = Date.now();
      await page.getByRole("button", { name: /invia istruzioni/i }).click();
      await expect(page.getByRole("status")).toBeVisible();
      await page.goto(await recoveryLink(identity, startedAt));
      await page.waitForURL(/\/it\/reset-password/);
      await page.getByLabel("Password", { exact: true }).fill(nextPassword);
      await page.getByRole("button", { name: /aggiorna password/i }).click();
      await expect(page.getByRole("status")).toBeVisible();
      await page.waitForURL(/\/it\/auth/);
      await page.getByLabel("Email", { exact: true }).fill(identity.email);
      await page.getByLabel("Password", { exact: true }).fill(identity.password);
      const oldPasswordResponse = page.waitForResponse(response =>
        response.request().method() === "POST"
        && new URL(response.url()).pathname.endsWith("/auth/v1/token")
      );
      await page.getByRole("button", { name: /accedi/i }).click();
      expect((await oldPasswordResponse).status()).toBe(400);
      await expect(page.getByText("Email o password non corretti.", { exact: true })).toBeVisible();
      await page.getByLabel("Password", { exact: true }).fill(nextPassword);
      const tokenResponse = page.waitForResponse(response =>
        response.request().method() === "POST"
        && new URL(response.url()).pathname.endsWith("/auth/v1/token")
      );
      await page.getByRole("button", { name: /accedi/i }).click();
      expect((await tokenResponse).status()).toBe(200);
      await page.waitForURL(/\/it\/(select-language|select-country|select-event|dashboard)/);
      const empty = await currentEvent(page);
      expect(empty.status).toBe(200);
      expect(empty.body.status).toBe("NO_EVENT");
      await finishFirstEvent(page, identity, `QA-M8-RESET-${identity.marker}`);
      await logout(page);
    } finally {
      await deleteQaIdentity(identity);
    }
  });

  test("[M8][matrix] real 0 to 1 to N routing, switching, reload and relogin", async ({ page }, testInfo) => {
    expect(testInfo.project.name).toBe("m8-320");
    expect(milestone8FixtureReady).toBe(true);
    const identity = await createQaIdentity("matrix");
    try {
      await login(page, identity);
      const firstId = await finishFirstEvent(page, identity, `QA-M8-MATRIX-A-${identity.marker}`);
      let resolved = await currentEvent(page);
      expect(resolved.body.events).toHaveLength(1);
      expect(resolved.body.currentEvent.eventId).toBe(firstId);
      const secondId = await createAdditionalEvent(page, identity, `QA-M8-MATRIX-B-${identity.marker}`);
      expect(secondId).not.toBe(firstId);
      resolved = await currentEvent(page);
      expect(resolved.body.events).toHaveLength(2);
      await logout(page);
      await login(page, identity);
      await page.waitForURL(/\/it\/select-event/);
      const selection = page.waitForResponse(response =>
        response.request().method() === "POST"
        && new URL(response.url()).pathname === "/api/my/current-event"
      );
      await page.getByRole("listitem", { name: `QA-M8-MATRIX-A-${identity.marker}`, exact: true }).click();
      expect((await selection).status()).toBe(200);
      await expect(page).toHaveURL(/\/it\/dashboard/);
      await page.reload();
      expect((await currentEvent(page)).body.currentEvent.eventId).toBe(firstId);
    } finally {
      await deleteQaIdentity(identity);
    }
  });

  for (const width of [320, 430] as const) test(`[M8][responsive-${width}][delete] lifecycle dialog at ${width}, keyboard and UI deletion`, async ({ page }, testInfo) => {
    expect(testInfo.project.name).toBe(`m8-${width}`);
    expect(milestone8FixtureReady).toBe(true);
    const identity = await createQaIdentity(`delete-${testInfo.project.name}`);
    const attacker = await createQaIdentity(`idor-${testInfo.project.name}`);
    const name = `QA-M8-DELETE-${identity.marker}`;
    try {
      await login(page, identity);
      const eventId = await finishFirstEvent(page, identity, name);
      const dependencyId = await seedDeletionDependency(identity, eventId);
      await logout(page);
      await login(page, attacker);
      expect((await apiDeleteAttempt(page, eventId, name)).status).toBe(404);
      await logout(page);
      await login(page, identity);
      await page.waitForURL(/\/it\/dashboard/);
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        await page.goto("/it/profilo");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
        const trigger = page.getByRole("button", { name: /elimina questo evento/i });
        await trigger.click();
        const dialog = page.getByRole("dialog", { name: /eliminazione definitiva/i });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole("textbox")).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
      }
      await page.getByRole("button", { name: /elimina questo evento/i }).click();
      const dialog = page.getByRole("dialog", { name: /eliminazione definitiva/i });
      await dialog.getByRole("textbox").fill(`${name}-altered`);
      await expect(dialog.getByRole("button", { name: /elimina definitivamente/i })).toBeDisabled();
      await dialog.getByRole("textbox").fill(name);
      const response = page.waitForResponse(item => new URL(item.url()).pathname === "/api/event/delete");
      await dialog.getByRole("button", { name: /elimina definitivamente/i }).click();
      expect((await response).status()).toBe(200);
      await verifyDeletedCascade(eventId, dependencyId);
      await page.waitForURL(/\/it\/select-event-type/);
      await page.goBack();
      await expect(page).not.toHaveURL(/\/profilo/);
    } finally {
      await deleteQaIdentity(identity);
      await deleteQaIdentity(attacker);
    }
  });

  test("[M8][idea-budget] browser persistence, custom rows, duplicate guard, apply and event isolation", async ({ page }, testInfo) => {
    expect(testInfo.project.name).toBe("m8-430");
    expect(milestone8FixtureReady).toBe(true);
    const identity = await createQaIdentity("idea");
    const firstName = `QA-M8-IDEA-A-${identity.marker}`;
    try {
      await login(page, identity);
      const firstId = await finishFirstEvent(page, identity, firstName);
      await openIdeaBudget(page);
      await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(0);
      const categories = page.locator("article");
      await categories.nth(0).locator("button[aria-expanded]").click();
      await categories.nth(1).locator("button[aria-expanded]").click();
      for (const [articleIndex, amount] of [[0, "811"], [1, "822"]] as const) {
        const row = categories.nth(articleIndex).locator('input[type="checkbox"]').first().locator("xpath=../..");
        await row.locator('input[type="checkbox"]').check();
        await row.getByLabel(/importo/i).fill(amount);
      }
      await page.getByRole("button", { name: /^salva$/i }).click();
      await expect(page.getByRole("status")).not.toBeEmpty();
      await page.reload();
      await categories.nth(0).locator("button[aria-expanded]").click();
      await categories.nth(1).locator("button[aria-expanded]").click();
      await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(2);
      const customMarker = `Voce ${identity.marker}`;
      page.once("dialog", dialog => dialog.accept(customMarker));
      await categories.nth(0).getByRole("button", { name: /aggiungi voce/i }).click();
      const custom = page.getByLabel(/nome (?:della )?voce personalizzata/i);
      await expect(custom).toHaveValue(customMarker);
      const customRow = page.getByTestId("budget-custom-row");
      await expect(customRow).toHaveCount(1);
      await customRow.getByLabel(/importo/i).fill("833");
      page.once("dialog", dialog => dialog.accept(customMarker.toUpperCase()));
      await categories.nth(0).getByRole("button", { name: /aggiungi voce/i }).click();
      await expect(page.getByRole("status")).toBeVisible();
      await page.getByRole("button", { name: /^salva$/i }).click();
      await page.getByRole("button", { name: /applica/i }).click();
      await expect(page.getByRole("status")).not.toBeEmpty();
      await page.reload();
      await categories.nth(0).locator("button[aria-expanded]").click();
      await expect(page.getByTestId("budget-custom-row").getByLabel(/importo/i)).toHaveValue("833");
      const secondId = await createAdditionalEvent(page, identity, `QA-M8-IDEA-B-${identity.marker}`);
      expect(secondId).not.toBe(firstId);
      await openIdeaBudget(page);
      await categories.nth(0).locator("button[aria-expanded]").click();
      await expect(page.getByTestId("budget-custom-row")).toHaveCount(0);
      await logout(page);
      await login(page, identity);
      await page.waitForURL(/\/it\/select-event/);
      const selection = page.waitForResponse(response =>
        response.request().method() === "POST"
        && new URL(response.url()).pathname === "/api/my/current-event"
      );
      await page.getByRole("listitem", { name: firstName, exact: true }).click();
      expect((await selection).status()).toBe(200);
      await page.waitForURL(/\/it\/dashboard/);
      await openIdeaBudget(page);
      await categories.nth(0).locator("button[aria-expanded]").click();
      await expect(page.getByTestId("budget-custom-row").getByLabel(/importo/i)).toHaveValue("833");
    } finally {
      await deleteQaIdentity(identity);
    }
  });
});
