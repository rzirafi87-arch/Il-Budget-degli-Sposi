import { expect, test } from "@playwright/test";
import {
  createLocationSupplierFixture,
  createQaIdentity,
  deleteLocationSupplierFixture,
  deleteQaIdentity,
  login,
  milestone8FixtureReady,
  type LocationSupplierFixture,
} from "./helpers/milestone8-fixtures";

const localizedTitles: Record<string, string> = {
  it: "Location e fornitori collegati",
  en: "Connected venues and suppliers",
  es: "Lugares y proveedores conectados",
  fr: "Lieux et prestataires associés",
  de: "Verknüpfte Locations und Dienstleister",
};

for (const width of [320, 430] as const) {
  test(`[M3][associations-${width}] authenticated Location-Supplier CRUD at ${width}`, async ({ page }, testInfo) => {
    expect(testInfo.project.name).toBe(`m8-${width}`);
    expect(milestone8FixtureReady).toBe(true);
    const identity = await createQaIdentity(`m3-${width}`);
    let fixture: LocationSupplierFixture | null = null;
    try {
      fixture = await createLocationSupplierFixture(identity);
      await login(page, identity);
      await page.goto(`/it/location/${fixture.locationId}`);
      await expect(page.getByRole("heading", { name: fixture.locationName, exact: true })).toBeVisible();
      const associations = page.getByRole("region", { name: localizedTitles.it });
      await expect(associations.getByText("Globale", { exact: true })).toBeVisible();
      await expect(associations.getByRole("link", { name: fixture.supplierName, exact: true })).toBeVisible();
      await expect(associations.getByText("Nessuna associazione privata per questo elemento.", { exact: true })).toBeVisible();

      const supplierSelect = associations.getByTestId("association-counterpart-select");
      await expect(supplierSelect).toHaveAccessibleName("Fornitore");
      await supplierSelect.selectOption({ index: 1 }, { timeout: 10_000 });
      await expect(supplierSelect).not.toHaveValue("");
      await associations.getByLabel("Note private", { exact: true }).last().fill("QA-M3 nota iniziale");
      const createResponse = page.waitForResponse(response =>
        response.request().method() === "POST"
        && new URL(response.url()).pathname === "/api/my/location-supplier-associations"
      );
      const addButton = associations.getByRole("button", { name: "Aggiungi", exact: true });
      await expect(addButton).toBeEnabled();
      await addButton.click();
      const createdResponse = await createResponse;
      expect(createdResponse.status()).toBe(201);
      const createdBody = await createdResponse.json() as { association: { id: string } };
      await expect(associations.getByText("Privata", { exact: true })).toBeVisible();
      console.info(`[M3-${width}] create complete`);

      const privateItem = associations.getByTestId(`private-association-${createdBody.association.id}`);
      await expect(privateItem).toContainText(fixture.supplierName);
      await privateItem.getByTestId("association-private-notes").fill("QA-M3 nota aggiornata");
      const updateResponse = page.waitForResponse(response =>
        response.request().method() === "PATCH"
        && new URL(response.url()).pathname === "/api/my/location-supplier-associations"
      );
      await privateItem.getByTestId("association-save").click();
      expect((await updateResponse).status()).toBe(200);
      console.info(`[M3-${width}] update complete`);

      await page.goto(`/it/fornitori/${fixture.supplierId}`);
      await expect(page.getByRole("heading", { name: fixture.supplierName, exact: true })).toBeVisible();
      const supplierAssociations = page.getByRole("region", { name: localizedTitles.it });
      const supplierPrivateItem = supplierAssociations.getByTestId(`private-association-${createdBody.association.id}`);
      await expect(supplierPrivateItem).toContainText(fixture.locationName);
      await expect(supplierPrivateItem.getByTestId("association-private-notes")).toHaveValue("QA-M3 nota aggiornata");
      await expect(supplierAssociations.getByRole("link", { name: fixture.locationName, exact: true })).toBeVisible();
      console.info(`[M3-${width}] inverse view complete`);

      if (width === 430) {
        for (const colorScheme of ["light", "dark"] as const) {
          await page.emulateMedia({ colorScheme });
          await page.reload();
          await expect(page.getByRole("heading", { name: localizedTitles.it, exact: true })).toBeVisible();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
        }
      }

      if (width === 320) {
        for (const [locale, title] of Object.entries(localizedTitles)) {
          await page.goto(`/${locale}/location/${fixture.locationId}`);
          await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
          await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
        }
      }
      console.info(`[M3-${width}] display matrix complete`);

      await page.goto(`/it/fornitori/${fixture.supplierId}`);
      const deleteResponse = page.waitForResponse(response =>
        response.request().method() === "DELETE"
        && new URL(response.url()).pathname === "/api/my/location-supplier-associations"
      );
      await page.getByTestId(`private-association-${createdBody.association.id}`).getByTestId("association-remove").click();
      expect((await deleteResponse).status()).toBe(200);
      await expect(page.getByText("Nessuna associazione privata per questo elemento.", { exact: true })).toBeVisible();
      console.info(`[M3-${width}] delete complete`);
    } finally {
      if (fixture) {
        await deleteLocationSupplierFixture(fixture);
        console.info(`[M3-${width}] fixture cleanup complete`);
      }
      await deleteQaIdentity(identity);
      console.info(`[M3-${width}] identity cleanup complete`);
    }
  });
}
