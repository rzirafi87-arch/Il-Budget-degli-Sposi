import { expect, test } from "@playwright/test";
import {
  createLocationSupplierFixture,
  createQaIdentity,
  deleteLocationSupplierFixture,
  deleteQaIdentity,
  login,
  milestone8FixtureReady,
  waitForPublicCatalogFixture,
  type LocationSupplierFixture,
} from "./helpers/milestone8-fixtures";

const locales = ["it", "en", "es", "fr", "de"] as const;

for (const width of [320, 430] as const) {
  test(`[M4][supplier-work-${width}] authenticated supplier Timeline and appointments journey at ${width}`, async ({ page }, testInfo) => {
    expect(testInfo.project.name).toBe(`m8-${width}`);
    expect(milestone8FixtureReady).toBe(true);
    const identity = await createQaIdentity(`m4-${width}`);
    let fixture: LocationSupplierFixture | null = null;
    let timelineId = "";
    let appointmentId = "";
    const taskTitle = `QA-M4 Timeline ${width}`;
    const appointmentTitle = `QA-M4 Appointment ${width}`;

    try {
      fixture = await createLocationSupplierFixture(identity);
      await login(page, identity);

      await page.goto("/it/timeline");
      const timelineForm = page.getByTestId("timeline-create-form");
      await expect(timelineForm).toBeVisible();
      await timelineForm.getByLabel("Titolo", { exact: true }).fill(taskTitle);
      await timelineForm.getByLabel("Descrizione", { exact: true }).fill("Collegamento manuale M4");
      await timelineForm.getByTestId("timeline-create-supplier").selectOption(`saved:${fixture.savedSupplierId}`);
      const timelineCreate = page.waitForResponse(response =>
        response.request().method() === "POST"
        && new URL(response.url()).pathname === "/api/my/timeline"
      );
      await timelineForm.getByRole("button", { name: "Aggiungi attività", exact: true }).click();
      const timelineCreateResponse = await timelineCreate;
      expect(timelineCreateResponse.status()).toBe(201);
      const timelineBody = await timelineCreateResponse.json() as { items: Array<{ id: string }> };
      timelineId = timelineBody.items[0]?.id ?? "";
      expect(timelineId).not.toBe("");
      const timelineItem = page.getByTestId(`timeline-item-${timelineId}`);
      await expect(timelineItem.getByRole("link", { name: fixture.supplierName, exact: true })).toBeVisible();

      const timelineSelect = timelineItem.getByTestId(`timeline-supplier-${timelineId}`);
      const timelinePrivateUpdate = page.waitForResponse(response => response.request().method() === "PUT" && new URL(response.url()).pathname === "/api/my/timeline");
      await timelineSelect.selectOption(`private:${fixture.privateSupplierId}`);
      expect((await timelinePrivateUpdate).status()).toBe(200);
      await expect(timelineItem.getByRole("link", { name: fixture.privateSupplierName, exact: true })).toBeVisible();

      const timelineUnlink = page.waitForResponse(response => response.request().method() === "PUT" && new URL(response.url()).pathname === "/api/my/timeline");
      await timelineSelect.selectOption("");
      expect((await timelineUnlink).status()).toBe(200);
      await expect(timelineItem.getByRole("link", { name: fixture.privateSupplierName, exact: true })).toHaveCount(0);

      const timelineRelink = page.waitForResponse(response => response.request().method() === "PUT" && new URL(response.url()).pathname === "/api/my/timeline");
      await timelineSelect.selectOption(`private:${fixture.privateSupplierId}`);
      expect((await timelineRelink).status()).toBe(200);
      await expect(timelineItem.getByRole("link", { name: fixture.privateSupplierName, exact: true })).toBeVisible();

      await page.goto("/it/documenti/appuntamenti");
      const appointmentForm = page.getByTestId("appointment-create-form");
      await expect(appointmentForm).toBeVisible();
      await appointmentForm.getByLabel("Titolo", { exact: true }).fill(appointmentTitle);
      await appointmentForm.getByLabel("Luogo", { exact: true }).fill("Roma");
      await appointmentForm.getByTestId("appointment-create-supplier").selectOption(`private:${fixture.privateSupplierId}`);
      const appointmentCreate = page.waitForResponse(response => response.request().method() === "POST" && new URL(response.url()).pathname === "/api/my/appointments");
      await appointmentForm.getByRole("button", { name: "Aggiungi appuntamento", exact: true }).click();
      const appointmentCreateResponse = await appointmentCreate;
      expect(appointmentCreateResponse.status()).toBe(201);
      const appointmentBody = await appointmentCreateResponse.json() as { appointment: { id: string } };
      appointmentId = appointmentBody.appointment.id;
      const appointmentItem = page.getByTestId(`appointment-${appointmentId}`);
      await expect(appointmentItem.getByRole("link", { name: fixture.privateSupplierName, exact: true })).toBeVisible();

      const appointmentSavedUpdate = page.waitForResponse(response => response.request().method() === "PATCH" && new URL(response.url()).pathname === `/api/my/appointments/${appointmentId}`);
      await appointmentItem.getByTestId(`appointment-supplier-${appointmentId}`).selectOption(`saved:${fixture.savedSupplierId}`);
      expect((await appointmentSavedUpdate).status()).toBe(200);
      await expect(appointmentItem.getByRole("link", { name: fixture.supplierName, exact: true })).toBeVisible();

      await page.goto(`/it/fornitori/privati/${fixture.privateSupplierId}`);
      await expect(page.getByRole("heading", { name: fixture.privateSupplierName, exact: true })).toBeVisible();
      const privateSummary = page.getByTestId("supplier-work-summary");
      await expect(privateSummary.getByText(taskTitle, { exact: true })).toBeVisible();
      await expect(privateSummary.getByRole("link", { name: "Apri Timeline", exact: true })).toBeVisible();

      await waitForPublicCatalogFixture(page, "supplier", fixture.supplierId, fixture.supplierName);
      await page.goto(`/it/fornitori/${fixture.supplierId}`);
      const savedSummary = page.getByTestId("supplier-work-summary");
      const appointmentSummary = savedSummary.getByRole("listitem").filter({ hasText: appointmentTitle });
      await expect(appointmentSummary).toBeVisible();
      await expect(appointmentSummary).toContainText(appointmentTitle);
      await expect(savedSummary.getByRole("link", { name: "Apri appuntamenti", exact: true })).toBeVisible();

      if (width === 430) {
        for (const colorScheme of ["light", "dark"] as const) {
          await page.emulateMedia({ colorScheme });
          await page.reload();
          await expect(page.getByTestId("supplier-work-summary")).toBeVisible();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
        }
      }

      if (width === 320) {
        for (const locale of locales) {
          await page.goto(`/${locale}/fornitori/privati/${fixture.privateSupplierId}`);
          await expect(page.getByRole("heading", { name: fixture.privateSupplierName, exact: true })).toBeVisible();
          await expect(page.getByTestId("supplier-work-summary")).toBeVisible();
          await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
        }
      }

      await page.goto("/it/timeline");
      page.once("dialog", dialog => dialog.accept());
      const timelineDelete = page.waitForResponse(response => response.request().method() === "DELETE" && new URL(response.url()).pathname === "/api/my/timeline");
      await page.getByTestId(`timeline-item-${timelineId}`).getByRole("button", { name: `Elimina ${taskTitle}`, exact: true }).click();
      expect((await timelineDelete).status()).toBe(200);
      await expect(page.getByTestId(`timeline-item-${timelineId}`)).toHaveCount(0);

      await page.goto("/it/documenti/appuntamenti");
      page.once("dialog", dialog => dialog.accept());
      const appointmentDelete = page.waitForResponse(response => response.request().method() === "DELETE" && new URL(response.url()).pathname === `/api/my/appointments/${appointmentId}`);
      await page.getByTestId(`appointment-${appointmentId}`).getByRole("button", { name: `Elimina ${appointmentTitle}`, exact: true }).click();
      expect((await appointmentDelete).status()).toBe(200);
      await expect(page.getByTestId(`appointment-${appointmentId}`)).toHaveCount(0);
      console.info(`[M4-${width}] CRUD, inverse views, display matrix, and delete complete`);
    } finally {
      if (fixture) {
        await deleteLocationSupplierFixture(fixture);
        console.info(`[M4-${width}] fixture cleanup complete`);
      }
      await deleteQaIdentity(identity);
      console.info(`[M4-${width}] identity cleanup complete`);
    }
  });
}
