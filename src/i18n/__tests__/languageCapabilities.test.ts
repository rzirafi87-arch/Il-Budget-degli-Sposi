import { LANGS } from "@/lib/loadConfigs";
import {
  defaultLocale,
  getLanguageCapability,
  isPublicLocale,
  isSelectableLocale,
  languageCapabilities,
  publicLocales,
  visibleLanguages,
} from "../languageCapabilities";

describe("canonical language capability matrix", () => {
  it("publishes only audited READY locales", () => {
    expect(defaultLocale).toBe("it");
    expect(publicLocales).toEqual(["it"]);
    expect(getLanguageCapability("it")).toMatchObject({
      status: "READY",
      selectable: true,
      publicRouting: true,
      metadataReady: true,
      authReady: true,
      appReady: true,
    });
  });

  it.each(["en", "es", "fr", "de"])("marks %s as visible Coming Soon and not selectable", (locale) => {
    expect(getLanguageCapability(locale)).toMatchObject({
      status: "COMING_SOON",
      visible: true,
      selectable: false,
      publicRouting: false,
    });
    expect(isSelectableLocale(locale)).toBe(false);
    expect(isPublicLocale(locale)).toBe(false);
  });

  it("keeps technical and country-specific locales internal", () => {
    expect(getLanguageCapability("mx")).toMatchObject({ status: "INTERNAL_ONLY", visible: false });
    expect(getLanguageCapability("ar")).toMatchObject({ status: "INTERNAL_ONLY", visible: false });
    expect(visibleLanguages.some((language) => language.locale === "mx")).toBe(false);
  });

  it("drives selector data from the same canonical matrix", () => {
    expect(LANGS.map((language) => language.slug)).toEqual(
      visibleLanguages.map((language) => language.locale),
    );
    expect(LANGS.filter((language) => language.available).map((language) => language.slug)).toEqual(["it"]);
  });

  it("contains one capability record for every configured language", () => {
    expect(languageCapabilities).toHaveLength(59);
    expect(new Set(languageCapabilities.map((language) => language.locale)).size).toBe(59);
  });
});
