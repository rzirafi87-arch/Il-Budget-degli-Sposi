import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("Branch 53.0 product truth guardrail", () => {
  it("fails closed for contact until the real support queue exists", () => {
    const source = read("src/app/api/contact/route.ts");
    expect(source).toContain("CONTACT_UNAVAILABLE");
    expect(source).toContain("status: 503");
    expect(source).not.toContain("demo: true");
    expect(source).not.toContain('from("contact_messages")');
  });

  it("removes anonymous gift-list demo behavior", () => {
    const source = read("src/app/api/my/gift-list/route.ts");
    expect(source.match(/requireEventAccess\(req, "owner-or-partner"\)/g)).toHaveLength(4);
    expect(source).toContain('.from("gift_list_items")');
    expect(source).not.toContain('.from("gift_list")');
    expect(source).not.toContain("Demo-first");
    expect(source).not.toContain("demo-");
  });

  it("does not return demo tables to anonymous users", () => {
    const source = read("src/app/api/my/tables/route.ts");
    expect(source.match(/requireEventAccess\(req, "owner-or-partner"\)/g)).toHaveLength(3);
    expect(source).not.toContain("Demo mode");
  });

  it("does not regress to client-only document persistence", () => {
    const source = read("src/app/[locale]/(routes)/documenti/page.tsx");
    expect(source).toContain('fetch("/api/my/documents"');
    expect(source).not.toContain("URL.createObjectURL(file)");
    expect(source).not.toContain("Simulazione upload");
    expect(source).not.toContain("SUPABASE_SERVICE_ROLE");
  });

  it("disables video generation until it exists", () => {
    const source = read("src/app/[locale]/(routes)/save-the-date/page.tsx");
    expect(source).toContain('title={t("videoComingSoon")}');
    expect(source).not.toContain("handleGenerateVideo");
  });

  it("keeps the versioned inventory explicit", () => {
    const source = read("docs/branch-53-product-truth-inventory.md");
    for (const item of ["Documenti", "Lista nozze", "Tavoli", "Save the Date video", "Contatto pubblico"]) {
      expect(source).toContain(item);
    }
  });
});
