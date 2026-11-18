import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { createQaIdentity, login } from "./helpers/milestone8-fixtures";

test("[18] party setup, expense, RSVP, sign-in and event isolation", async ({ page }) => {
  const url = process.env.PLAYWRIGHT_SUPABASE_URL!;
  expect(["127.0.0.1", "localhost"]).toContain(new URL(url).hostname);
  const user = await createQaIdentity("party18");
  // The workflow destroys this isolated database and its identities after the test.
  {
    await login(page, user);
    await page.goto("/it/select-country");
    await page.getByRole("button", {name:"Italia", exact:true}).click();
    await page.getByRole("button", {name:/^avanti$/i}).click();
    await page.getByRole("button", {name:/18|diciott/i}).first().click();
    await page.getByLabel("Nome di chi compie 18 anni").fill("Sofia QA");
    await page.getByLabel("Data della festa").fill("2027-05-01");
    await page.getByLabel("Budget iniziale").fill("1500");
    await page.getByRole("button", {name:"Organizza la festa"}).click();
    await expect(page.getByRole("heading", {name:"Sofia QA"})).toBeVisible();
    await page.getByLabel("Categoria").selectOption("cake");
    await page.getByLabel("Importo").fill("120");
    await page.getByRole("button", {name:"Registra spesa"}).click();
    const balance = page.getByText("Disponibilità dopo le spese pagate").locator("..");
    await expect(balance).toContainText("1.380");
    const auth = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const session = await auth.auth.signInWithPassword(user);
    const headers = { Authorization: "Bearer " + session.data.session!.access_token };
    const guests = { familyGroups: [], nonInvitedRecipients: [], guests: [{ id:randomUUID(), name:"Alex QA", guestType:"common", attending:true, rsvpReceived:true }] };
    expect((await page.request.post("/api/my/guests", {headers, data:guests})).ok()).toBe(true);
    await page.goto("/it/profilo");
    await page.getByRole("button", {name:/esci/i}).click();
    await page.waitForURL(/\/it\/?$/);
    await login(page, user);
    await page.goto("/it/dashboard");
    await page.reload();
    await expect(balance).toContainText("1.380");
    const snapshot = await page.request.get("/api/my/guests", {headers});
    expect((await snapshot.json()).guests).toEqual([expect.objectContaining({name:"Alex QA", attending:true, rsvpReceived:true})]);
    for (const locale of ["it","en","es","fr","de"]) {
      await page.goto("/" + locale + "/dashboard");
      await expect(page.getByRole("heading", {name:"Sofia QA"})).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const wedding = await page.request.post("/api/event/ensure-default", {headers, data:{eventType:"wedding", country:"it", language:"it", createAdditional:true}});
    expect(wedding.ok()).toBe(true);
    const {eventId} = await wedding.json();
    // Chromium owns the active-event cookie used by the real dashboard.
    await page.evaluate(async ({headers, eventId}) => {
      const selected = await fetch("/api/my/current-event", {method:"POST",
        headers:{...headers,"Content-Type":"application/json"}, body:JSON.stringify({eventId})});
      if (!selected.ok) throw new Error("Event selection failed: " + selected.status);
    }, {headers, eventId});
    const otherGuests = await page.evaluate(async headers => {
      const r = await fetch("/api/my/guests", {headers});
      if (!r.ok) throw new Error("Guest read failed: " + r.status);
      return (await r.json()).guests;
    }, headers);
    expect(otherGuests).toHaveLength(0);
    expect(await page.evaluate(async headers => (await fetch("/api/my/eighteenth-dashboard", {headers})).status, headers)).toBe(409);
    await page.goto("/it/dashboard");
    await expect(page.getByRole("progressbar")).toBeVisible();
    await page.getByRole("button", { name: /^apri impostazioni$/i }).click();
    const settings = page.getByRole("dialog", { name: "Impostazioni", exact: true });
    await expect(settings.getByRole("link", { name: "Aggiungi un evento" })).toHaveAttribute("href", "/it/select-event-type?new=1");
    const selector = settings.getByRole("combobox", { name: /Cambia evento/i });
    const partyId = await selector.getByRole("option", { name: /Sofia QA/ }).getAttribute("value");
    expect(partyId).toBeTruthy();
    await selector.selectOption(partyId!);
    await settings.getByRole("button", { name: "Cambia evento", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Sofia QA" })).toBeVisible();
    await expect(balance).toContainText("1.380");
  }
});
