import { buildLocalizedPath } from "@/lib/localizedPath";

describe("buildLocalizedPath", () => {
  it.each([undefined, null, "", "undefined"])(
    "uses the Italian fallback for a missing locale (%s)",
    (locale) => {
      const path = buildLocalizedPath(locale, "/wizard");

      expect(path).toBe("/it/wizard");
      expect(path).not.toContain("undefined");
    },
  );

  it("removes missing path segments", () => {
    expect(buildLocalizedPath("it", "/undefined/wizard")).toBe("/it/wizard");
  });
});
