import itMessages from "../it.json";

describe("church catalog ceremony CTA", () => {
  it("keeps the Location Cerimonia add-church action visible in Italian", () => {
    expect(itMessages.locationCeremony).toBe("Location Cerimonia");
    expect(itMessages.suppliersChurches.catalog.save).toBe("Aggiungi Chiesa");
  });
});
