import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const runtimeFiles = [
  "src/app/[locale]/(routes)/fornitori/page.tsx",
  "src/app/[locale]/(routes)/fornitori/[id]/page.tsx",
  "src/app/[locale]/(routes)/location/page.tsx",
  "src/app/[locale]/(routes)/chiese/page.tsx",
  "src/app/[locale]/(routes)/preferiti/page.tsx",
  "src/components/catalog/CatalogMap.tsx",
  "src/components/catalog/CatalogMapCanvas.tsx",
  "src/components/catalog/ContributionPanel.tsx",
  "src/components/catalog/NearMeButton.tsx",
  "src/hooks/useFavorites.ts",
];

describe("Milestone 8 catalog localization", () => {
  it("has no scanner-detected translatable Italian in catalog presentation files", () => {
    const report = JSON.parse(execFileSync(process.execPath, ["scripts/check-italian-runtime.mjs", "--json"], { cwd: root, encoding: "utf8" }));
    const files = new Set(runtimeFiles);
    const findings = report.findings.filter((finding: { file: string }) => files.has(finding.file));
    expect(findings).toEqual([]);
  });

  it.each(["it", "en", "es", "fr", "de"])("provides complete catalog messages for %s", (locale) => {
    const messages = JSON.parse(read(`src/messages/milestone8.${locale}.json`)).milestone8;
    expect(messages.suppliers.searchPlaceholder).toBeTruthy();
    expect(messages.supplierProfile.photoAlt).toContain("{name}");
    expect(messages.favorites.savedOn).toContain("{date}");
    expect(messages.favoriteActions.added).toContain("{name}");
    expect(messages.map.results).toBeTruthy();
  });

  it("keeps canonical category values and user queries unchanged", () => {
    const source = read("src/app/[locale]/(routes)/fornitori/page.tsx");
    expect(source).toContain('value={category}');
    expect(source).toContain('if(q)p.set("q",q)');
    expect(source).toContain('value={c}');
  });
});
