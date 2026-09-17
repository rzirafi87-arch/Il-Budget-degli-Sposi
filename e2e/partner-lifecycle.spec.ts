import { expect, type BrowserContext, type Page, test, type TestInfo } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  emailAuditMissingConfiguration,
  resolveTransactionalEmailLink,
  waitForTransactionalEmail,
} from "./helpers/transactional-email-audit";

const ownerEmail = process.env.PLAYWRIGHT_TEST_EMAIL;
const ownerPassword = process.env.PLAYWRIGHT_TEST_PASSWORD;
const partnerEmail = process.env.PLAYWRIGHT_PARTNER_EMAIL;
const partnerPassword = process.env.PLAYWRIGHT_PARTNER_PASSWORD;
const configuredBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const serviceRole = process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const REQUIRED = [
  ["PLAYWRIGHT_TEST_EMAIL", ownerEmail],
  ["PLAYWRIGHT_TEST_PASSWORD", ownerPassword],
  ["PLAYWRIGHT_PARTNER_EMAIL", partnerEmail],
  ["PLAYWRIGHT_PARTNER_PASSWORD", partnerPassword],
  ["PLAYWRIGHT_BASE_URL", configuredBaseUrl],
] as const;

if (process.env.CI) {
  const missing = [
    ...REQUIRED.filter(([, value]) => !value).map(([name]) => name),
    ...emailAuditMissingConfiguration(),
  ];
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
type AcceptanceStage =
  | "invitation_open"
  | "invitation_navigated"
  | "invitation_inspected"
  | "login_required"
  | "invitation_return_saved"
  | "login_submitted"
  | "invitation_resumed"
  | "acceptance_requested"
  | "acceptance_responded"
  | "current_event_updated"
  | "dashboard_arrived";
type AcceptanceDiagnostic = {
  failedStage: AcceptanceStage;
  pathname: string;
  httpStatus: number | null;
  applicationCode: string | null;
};

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
  await expect.poll(async () => {
    try {
      return await page.evaluate(() => {
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (!key?.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
          try {
            const value = JSON.parse(localStorage.getItem(key) || "null") as { access_token?: string } | null;
            if (value?.access_token) return true;
          } catch {
            // Ignore unrelated browser storage entries.
          }
        }
        return false;
      });
    } catch {
      // A successful login can navigate while this poll is evaluating.
      return false;
    }
  }, { timeout: 20_000, message: "Supabase login must establish a real browser session" }).toBe(true);
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

async function cleanupCreatedInvitations(eventId: string | undefined, baselineIds: Set<string>) {
  if (!eventId || !serviceRole || !supabaseUrl) return;
  const client = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const result = await client.from("event_invitations")
    .select("id,invited_email_normalized")
    .eq("event_id", eventId);
  if (result.error) throw new Error("QA invitation cleanup lookup failed.");
  const created = (result.data || []).filter(item => !baselineIds.has(item.id));
  if (created.some(item => normalized(item.invited_email_normalized) !== normalized(partnerEmail!))) {
    throw new Error("Refusing QA invitation cleanup because a new invitation targets another address.");
  }
  if (!created.length) return;
  const removed = await client.from("event_invitations")
    .delete()
    .in("id", created.map(item => item.id))
    .select("id");
  if (removed.error || (removed.data || []).length !== created.length) {
    throw new Error("QA invitation cleanup failed.");
  }
}

async function cleanQaRelationship(ownerPage: Page, qaPartnerUserId: string) {
  const members = await appApi<{ members: Member[]; accessRole: string }>(ownerPage, "/api/my/event-members");
  expect(members.status, "Owner must be able to inspect the QA event membership").toBe(200);
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

async function invitationLinkAfter(startedAt: number, previousMessageId?: string) {
  const message = await waitForTransactionalEmail({
    previousMessageId,
    recipient: partnerEmail!,
    startedAt,
    subject: "Invito al tuo evento",
  });
  const expectedOrigin = new URL(configuredBaseUrl!).origin;
  const expectedHost = new URL(expectedOrigin).hostname;
  const isApprovedOrigin = (value: URL) => value.origin === expectedOrigin || (
    expectedHost.endsWith(".vercel.app")
    && value.protocol === "https:"
    && value.hostname.startsWith("il-budget-degli-sposi-")
    && value.hostname.endsWith("-rzirafi87-archs-projects.vercel.app")
  );
  const rawLinks = [...message.body.matchAll(/href=["']([^"']+)["']/gi)]
    .map(match => match[1].replaceAll("&amp;", "&"));
  const candidates = (await Promise.all(rawLinks.map(resolveTransactionalEmailLink)))
    .map(value => { try { return new URL(value); } catch { return null; } })
    .filter((value): value is URL => value !== null && isApprovedOrigin(value) && value.pathname === "/it/invitation");
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

function safePathname(page: Page) {
  try { return new URL(page.url()).pathname; } catch { return "unavailable"; }
}

async function safeApiDiagnostic(response: import("@playwright/test").Response) {
  const body = await response.json().catch(() => ({})) as { error?: unknown; code?: unknown };
  const candidate = typeof body.error === "string" ? body.error : typeof body.code === "string" ? body.code : null;
  return {
    httpStatus: response.status(),
    applicationCode: candidate && /^[A-Z][A-Z0-9_]{1,63}$/.test(candidate) ? candidate : null,
  };
}

async function attachSanitizedFailure(page: Page, context: BrowserContext, testInfo: TestInfo, diagnostic: AcceptanceDiagnostic) {
  await page.evaluate(() => {
    history.replaceState(null, "", location.pathname);
    for (const input of document.querySelectorAll<HTMLInputElement>("input")) input.value = "[redacted]";
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent?.includes("@")) node.textContent = "[redacted]";
    }
  }).catch(() => undefined);
  await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
  const screenshot = await page.screenshot({ fullPage: true }).catch(() => null);
  if (screenshot) await testInfo.attach("sanitized-failure.png", { body: screenshot, contentType: "image/png" });
  const tracePath = testInfo.outputPath("sanitized-trace.zip");
  await context.tracing.stop({ path: tracePath });
  await testInfo.attach("acceptance-diagnostic.json", {
    body: Buffer.from(JSON.stringify(diagnostic, null, 2)),
    contentType: "application/json",
  });
}

async function acceptInvitation(partnerPage: Page, partnerContext: BrowserContext, href: string, needsLogin: boolean, testInfo: TestInfo) {
  let stage: AcceptanceStage = "invitation_open";
  let httpStatus: number | null = null;
  let applicationCode: string | null = null;
  try {
    const navigation = await partnerPage.goto(href);
    httpStatus = navigation?.status() ?? null;
    stage = "invitation_navigated";
    expect(safePathname(partnerPage), "Invitation link must remain on its public application route").toBe("/it/invitation");
    await expect(partnerPage.getByRole("heading", { name: "Invito partner" })).toBeVisible();
    await expect(partnerPage.getByText(/ti ha invitato a collaborare/i)).toBeVisible({ timeout: 15_000 });
    stage = "invitation_inspected";
    if (needsLogin) {
      stage = "login_required";
      const savedResponse = partnerPage.waitForResponse(response => new URL(response.url()).pathname === "/api/invitations/return");
      await partnerPage.getByRole("button", { name: "Accetta", exact: true }).click();
      const saved = await savedResponse;
      ({ httpStatus, applicationCode } = await safeApiDiagnostic(saved));
      stage = "invitation_return_saved";
      await partnerPage.waitForURL(/\/it\/auth\?next=/);
      await partnerPage.getByLabel("Email", { exact: true }).fill(partnerEmail!);
      await partnerPage.getByLabel("Password", { exact: true }).fill(partnerPassword!);
      await partnerPage.getByRole("button", { name: /accedi/i }).click();
      stage = "login_submitted";
      await partnerPage.waitForURL(/\/it\/invitation\?token=/, { timeout: 20_000 });
      stage = "invitation_resumed";
    }
    const acceptedResponse = partnerPage.waitForResponse(response => new URL(response.url()).pathname === "/api/invitations/accept");
    stage = "acceptance_requested";
    await partnerPage.getByRole("button", { name: "Accetta", exact: true }).click();
    const accepted = await acceptedResponse;
    ({ httpStatus, applicationCode } = await safeApiDiagnostic(accepted));
    stage = "acceptance_responded";
    expect(httpStatus, `Invitation acceptance API failed with ${applicationCode || "UNKNOWN_CODE"}`).toBe(200);
    stage = "current_event_updated";
    await partnerPage.waitForURL(/\/it\/dashboard/, { timeout: 20_000 });
    stage = "dashboard_arrived";
    await expect(partnerPage.getByRole("heading", { name: /dashboard/i })).toBeVisible({ timeout: 15_000 });
  } catch {
    const diagnostic = { failedStage: stage, pathname: safePathname(partnerPage), httpStatus, applicationCode };
    await attachSanitizedFailure(partnerPage, partnerContext, testInfo, diagnostic);
    throw new Error(`Partner invitation acceptance failed at ${stage}; HTTP ${httpStatus ?? "unavailable"}; code ${applicationCode ?? "unavailable"}; pathname ${diagnostic.pathname}.`);
  }
}

test.describe("authenticated partner lifecycle journey", () => {
  test.describe.configure({ mode: "serial" });

  test("real invite, provider retrieval, isolation, revoke and voluntary leave", async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "it-390", "Partner lifecycle runs once to prevent duplicate real emails.");
    test.skip(
      REQUIRED.some(([, value]) => !value) || emailAuditMissingConfiguration().length > 0,
      "Set all partner QA secrets for local execution.",
    );
    test.setTimeout(240_000);

    const ownerContext: BrowserContext = await browser.newContext({ locale: "it-IT", viewport: { width: 390, height: 844 } });
    const partnerContext: BrowserContext = await browser.newContext({ locale: "it-IT", viewport: { width: 390, height: 844 } });
    const ownerPage = await ownerContext.newPage();
    const partnerPage = await partnerContext.newPage();
    let qaEventId: string | undefined;
    const baselineInvitationIds = new Set<string>();

    try {
      await login(ownerPage, ownerEmail!, ownerPassword!);
      const ownerCurrent = await appApi<CurrentEventPayload>(ownerPage, "/api/my/current-event");
      expect(ownerCurrent.status).toBe(200);
      expect(ownerCurrent.body.status).toBe("RESOLVED");
      expect(ownerCurrent.body.currentEvent?.accessRole).toBe("owner");
      const qaEvent = ownerCurrent.body.currentEvent!;
      qaEventId = qaEvent.eventId;
      const baselineInvitations = await appApi<{ invitations: Invitation[] }>(ownerPage, "/api/my/event-invitations");
      expect(baselineInvitations.status).toBe(200);
      for (const invitation of baselineInvitations.body.invitations) baselineInvitationIds.add(invitation.id);

      await login(partnerPage, partnerEmail!, partnerPassword!);
      const qaPartnerUserId = await sessionUserId(partnerPage);
      await logout(partnerPage);
      await cleanQaRelationship(ownerPage, qaPartnerUserId);

      const firstStartedAt = await sendInvitationFromUi(ownerPage);
      const firstEmail = await invitationLinkAfter(firstStartedAt);
      await acceptInvitation(partnerPage, partnerContext, firstEmail.href, true, testInfo);

      const partnerCurrent = await appApi<CurrentEventPayload>(partnerPage, "/api/my/current-event");
      expect(partnerCurrent.status).toBe(200);
      expect(partnerCurrent.body.status).toBe("RESOLVED");
      expect(partnerCurrent.body.currentEvent?.eventId).toBe(qaEvent.eventId);
      expect(partnerCurrent.body.currentEvent?.accessRole).toBe("partner");
      expect(partnerCurrent.body.events.some(event => event.id === qaEvent.eventId)).toBe(true);
      const membership = await appApi<{ members: Member[]; accessRole: string }>(partnerPage, "/api/my/event-members");
      expect(membership.status).toBe(200);
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
      const revokedCurrent = await appApi<CurrentEventPayload>(partnerPage, "/api/my/current-event");
      expect(revokedCurrent.body.events.some(event => event.id === qaEvent.eventId)).toBe(false);
      expect(revokedCurrent.body.currentEvent?.eventId).not.toBe(qaEvent.eventId);
      const revokedIdorAttempt = await appApi(partnerPage, "/api/my/current-event", { method: "POST", body: { eventId: qaEvent.eventId } });
      expect(revokedIdorAttempt.status).toBe(403);
      const ownerAfterRevoke = await appApi<CurrentEventPayload>(ownerPage, "/api/my/current-event");
      expect(ownerAfterRevoke.body.currentEvent?.eventId).toBe(qaEvent.eventId);
      expect(ownerAfterRevoke.body.currentEvent?.ownerId).toBe(ownerBefore);

      const secondStartedAt = await sendInvitationFromUi(ownerPage);
      const secondEmail = await invitationLinkAfter(secondStartedAt, firstEmail.messageId);
      expect(secondEmail.token !== firstEmail.token, "The second invitation must use a new token").toBe(true);

      const membershipBeforeReplay = await appApi<{ members: Member[]; accessRole: string }>(ownerPage, "/api/my/event-members");
      expect(membershipBeforeReplay.status).toBe(200);
      const currentEventBeforeReplay = await appApi<CurrentEventPayload>(partnerPage, "/api/my/current-event");
      expect(currentEventBeforeReplay.status).toBe(200);
      const invitationsBeforeReplay = await appApi<{ invitations: Invitation[] }>(ownerPage, "/api/my/event-invitations");
      expect(invitationsBeforeReplay.status).toBe(200);
      expect(invitationsBeforeReplay.body.invitations.find(item => item.id === acceptedInvitation!.id)?.status).toBe("accepted");

      const replay = await appApi<{ error?: string }>(partnerPage, "/api/invitations/accept", {
        method: "POST",
        body: { token: firstEmail.token },
      });
      expect(replay.status, "A consumed invitation must be rejected by the API").toBe(409);
      expect(replay.body.error, "Anti-replay must expose the stable application code").toBe("INVITATION_ALREADY_USED");

      const membershipAfterReplay = await appApi<{ members: Member[]; accessRole: string }>(ownerPage, "/api/my/event-members");
      expect(membershipAfterReplay.status).toBe(200);
      expect(membershipAfterReplay.body).toEqual(membershipBeforeReplay.body);
      const currentEventAfterReplay = await appApi<CurrentEventPayload>(partnerPage, "/api/my/current-event");
      expect(currentEventAfterReplay.status).toBe(200);
      expect(currentEventAfterReplay.body).toEqual(currentEventBeforeReplay.body);
      const invitationsAfterReplay = await appApi<{ invitations: Invitation[] }>(ownerPage, "/api/my/event-invitations");
      expect(invitationsAfterReplay.status).toBe(200);
      expect(invitationsAfterReplay.body).toEqual(invitationsBeforeReplay.body);

      try {
        const inspectionPromise = partnerPage.waitForResponse(response => new URL(response.url()).pathname === "/api/invitations/inspect");
        await partnerPage.goto(firstEmail.href);
        const inspection = await inspectionPromise;
        const inspectionBody = await inspection.json().catch(() => ({})) as { invitation?: { status?: string }; error?: string };
        expect(inspection.status(), `Consumed invitation inspection failed with ${inspectionBody.error || "UNKNOWN_CODE"}`).toBe(200);
        expect(inspectionBody.invitation?.status).toBe("accepted");
        await expect(partnerPage.getByRole("status")).toHaveText("Invito già accettato.", { timeout: 15_000 });
      } catch {
        await partnerPage.evaluate(() => history.replaceState(null, "", location.pathname)).catch(() => undefined);
        throw new Error("Old invitation replay UI check failed; invitation details were redacted.");
      }

      await acceptInvitation(partnerPage, partnerContext, secondEmail.href, false, testInfo);

      await partnerPage.goto("/it/profilo");
      const partnerSection = partnerPage.getByRole("region", { name: "Partner dell’evento" });
      await expect(partnerSection.getByText(/partecipi a questo evento/i)).toBeVisible({ timeout: 15_000 });
      partnerPage.once("dialog", dialog => dialog.accept());
      await partnerSection.getByRole("button", { name: "Lascia l’evento", exact: true }).click();
      await partnerPage.waitForURL(/\/it\/(select-event|select-language)/, { timeout: 20_000 });
      await partnerPage.goto("/it/dashboard");
      const leftCurrent = await appApi<CurrentEventPayload>(partnerPage, "/api/my/current-event");
      expect(leftCurrent.body.events.some(event => event.id === qaEvent.eventId)).toBe(false);
      expect(leftCurrent.body.currentEvent?.eventId).not.toBe(qaEvent.eventId);
      const ownerAfterLeave = await appApi<CurrentEventPayload>(ownerPage, "/api/my/current-event");
      expect(ownerAfterLeave.body.currentEvent?.eventId).toBe(qaEvent.eventId);
      expect(ownerAfterLeave.body.currentEvent?.ownerId).toBe(ownerBefore);
    } finally {
      await cleanupCreatedInvitations(qaEventId, baselineInvitationIds);
      await partnerContext.close();
      await ownerContext.close();
    }
  });
});
