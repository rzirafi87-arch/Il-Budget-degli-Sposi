import { expect, type BrowserContext, type Page, test } from "@playwright/test";

const ownerEmail = process.env.PLAYWRIGHT_TEST_EMAIL;
const ownerPassword = process.env.PLAYWRIGHT_TEST_PASSWORD;
const partnerEmail = process.env.PLAYWRIGHT_PARTNER_EMAIL;
const partnerPassword = process.env.PLAYWRIGHT_PARTNER_PASSWORD;
const resendApiKey = process.env.PLAYWRIGHT_RESEND_API_KEY;
const configuredBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

const REQUIRED = [
  ["PLAYWRIGHT_TEST_EMAIL", ownerEmail],
  ["PLAYWRIGHT_TEST_PASSWORD", ownerPassword],
  ["PLAYWRIGHT_PARTNER_EMAIL", partnerEmail],
  ["PLAYWRIGHT_PARTNER_PASSWORD", partnerPassword],
  ["PLAYWRIGHT_RESEND_API_KEY", resendApiKey],
  ["PLAYWRIGHT_BASE_URL", configuredBaseUrl],
] as const;

if (process.env.CI) {
  const missing = REQUIRED.filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error(`Partner QA is missing required environment variables: ${missing.join(", ")}.`);
}

type ApiResult<T> = { status: number; body: T };
type CurrentEventPayload = {
  status: "RESOLVED" | "NO_EVENT" | "SELECTION_REQUIRED";
  currentEvent: { eventId: string; ownerId: string; name: string | null; eventType: string; accessRole: string } | null;
  events: Array<{ id: string; ownerId: string; name: string | null; eventType: string; accessRole: string }>;
};
type Member = { id: string; user_id: string; role: string; status: string };
type Invitation = { id: string; invited_email_normalized: string; status: string };

test.use({ trace: "off", screenshot: "off", video: "off" });

async function primePreview(page: Page) {
  if (configuredBaseUrl?.includes("_vercel_share=")) {
    await page.goto(configuredBaseUrl, { waitUntil: "domcontentloaded" });
  }
}

async function login(page: Page, email: string, password: string) {
  await primePreview(page);
  await page.goto("/it/auth");
  const main = page.locator("main");
  await main.getByLabel("Email", { exact: true }).fill(email);
  await main.getByLabel("Password", { exact: true }).fill(password);
  await main.getByRole("button", { name: /accedi/i }).click();
  await page.waitForURL(/\/it\/(dashboard|select-event|select-language)/, { timeout: 20_000 });
  if (page.url().includes("select-event")) {
    const firstEvent = page.getByRole("listitem").first();
    if (await firstEvent.isVisible()) {
      await firstEvent.click();
      await page.waitForURL(/\/it\/dashboard/, { timeout: 20_000 });
    }
  }
}

async function logout(page: Page) {
  await page.goto("/it/profilo");
  await page.getByRole("button", { name: /^esci$/i }).click();
  await page.waitForURL(/\/it$/, { timeout: 20_000 });
}

async function sessionUserId(page: Page): Promise<string> {
  return page.evaluate(() => {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      try {
        const value = JSON.parse(localStorage.getItem(key) || "null") as { user?: { id?: string } } | null;
        if (value?.user?.id) return value.user.id;
      } catch {
        // Ignore unrelated browser storage entries.
      }
    }
    throw new Error("Authenticated user id is unavailable in this browser context.");
  });
}

async function appApi<T>(page: Page, path: string, init: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  return page.evaluate(async ({ requestPath, requestInit }) => {
    let accessToken = "";
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      try {
        const value = JSON.parse(localStorage.getItem(key) || "null") as { access_token?: string } | null;
        if (value?.access_token) { accessToken = value.access_token; break; }
      } catch {
        // Ignore unrelated browser storage entries.
      }
    }
    if (!accessToken) throw new Error("Authenticated application session is unavailable.");
    const response = await fetch(requestPath, {
      method: requestInit.method || "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(requestInit.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: requestInit.body === undefined ? undefined : JSON.stringify(requestInit.body),
    });
    return { status: response.status, body: await response.json().catch(() => ({})) };
  }, { requestPath: path, requestInit: init }) as Promise<ApiResult<T>>;
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

