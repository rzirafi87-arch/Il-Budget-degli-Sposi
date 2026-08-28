import { generatePublicId } from "@/lib/publicId";

describe("generatePublicId", () => {
  it("generates URL-safe identifiers with at least 128 bits of entropy", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generatePublicId()));

    expect(ids.size).toBe(100);
    for (const id of ids) {
      expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/);
    }
  });
});
