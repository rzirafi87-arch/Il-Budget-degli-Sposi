import itMessages from "../it.json";

describe("church catalog ceremony CTA", () => {
  it("uses neutral ceremony navigation while preserving the catalog action", () => {
    expect(itMessages.locationCeremony).toBe("Cerimonia");
    expect(itMessages.suppliersChurches.catalog.save).toBe("Aggiungi Chiesa");
  });
});