async function cleanQaRelationship(ownerPage: Page, qaPartnerUserId: string) {
  const members = await appApi<{ members: Member[]; accessRole: string }>(ownerPage, "/api/my/event-members");
  expect(members.status, "Owner must be able to inspect the QA event membership").toBe(200);
  expect(members.body.accessRole).toBe("owner");
  for (const member of members.body.members.filter(item => item.role === "partner" && item.status === "active")) {
    expect(member.user_id, "The QA event must not contain a different active partner").toBe(qaPartnerUserId);
    const removed = await appApi(ownerPage, `/api/my/event-members/${member.id}`, { method: "DELETE" });
    expect(removed.status).toBe(200);
  }

  const invitations = await appApi<{ invitations: Invitation[] }>(ownerPage, "/api/my/event-invitations");
  expect(invitations.status).toBe(200);
  for (const invitation of invitations.body.invitations.filter(item => item.status === "pending")) {
    expect(normalized(invitation.invited_email_normalized) === normalized(partnerEmail!), "The QA event must not contain a pending invitation for another address").toBe(true);
    const revoked = await appApi(ownerPage, `/api/my/event-invitations/${invitation.id}`, { method: "DELETE" });
    expect(revoked.status).toBe(200);
  }
}

type SentEmail = { id: string; to: string[]; subject: string; created_at: string };

async function resendRequest<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.resend.com${path}`, {
    headers: { Authorization: `Bearer ${resendApiKey!}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Resend QA read failed with HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}

async function invitationLinkAfter(startedAt: number, previousMessageId?: string) {
  const deadline = Date.now() + 60_000;
  let message: SentEmail | undefined;
  while (Date.now() < deadline) {
    const listed = await resendRequest<{ data: SentEmail[] }>("/emails?limit=100");
    message = listed.data.find(item =>
      item.id !== previousMessageId &&
      item.subject === "Invito al tuo evento" &&
      Date.parse(item.created_at) >= startedAt &&
      item.to.some(address => normalized(address) === normalized(partnerEmail!))
    );
    if (message) break;
    await new Promise(resolve => setTimeout(resolve, 2_000));
  }
  if (!message) throw new Error("Partner invitation email was not found within 60 seconds.");

  const retrieved = await resendRequest<{ html?: string }>(`/emails/${encodeURIComponent(message.id)}`);
  if (!retrieved.html) throw new Error("Partner invitation email did not contain HTML.");
  const expectedOrigin = new URL(configuredBaseUrl!).origin;
  const candidates = [...retrieved.html.matchAll(/href=["']([^"']+)["']/gi)]
    .map(match => match[1].replaceAll("&amp;", "&"))
    .map(value => { try { return new URL(value); } catch { return null; } })
    .filter((value): value is URL => value !== null && value.origin === expectedOrigin && value.pathname === "/it/invitation");
  expect(candidates.length, "Email must contain exactly one invitation link on the verified application origin").toBe(1);
  const link = candidates[0];
  expect(link.protocol, "Preview invitation must use HTTPS").toBe("https:");
  expect(link.username).toBe("");
  expect(link.password).toBe("");
  expect(link.hash).toBe("");
  expect(link.searchParams.getAll("token").length, "Invitation URL must contain exactly one token").toBe(1);
  expect([...link.searchParams.keys()], "Invitation URL must not contain redirect parameters").toEqual(["token"]);
  const token = link.searchParams.get("token");
  expect(token?.length).toBeGreaterThanOrEqual(32);
  return { href: link.href, token: token!, messageId: message.id };
}

async function sendInvitationFromUi(ownerPage: Page) {
  await ownerPage.goto("/it/profilo");
  const section = ownerPage.getByRole("region", { name: "Partner dell’evento" });
  await expect(section.getByText(/nessun partner collegato/i)).toBeVisible({ timeout: 15_000 });
  await section.getByLabel("Email del partner", { exact: true }).fill(partnerEmail!);
  const startedAt = Date.now();
  await section.getByRole("button", { name: "Invita partner", exact: true }).click();
  await expect(section.getByText(/invito in attesa/i)).toBeVisible({ timeout: 20_000 });
  return startedAt;
}

