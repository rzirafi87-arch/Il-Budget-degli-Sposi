import { localizedHref, localizePathname, localeFromPathname } from "../runtimeRouting";

describe("runtime locale routing", () => {
  it("replaces only the locale segment", () => {
    expect(localizePathname("/it/reset-password", "en")).toBe("/en/reset-password");
    expect(localizePathname("/documenti", "fr")).toBe("/fr/documenti");
  });

  it("preserves query string and hash", () => {
    expect(localizedHref("/it/reset-password", "de", "?next=%2Fit%2Fdocumenti", "#password"))
      .toBe("/de/reset-password?next=%2Fit%2Fdocumenti#password");
  });

  it("resolves a valid locale from a deep link", () => {
    expect(localeFromPathname("/es/documenti/contratti")).toBe("es");
    expect(localeFromPathname("/documenti")).toBe("it");
  });
});
