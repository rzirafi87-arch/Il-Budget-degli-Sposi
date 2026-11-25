import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { createQaIdentity, deleteQaIdentity, type QaIdentity } from "./helpers/milestone8-fixtures";
import { blankPlan } from "../src/features/events/baptism/model";

async function signIn(page: Page, identity: QaIdentity) {
  await page.goto("/it/auth?next=%2Fit%2Fbattesimo");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(identity.email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(identity.password);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await expect(page).toHaveURL(/\/it\/battesimo(?:\?|$)/);
}

// Real database and UI writes, exclusively in the disposable loopback stack.
// Email delivery is a separate live gate; fixture confirmation cannot certify it.
test("[BAPTISM] mobile planner, payments, reload, modules and re-entry", async ({ page }, info) => {
  test.setTimeout(180_000);
  const url = process.env.PLAYWRIGHT_SUPABASE_URL!;
  expect(["127.0.0.1", "localhost"]).toContain(new URL(url).hostname);
  expect(process.env.PLAYWRIGHT_LOCAL_SUPABASE).toBe("1");
  const identity = await createQaIdentity(`baptism-${info.project.name}`);
  const auth = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const eventId = randomUUID();
  const plan = { ...blankPlan(), name: `QA-M8-BAPTISM-${identity.marker}`, draft: false,
    ceremony: "2030-05-18T10:30", ceremonyConfirmed: true, community: "Comunità QA", venue: "Chiesa QA", address: "Piazza QA 1",
    scenario: "lunch" as const, place: "Ristorante QA", receptionAddress: "Via QA 2", time: "2030-05-18T13:00", receptionConfirmed: true,
    budget: "500", replyBy: "2030-05-08", replyContact: "Referente QA",
    guests: [{ id: randomUUID(), name: "Invitato QA", group: "Famiglia QA", contact: "Contatto privato QA", kind: "adult" as const,
      companionOf: "", ceremony: "yes" as const, reception: "yes" as const, menu: "adult" as const, food: "Nota privata QA", access: "" }],
    costs: [{ id: randomUUID(), name: "Torta QA", scope: "reception" as const, enabled: true, quantity: 1, unitCost: 120, quote: "",
      payments: [{ id: randomUUID(), amount: 20, date: "2030-01-10", note: "Acconto QA" }] }],
  };
  let journeyError: unknown;
  try {
    expect((await auth.auth.signInWithPassword(identity)).error).toBeNull();
    const created = await auth.rpc("save_family_baptism", { p_id: eventId, p_revision: 0, p_plan: plan });
    expect(created.error).toBeNull();
    await signIn(page, identity);
    await page.goto(`/it/battesimo?eventId=${eventId}`);
    await expect(page.getByRole("heading", { name: `Il battesimo di ${plan.name}`, exact: true })).toBeVisible();
    const noOverflow = async () => {
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
    };
    await noOverflow();
    for (const view of ["Modifica", "Invitati", "Budget del battesimo", "Checklist del battesimo", "Invito al battesimo", "Programma"]) {
      await page.getByRole("button", { name: view, exact: true }).first().click();
      await noOverflow();
      await page.screenshot({ path: info.outputPath(`baptism-${info.project.name}-${view.replaceAll(' ', '-')}.png`), fullPage: true });
    }
    await page.getByRole("button", { name: "Invitati", exact: true }).click();
    const guestName = page.getByLabel("Nome o nome del gruppo", { exact: true });
    await guestName.fill("");
    await page.getByRole("button", { name: "Salva", exact: true }).click();
    await expect(guestName).toBeFocused();
    await expect(guestName).toHaveAttribute("aria-invalid", "true");
    await guestName.fill("Invitato QA aggiornato");
    await page.getByRole("button", { name: "Salva", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Modifiche salvate.");
    await page.getByRole("button", { name: "Budget del battesimo", exact: true }).click();
    await page.getByRole("button", { name: "Registra pagamento", exact: true }).click();
    await page.getByLabel("Importo (€)", { exact: true }).fill("5");
    await page.getByRole("button", { name: "Salva", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Aggiungi o annulla il pagamento aperto");
    await expect(page.getByLabel("Importo (€)", { exact: true })).toHaveValue("5");
    await page.getByRole("button", { name: "Aggiungi pagamento", exact: true }).click();
    await page.getByRole("button", { name: "Salva", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Modifiche salvate.");
    await page.reload();
    await expect(page.getByRole("heading", { name: `Il battesimo di ${plan.name}`, exact: true })).toBeVisible();
    const stored = await auth.rpc("read_family_baptism", { p_id: eventId });
    expect(stored.error).toBeNull();
    expect(stored.data.plan.guests[0].name).toBe("Invitato QA aggiornato");
    expect(stored.data.plan.costs[0].payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0)).toBe(25);
    await page.getByRole("button", { name: "Invito al battesimo", exact: true }).click();
    const invite = page.getByRole("textbox", { name: "Anteprima invito", exact: true });
    expect(await invite.inputValue()).toContain(plan.name);
    expect(await invite.inputValue()).not.toContain("Nota privata QA");
    expect(await invite.inputValue()).not.toContain("Contatto privato QA");
    await noOverflow();
    for (const [label, path] of [["Fornitori", "fornitori"], ["Location del ritrovo", "location"], ["Documenti", "documenti"]]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/it/${path}`));
      await expect(page.locator("main").first()).toBeVisible();
      await noOverflow();
      await page.goto(`/it/battesimo?eventId=${eventId}`);
      await expect(page.getByRole("heading", { name: `Il battesimo di ${plan.name}`, exact: true })).toBeVisible();
    }
    await page.getByRole("button", { name: "Esci", exact: true }).click();
    await expect(page.getByRole("link", { name: "Organizza il battesimo", exact: true })).toBeVisible();
    await signIn(page, identity);
    await page.goto(`/it/battesimo?eventId=${eventId}`);
    await expect(page.getByRole("heading", { name: `Il battesimo di ${plan.name}`, exact: true })).toBeVisible();
    await noOverflow();
  } catch (error) {
    journeyError = error;
    throw error;
  } finally {
    await auth.auth.signOut();
    try { await deleteQaIdentity(identity); } catch (cleanupError) {
      if (journeyError) throw new AggregateError([journeyError, cleanupError], "Baptism journey and cleanup both failed");
      throw cleanupError;
    }
  }
});
