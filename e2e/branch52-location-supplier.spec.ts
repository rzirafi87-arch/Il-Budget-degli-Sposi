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

      await associations.getByLabel("Fornitore", { exact: true }).selectOption({
        label: `${fixture.supplierName} — snapshot globale salvato`,
      });
      await associations.getByLabel("Note private", { exact: true }).last().fill("QA-M3 nota iniziale");
      const createResponse = page.waitForResponse(response =>
        response.request().method() === "POST"
        && new URL(response.url()).pathname === "/api/my/location-supplier-associations"
      );
      await associations.getByRole("button", { name: "Aggiungi", exact: true }).click();
      expect((await createResponse).status()).toBe(201);
      await expect(associations.getByText("Privata", { exact: true })).toBeVisible();

      const privateItem = associations.getByRole("listitem")
        .filter({ hasText: fixture.supplierName })
        .filter({ hasText: "Privata" });
      await privateItem.getByLabel("Note private", { exact: true }).fill("QA-M3 nota aggiornata");
      const updateResponse = page.waitForResponse(response =>
        response.request().method() === "PATCH"
        && new URL(response.url()).pathname === "/api/my/location-supplier-associations"
      );
      await privateItem.getByRole("button", { name: "Salva modifiche", exact: true }).click();
      expect((await updateResponse).status()).toBe(200);

      await page.goto(`/it/fornitori/${fixture.supplierId}`);
      await expect(page.getByRole("heading", { name: fixture.supplierName, exact: true })).toBeVisible();
      const supplierAssociations = page.getByRole("region", { name: localizedTitles.it });
      const supplierPrivateItem = supplierAssociations.getByRole("listitem")
        .filter({ hasText: fixture.locationName })
        .filter({ hasText: "Privata" });
      await expect(supplierPrivateItem.getByLabel("Note private", { exact: true })).toHaveValue("QA-M3 nota aggiornata");
      await expect(supplierAssociations.getByRole("link", { name: fixture.locationName, exact: true })).toBeVisible();

      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        await page.reload();
        await expect(page.getByRole("heading", { name: localizedTitles.it, exact: true })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      }

      for (const [locale, title] of Object.entries(localizedTitles)) {
        await page.goto(`/${locale}/location/${fixture.locationId}`);
        await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
        await expect(page.locator("body")).not.toContainText("MISSING_MESSAGE");
      }

      await page.goto(`/it/fornitori/${fixture.supplierId}`);
      const deleteResponse = page.waitForResponse(response =>
        response.request().method() === "DELETE"
        && new URL(response.url()).pathname === "/api/my/location-supplier-associations"
      );
      await page.getByRole("region", { name: localizedTitles.it }).getByRole("button", { name: "Rimuovi", exact: true }).click();
      expect((await deleteResponse).status()).toBe(200);
      await expect(page.getByText("Nessuna associazione privata per questo elemento.", { exact: true })).toBeVisible();
    } finally {
      if (fixture) await deleteLocationSupplierFixture(fixture);
      await deleteQaIdentity(identity);
    }
  });
}