async function acceptInvitation(partnerPage: Page, href: string, needsLogin: boolean) {
  try {
    await partnerPage.goto(href);
    await expect(partnerPage.getByRole("heading", { name: "Invito partner" })).toBeVisible();
    await expect(partnerPage.getByText(/ti ha invitato a collaborare/i)).toBeVisible({ timeout: 15_000 });
    await partnerPage.getByRole("button", { name: "Accetta", exact: true }).click();
    if (needsLogin) {
      await partnerPage.waitForURL(/\/it\/auth\?next=/);
      await partnerPage.getByLabel("Email", { exact: true }).fill(partnerEmail!);
      await partnerPage.getByLabel("Password", { exact: true }).fill(partnerPassword!);
      await partnerPage.getByRole("button", { name: /accedi/i }).click();
      await partnerPage.waitForURL(/\/it\/invitation\?token=/, { timeout: 20_000 });
      await partnerPage.getByRole("button", { name: "Accetta", exact: true }).click();
    }
    await partnerPage.waitForURL(/\/it\/dashboard/, { timeout: 20_000 });
    await expect(partnerPage.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 15_000 });
  } catch {
    throw new Error("Partner invitation acceptance failed; invitation details were redacted.");
  }
}

test.describe("authenticated partner lifecycle journey", () => {
  test.describe.configure({ mode: "serial" });

  test("real invite, Resend retrieval, isolation, revoke and voluntary leave", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "it-390", "Partner lifecycle runs once to prevent duplicate real emails.");
    test.skip(REQUIRED.some(([, value]) => !value), "Set all partner QA secrets for local execution.");
    test.setTimeout(240_000);

    const ownerContext: BrowserContext = await browser.newContext({ locale: "it-IT", viewport: { width: 390, height: 844 } });
    const partnerContext: BrowserContext = await browser.newContext({ locale: "it-IT", viewport: { width: 390, height: 844 } });
    const ownerPage = await ownerContext.newPage();
    const partnerPage = await partnerContext.newPage();

    try {
      await login(ownerPage, ownerEmail!, ownerPassword!);
      const ownerCurrent = await appApi<CurrentEventPayload>(ownerPage, "/api/my/current-event");
      expect(ownerCurrent.status).toBe(200);
      expect(ownerCurrent.body.status).toBe("RESOLVED");
      expect(ownerCurrent.body.currentEvent?.accessRole).toBe("owner");
      const qaEvent = ownerCurrent.body.currentEvent!;

      await login(partnerPage, partnerEmail!, partnerPassword!);
      const qaPartnerUserId = await sessionUserId(partnerPage);
      await logout(partnerPage);
      await cleanQaRelationship(ownerPage, qaPartnerUserId);

      const firstStartedAt = await sendInvitationFromUi(ownerPage);
      const firstEmail = await invitationLinkAfter(firstStartedAt);
      await acceptInvitation(partnerPage, firstEmail.href, true);

      const partnerCurrent = await appApi<CurrentEventPayload>(partnerPage, "/api/my/current-event");
      expect(partnerCurrent.status).toBe(200);
      expect(partnerCurrent.body.status).toBe("RESOLVED");
      expect(partnerCurrent.body.currentEvent?.eventId).toBe(qaEvent.eventId);
      expect(partnerCurrent.body.currentEvent?.accessRole).toBe("partner");
      expect(partnerCurrent.body.events.every(event => event.id === qaEvent.eventId)).toBe(true);
      const membership = await appApi<{ members: Member[]; accessRole: string }>(partnerPage, "/api/my/event-members");
      expect(membership.status).toBe(200);
      expect(membership.body.accessRole).toBe("partner");
      expect(membership.body.members.some(member => member.user_id === qaPartnerUserId && member.status === "active")).toBe(true);

      await partnerPage.goto("/it/budget");
      await expect(partnerPage.locator("main")).toBeVisible();
      await expect(partnerPage.locator("body")).not.toContainText("MISSING_MESSAGE");

      const ownerBefore = partnerCurrent.body.currentEvent!.ownerId;
      const ownershipAttempt = await appApi(partnerPage, "/api/event/update", { method: "PATCH", body: { owner_id: qaPartnerUserId } });
      expect([200, 400, 403]).toContain(ownershipAttempt.status);
      const afterOwnershipAttempt = await appApi<CurrentEventPayload>(partnerPage, "/api/my/current-event");
      expect(afterOwnershipAttempt.body.currentEvent?.ownerId).toBe(ownerBefore);
      const deleteAttempt = await appApi(partnerPage, "/api/event/delete", { method: "DELETE", body: { eventId: qaEvent.eventId, confirmationName: qaEvent.name || qaEvent.eventType } });
      expect(deleteAttempt.status).toBe(403);
      const inviteAttempt = await appApi(partnerPage, "/api/my/event-invitations", { method: "POST", body: { email: "blocked@example.invalid" } });
      expect(inviteAttempt.status).toBe(403);
      const ownerInvites = await appApi<{ invitations: Invitation[] }>(ownerPage, "/api/my/event-invitations");
      const acceptedInvitation = ownerInvites.body.invitations.find(item => item.status === "accepted");
      expect(acceptedInvitation).toBeDefined();
      const cancelAttempt = await appApi(partnerPage, `/api/my/event-invitations/${acceptedInvitation!.id}`, { method: "DELETE" });
      expect(cancelAttempt.status).toBe(403);
      const foreignAttempt = await appApi(partnerPage, "/api/my/current-event", { method: "POST", body: { eventId: "00000000-0000-0000-0000-000000000001" } });
      expect(foreignAttempt.status).toBe(403);

      await ownerPage.goto("/it/profilo");
      const ownerPartnerSection = ownerPage.getByRole("region", { name: "Partner dell’evento" });
      await expect(ownerPartnerSection.getByText("Partner attivo", { exact: true })).toBeVisible({ timeout: 15_000 });
      ownerPage.once("dialog", dialog => dialog.accept());
      await ownerPartnerSection.getByRole("button", { name: "Rimuovi partner", exact: true }).click();
      await expect(ownerPartnerSection.getByText("Partner rimosso.", { exact: true })).toBeVisible({ timeout: 15_000 });

      await partnerPage.reload();
      await partnerPage.waitForURL(url => !url.pathname.endsWith("/dashboard"), { timeout: 20_000 });
      await partnerPage.goBack();
      await partnerPage.reload();
      await expect(partnerPage).not.toHaveURL(/\/it\/dashboard$/);
      const revokedCurrent = await appApi<CurrentEventPayload>(partnerPage, "/api/my/current-event");
      expect(revokedCurrent.body.events.some(event => event.id === qaEvent.eventId)).toBe(false);
      const revokedIdorAttempt = await appApi(partnerPage, "/api/my/current-event", { method: "POST", body: { eventId: qaEvent.eventId } });
      expect(revokedIdorAttempt.status).toBe(403);
      const ownerAfterRevoke = await appApi<CurrentEventPayload>(ownerPage, "/api/my/current-event");
      expect(ownerAfterRevoke.body.currentEvent?.eventId).toBe(qaEvent.eventId);
      expect(ownerAfterRevoke.body.currentEvent?.ownerId).toBe(ownerBefore);

      const secondStartedAt = await sendInvitationFromUi(ownerPage);
      const secondEmail = await invitationLinkAfter(secondStartedAt, firstEmail.messageId);
      expect(secondEmail.token !== firstEmail.token, "The second invitation must use a new token").toBe(true);
      try {
        await partnerPage.goto(firstEmail.href);
        await expect(partnerPage.getByText("Invito già accettato.", { exact: true })).toBeVisible({ timeout: 15_000 });
      } catch {
        throw new Error("Old invitation replay check failed; invitation details were redacted.");
      }
      await acceptInvitation(partnerPage, secondEmail.href, false);

      await partnerPage.goto("/it/profilo");
      const partnerSection = partnerPage.getByRole("region", { name: "Partner dell’evento" });
      await expect(partnerSection.getByText(/partecipi a questo evento/i)).toBeVisible({ timeout: 15_000 });
      partnerPage.once("dialog", dialog => dialog.accept());
      await partnerSection.getByRole("button", { name: "Lascia l’evento", exact: true }).click();
      await partnerPage.waitForURL(/\/it\/(select-event|select-language)/, { timeout: 20_000 });
      await partnerPage.goto("/it/dashboard");
      await partnerPage.waitForURL(url => !url.pathname.endsWith("/dashboard"), { timeout: 20_000 });
      const leftCurrent = await appApi<CurrentEventPayload>(partnerPage, "/api/my/current-event");
      expect(leftCurrent.body.events.some(event => event.id === qaEvent.eventId)).toBe(false);
      const ownerAfterLeave = await appApi<CurrentEventPayload>(ownerPage, "/api/my/current-event");
      expect(ownerAfterLeave.body.currentEvent?.eventId).toBe(qaEvent.eventId);
      expect(ownerAfterLeave.body.currentEvent?.ownerId).toBe(ownerBefore);
    } finally {
      await partnerContext.close();
      await ownerContext.close();
    }
  });
});
