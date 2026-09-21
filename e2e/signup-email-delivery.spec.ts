import { createHash, randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  emailAuditConfigured,
  resolveTransactionalEmailLink,
  transactionalEmailLinks,
  transactionalEmailLinkMetadata,
  waitForTransactionalEmail,
} from "./helpers/transactional-email-audit";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;
const serviceRole = process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mailboxBase = process.env.PLAYWRIGHT_SIGNUP_EMAIL_BASE
  || process.env.PLAYWRIGHT_PARTNER_EMAIL
  || process.env.PLAYWRIGHT_TEST_EMAIL;

function uniqueMailbox(base: string) {
  const at = base.lastIndexOf("@");
  if (at <= 0) throw new Error("QA signup mailbox is invalid.");
  const local = base.slice(0, at).split("+")[0];
  const domain = base.slice(at + 1);
  return `${local}+b51-${Date.now()}-${randomBytes(4).toString("hex")}@${domain}`;
}

async function deliveredConfirmation(startedAt: number, recipient: string, expectedType: "signup" | "email" = "signup") {
  const message = await waitForTransactionalEmail({
    recipient,
    requireDelivered: true,
    requireLink: true,
    startedAt,
    subject: "Conferma il tuo account – Il Budget degli Sposi",
    timeoutMs: 120_000,
  });
  const rawLinks = transactionalEmailLinks(message.body);
  const links = await Promise.all(rawLinks.map(resolveTransactionalEmailLink));
  const verification = links.find(value => {
    try {
      const url = new URL(value);
      return url.pathname === "/auth/callback"
        && url.searchParams.get("type") === expectedType
        && Boolean(url.searchParams.get("token_hash"));
    } catch {
      return false;
    }
  });
  if (!verification) {
    throw new Error(`QA confirmation email did not contain a valid verification link. Metadata: ${JSON.stringify(transactionalEmailLinkMetadata(links))}`);
  }
  return verification;
}

