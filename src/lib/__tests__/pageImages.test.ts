import fs from "node:fs";
import path from "node:path";
import { DEFAULT_IMAGES, PAGE_IMAGES, getPageImages } from "../pageImages";

describe("page carousel assets", () => {
  it("references only versioned local assets that exist with the exact filename case", () => {
    const assets = [...DEFAULT_IMAGES, ...Object.values(PAGE_IMAGES).flat()];
    for (const asset of assets) {
      expect(asset.startsWith("/carousels/")).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), "public", asset))).toBe(true);
    }
  });

  it("uses the three local Invitati slides for every country", () => {
    expect(getPageImages("invitati", "it")).toEqual([
      "/carousels/invitati/01.svg",
      "/carousels/invitati/02.svg",
      "/carousels/invitati/03.svg",
    ]);
    expect(getPageImages("invitati", "mx")).toHaveLength(3);
  });
});
