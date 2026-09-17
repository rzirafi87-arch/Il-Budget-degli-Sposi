import { createHash, randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;
const resendApiKey = process.env.PLAYWRIGHT_RESEND_API_KEY;
const serviceRole = process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mailboxBase = process.env.PLAYWRIGHT_SIGNUP_EMAIL_BASE || process.env.PLAYWRIGHT_TEST_EMAIL;

type SentEmail = {
  id: string;
  to: string[];
  subject: string;
  created_at: string;
  last_event?: string;
};

function uniqueMailbox(base: string) {
  const at = base.lastIndexOf("@");
  if (at <= 0) throw new Error("QA signup mailbox is invalid.");
  const local = base.slice(0, at).split("+")[0];
  const domain = base.slice(at + 1);
  return `${local}+b51-${Date.now()}-${randomBytes(4).toString("hex")}@${domain}`;
}

async function resend<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.resend.com${path}`, {
    headers: { Authorization: `Bearer ${resendApiKey!}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`QA email audit failed with HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}

async function deliveredConfirmation(startedAt: number, recipient: string) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const listed = await resend<{ data: SentEmail[] }>("/emails?limit=100");
    const message = listed.data.find(item =>
      Date.parse(item.created_at) >= startedAt
      && item.subject === "Conferma il tuo account – Il Budget degli Sposi"
      && item.to.some(address => address.toLowerCase() === recipient.toLowerCase()));
    if (message) {
      const detail = await resend<SentEmail & { html?: string }>(`/emails/${encodeURIComponent(message.id)}`);
      if (["bounced", "complained", "failed", "canceled"].includes(detail.last_event || "")) {
        throw new Error("QA confirmation email reached a terminal delivery failure.");
      }
      if (detail.last_event === "delivered" && detail.html) {
        const links = [...detail.html.matchAll(/href=["']([^"']+)["']/gi)]
          .map(match => match[1].replaceAll("&amp;", "&"))
          .filter(value => value.startsWith("https://"));
        const verification = links.find(value => {
          try {
            const url = new URL(value);
            return url.pathname.endsWith("/auth/v1/verify") && url.searchParams.get("type") === "signup";
          } catch {
            return false;
          }
        });
        if (!verification) throw new Error("QA confirmation email did not contain a valid verification link.");
        return verification;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 2_000));
  }
  throw new Error("QA confirmation email was not delivered within the allowed interval.");
}

async function followConfirmation(link: string, expectedOrigin: string) {
  const verified = await fetch(link, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
  const callbackValue = verified.headers.get("location");
  if (!callbackValue) throw new Error("QA verification did not return an application callback.");
  const callback = new URL(callbackValue);
  if (callback.origin !== expectedOrigin || callback.pathname !== "/auth/callback" || !callback.searchParams.has("code")) {
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
  const safeDestination = new URL(destination, expectedOrigin);
  if (safeDestination.origin !== expectedOrigin || !safeDestination.pathname.startsWith("/it/")) {
    throw new Error("QA confirmation callback escaped the application origin.");
  }
}

test("real signup email confirmation, login, CurrentEvent, relogin and cleanup", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "it-390", "The destructive Production signup journey runs exactly once.");
  const missing = [baseUrl, resendApiKey, serviceRole, supabaseUrl, anonKey, mailboxBase].some(value => !value);
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

    const verificationLink = await deliveredConfirmation(startedAt, email);
    await followConfirmation(verificationLink, new URL(baseUrl!).origin);

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
    if (eventId && ownerId) {
      const owned = await admin.from("events").select("id,owner_id").eq("id", eventId).maybeSingle();
      if (owned.data?.owner_id !== ownerId) throw new Error("Refusing QA cleanup for an unowned event.");
      const removedEvent = await admin.from("events").delete().eq("id", eventId).eq("owner_id", ownerId).select("id");
      if (removedEvent.error || removedEvent.data?.length !== 1) throw new Error("QA event cleanup failed.");
    }
    if (ownerId) {
      const owner = await admin.auth.admin.getUserById(ownerId);
      const marker = owner.data.user?.user_metadata?.registration_request_id;
      const expectedEmailHash = createHash("sha256").update(email).digest("hex");
      const actualEmailHash = owner.data.user?.email
        ? createHash("sha256").update(owner.data.user.email.toLowerCase()).digest("hex")
        : "";
      if (!marker || actualEmailHash !== expectedEmailHash) throw new Error("Refusing QA cleanup for an unverified owner.");
      const removedOwner = await admin.auth.admin.deleteUser(ownerId, false);
      if (removedOwner.error) throw new Error("QA owner cleanup failed.");
    }
    if (eventId) {
      const eventAfter = await admin.from("events").select("id").eq("id", eventId).maybeSingle();
      expect(eventAfter.data).toBeNull();
    }
    if (ownerId) {
      const [ownerAfter, profileAfter, membershipAfter] = await Promise.all([
        admin.auth.admin.getUserById(ownerId),
        admin.from("profiles").select("id").eq("id", ownerId).maybeSingle(),
        admin.from("event_members").select("id").eq("user_id", ownerId).maybeSingle(),
      ]);
      expect(ownerAfter.data.user).toBeNull();
      expect(profileAfter.data).toBeNull();
      expect(membershipAfter.data).toBeNull();
    }
  }
});
