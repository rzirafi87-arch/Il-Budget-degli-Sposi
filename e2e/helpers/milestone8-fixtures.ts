import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";

const url = process.env.PLAYWRIGHT_SUPABASE_URL;
const serviceRole = process.env.PLAYWRIGHT_SUPABASE_SERVICE_ROLE_KEY;
const emailDomain = process.env.PLAYWRIGHT_QA_EMAIL_DOMAIN;

export const milestone8FixtureReady = Boolean(url && serviceRole && emailDomain);

export type QaIdentity = { id: string; email: string; password: string; marker: string };

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

export async function login(page: Page, identity: Pick<QaIdentity, "email" | "password">) {
  await page.goto("/it/auth");
  const main = page.locator("main");
  await main.getByLabel("Email", { exact: true }).fill(identity.email);
  await main.getByLabel("Password", { exact: true }).fill(identity.password);
  await main.getByRole("button", { name: /accedi/i }).click();
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
