import {
  EVENT_TYPE_CAPABILITIES,
  getEventTypeCapability,
  isEventTypeReady,
  isModuleEnabled,
  moduleForPath,
  normalizeEventType,
} from "@/lib/eventTypeCapabilities";

describe("event type capabilities", () => {
  it("keeps wedding fully READY", () => {
    const wedding = getEventTypeCapability("wedding");
    expect(wedding.availabilityStatus).toBe("READY");
    expect(wedding.churchModule).toBe(true);
    expect(wedding.ceremonyMode).toBe("religious_or_civil");
    expect(wedding.locationRoles).toEqual(
      expect.arrayContaining(["ceremony", "reception", "accommodation", "after_party"])
    );
    expect(isModuleEnabled("wedding", "churches")).toBe(true);
    expect(isModuleEnabled("wedding", "location-ceremony")).toBe(true);
    expect(isModuleEnabled("wedding", "budget")).toBe(true);
    expect(isModuleEnabled("wedding", "timeline")).toBe(true);
  });

  it("classifies eighteenth as COMING_SOON without wedding leakage", () => {
    const eighteenth = getEventTypeCapability("eighteenth");
    expect(eighteenth.availabilityStatus).toBe("COMING_SOON");
    expect(eighteenth.enabledModules).toEqual([]);
    expect(eighteenth.churchModule).toBe(false);
    expect(eighteenth.ceremonyMode).toBe("not_configured");
    expect(eighteenth.budgetTemplate).toBeNull();
    expect(eighteenth.timelineTemplate).toBeNull();
    expect(eighteenth.supplierCategories).toEqual([]);
    expect(isModuleEnabled("eighteenth", "churches")).toBe(false);
    expect(isModuleEnabled("eighteenth", "location-ceremony")).toBe(false);
    expect(isModuleEnabled("eighteenth", "budget")).toBe(false);
  });

  it("normalizes legacy aliases found in production", () => {
    expect(normalizeEventType("WEDDING")).toBe("wedding");
    expect(normalizeEventType("genderreveal")).toBe("gender-reveal");
    expect(normalizeEventType("GENDER_REVEAL")).toBe("gender-reveal");
    expect(normalizeEventType("babyshower")).toBe("baby-shower");
    expect(normalizeEventType("engagement")).toBe("engagement-party");
  });

  it("maps sensitive routes to capabilities", () => {
    expect(moduleForPath("/chiese")).toBe("churches");
    expect(moduleForPath("/cerimonia/chiesa")).toBe("location-ceremony");
    expect(moduleForPath("/location")).toBe("location-reception");
    expect(moduleForPath("/fornitori")).toBe("suppliers");
    expect(moduleForPath("/budget")).toBe("budget");
    expect(moduleForPath("/timeline")).toBe("timeline");
    expect(moduleForPath("/documenti")).toBe("documents");
  });

  it("does not expose untranslated MISSING_MESSAGE content in new capability copy", () => {
    for (const capability of Object.values(EVENT_TYPE_CAPABILITIES)) {
      for (const locale of ["it", "en", "es"] as const) {
        expect(capability.description[locale]).toBeTruthy();
        expect(capability.description[locale]).not.toContain("MISSING_MESSAGE");
      }
    }
  });

  it("marks every non-wedding type as not ready", () => {
    for (const [slug, capability] of Object.entries(EVENT_TYPE_CAPABILITIES)) {
      if (slug === "wedding") continue;
      expect(capability.availabilityStatus).toBe("COMING_SOON");
      expect(isEventTypeReady(slug)).toBe(false);
      expect(capability.enabledModules).toEqual([]);
    }
  });
});