async function followConfirmation(link: string, expectedOrigin: string, expectedType: "signup" | "email" = "signup") {
  const expectedHost = new URL(expectedOrigin).hostname;
  const isApprovedOrigin = (value: URL) => value.origin === expectedOrigin || (
    expectedHost.endsWith(".vercel.app")
    && value.protocol === "https:"
    && value.hostname.startsWith("il-budget-degli-sposi-")
    && value.hostname.endsWith("-rzirafi87-archs-projects.vercel.app")
  );
  const callback = new URL(link);
  if (!isApprovedOrigin(callback)
    || callback.pathname !== "/auth/callback"
    || callback.searchParams.get("type") !== expectedType
    || !callback.searchParams.has("token_hash")) {
    throw new Error("QA verification returned an invalid callback destination.");
  }
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const completed = await fetch(callback, {
    redirect: "manual",
    headers: bypass ? { "x-vercel-protection-bypass": bypass } : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const destination = completed.headers.get("location");
  if (![302, 303, 307, 308].includes(completed.status) || !destination) {
    throw new Error("QA confirmation callback did not complete.");
  }
  const safeDestination = new URL(destination, callback.origin);
  if (!isApprovedOrigin(safeDestination) || !safeDestination.pathname.startsWith("/it/")) {
    throw new Error("QA confirmation callback escaped the application origin.");
  }
}

test("real signup email confirmation, login, CurrentEvent, relogin and cleanup", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "it-390", "The destructive Production signup journey runs exactly once.");
  const missing = [baseUrl, serviceRole, supabaseUrl, anonKey, mailboxBase].some(value => !value)
    || !emailAuditConfigured();
  test.skip(missing, "Real signup delivery requires the configured QA provider and Supabase secrets.");
  test.setTimeout(240_000);

  const email = uniqueMailbox(mailboxBase!);
  const password = `B51!${randomBytes(18).toString("base64url")}a9`;
  const admin = createClient(supabaseUrl!, serviceRole!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const publicClient = () => createClient(supabaseUrl!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const startedAt = Date.now();
  let ownerId: string | undefined;
  let eventId: string | undefined;

  try {
    const registered = await request.post("/api/auth/register", {
      data: { primaryEmail: email, password, eventType: "wedding", next: "/it/dashboard" },
    });
    const registeredBody = await registered.json().catch(() => ({})) as { ok?: boolean; code?: string; eventId?: string };
    expect(registered.status(), `Signup failed with ${registeredBody.code || "UNKNOWN_CODE"}.`).toBe(200);
    expect(registeredBody.ok).toBe(true);
    eventId = registeredBody.eventId;
    expect(eventId).toBeTruthy();

    const owner = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const created = owner.data.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
    if (!created) throw new Error("QA signup owner was not created.");
    ownerId = created.id;
    expect(created.email_confirmed_at).toBeFalsy();

    const beforeConfirmation = await publicClient().auth.signInWithPassword({ email, password });
    expect(beforeConfirmation.data.session).toBeNull();
    expect(beforeConfirmation.error?.message.toLowerCase()).toContain("email not confirmed");

    await deliveredConfirmation(startedAt, email);
    const resendStartedAt = Date.now();
    const resent = await request.post("/api/auth/resend", { data: { email } });
    expect(resent.status()).toBe(200);
    expect(await resent.json()).toMatchObject({ ok: true });

    const verificationLink = await deliveredConfirmation(resendStartedAt, email, "email");
    await followConfirmation(verificationLink, new URL(baseUrl!).origin, "email");

    const confirmed = await admin.auth.admin.getUserById(ownerId);
    expect(confirmed.data.user?.email_confirmed_at).toBeTruthy();

    const firstClient = publicClient();
    const firstLogin = await firstClient.auth.signInWithPassword({ email, password });
    expect(firstLogin.error).toBeNull();
    expect(firstLogin.data.session?.user.id).toBe(ownerId);
    const current = await request.get("/api/my/current-event", {
      headers: { Authorization: `Bearer ${firstLogin.data.session!.access_token}` },
    });
    const currentBody = await current.json() as { status?: string; currentEvent?: { eventId?: string; accessRole?: string } };
    expect(current.status()).toBe(200);
    expect(currentBody.status).toBe("RESOLVED");
    expect(currentBody.currentEvent).toMatchObject({ eventId, accessRole: "owner" });
    expect((await firstClient.auth.signOut()).error).toBeNull();

    const secondClient = publicClient();
    const secondLogin = await secondClient.auth.signInWithPassword({ email, password });
    expect(secondLogin.error).toBeNull();
    expect(secondLogin.data.session?.user.id).toBe(ownerId);
    expect((await secondClient.auth.signOut()).error).toBeNull();
  } finally {
    let cleanupOwnerId = ownerId;
    if (eventId && !cleanupOwnerId) {
      const owned = await admin.from("events").select("owner_id").eq("id", eventId).maybeSingle();
      if (owned.error) throw new Error("QA event cleanup owner lookup failed.");
      cleanupOwnerId = owned.data?.owner_id;
    }
    if (eventId && !cleanupOwnerId) {
      throw new Error("QA event cleanup owner is unavailable.");
    }
    if (cleanupOwnerId) {
      const owner = await admin.auth.admin.getUserById(cleanupOwnerId);
      const marker = owner.data.user?.user_metadata?.registration_request_id;
      const expectedEmailHash = createHash("sha256").update(email).digest("hex");
      const actualEmailHash = owner.data.user?.email
        ? createHash("sha256").update(owner.data.user.email.toLowerCase()).digest("hex")
        : "";
      if (!marker || actualEmailHash !== expectedEmailHash) throw new Error("Refusing QA cleanup for an unverified owner.");
    }
    if (eventId && cleanupOwnerId) {
      const owned = await admin.from("events").select("id,owner_id").eq("id", eventId).maybeSingle();
      if (owned.data?.owner_id !== cleanupOwnerId) throw new Error("Refusing QA cleanup for an unowned event.");
      const removedEvent = await admin.from("events").delete().eq("id", eventId).eq("owner_id", cleanupOwnerId).select("id");
      if (removedEvent.error || removedEvent.data?.length !== 1) throw new Error("QA event cleanup failed.");
    }
    if (cleanupOwnerId) {
      const removedOwner = await admin.auth.admin.deleteUser(cleanupOwnerId, false);
      if (removedOwner.error) throw new Error("QA owner cleanup failed.");
    }
    if (eventId) {
      const eventAfter = await admin.from("events").select("id").eq("id", eventId).maybeSingle();
      expect(eventAfter.data).toBeNull();
    }
    if (cleanupOwnerId) {
      const [ownerAfter, profileAfter, membershipAfter] = await Promise.all([
        admin.auth.admin.getUserById(cleanupOwnerId),
        admin.from("profiles").select("id").eq("id", cleanupOwnerId).maybeSingle(),
        admin.from("event_members").select("id").eq("user_id", cleanupOwnerId).maybeSingle(),
      ]);
      expect(ownerAfter.data.user).toBeNull();
      expect(profileAfter.data).toBeNull();
      expect(membershipAfter.data).toBeNull();
    }
  }
});
