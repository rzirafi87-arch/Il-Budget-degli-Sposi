import { hasValidMapCoordinates } from "../CatalogMap";

describe("CatalogMap coordinate guard", () => {
  it.each([
    [{ latitude: 41.9, longitude: 12.5 }, true],
    [{ latitude: null, longitude: 12.5 }, false],
    [{ latitude: 41.9, longitude: null }, false],
    [{ latitude: 0, longitude: 0 }, false],
    [{ latitude: 91, longitude: 12.5 }, false],
    [{ latitude: 41.9, longitude: 181 }, false],
    [{ latitude: Number.NaN, longitude: 12.5 }, false],
  ])("validates %o", (coordinates, expected) => {
    expect(hasValidMapCoordinates(coordinates)).toBe(expected);
  });
});
