import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const locales = ["it", "en", "es", "fr", "de"];

describe("Milestone 7 runtime localization", () => {
  test("documents uses translated presentation strings and preserves filenames", () => {
    const source = read("src/app/[locale]/(routes)/documenti/page.tsx");
    expect(source).toContain('useTranslations("milestone7.documents")');
    expect(source).toContain("name: file.name");
    expect(source).toContain("{doc.name}");
    for (const locale of locales) {
      const messages = JSON.parse(read(`src/messages/milestone7.${locale}.json`));
      expect(messages.milestone7.documents.categories.generic).toBeTruthy();
      expect(messages.milestone7.documents.confirmDelete).toBeTruthy();
    }
  });

  test("Save the Date localizes form states while preserving custom content", () => {
    const source = read("src/app/[locale]/(routes)/save-the-date/page.tsx");
    expect(source).toContain('useTranslations("milestone7.saveTheDate")');
    expect(source).toContain("message: config.custom_message");
    for (const locale of locales) {
      const messages = JSON.parse(read(`src/messages/milestone7-save.${locale}.json`));
      expect(messages.milestone7.saveTheDate.generatePdf).toBeTruthy();
      expect(messages.milestone7.saveTheDate.videoPreview).toBeTruthy();
    }
  });

  test("timeline and appointments use localized UI and stable validation codes", () => {
    expect(read("src/app/[locale]/(routes)/timeline/page.tsx")).toContain('useTranslations("milestone7.timeline")');
    expect(read("src/app/[locale]/(routes)/documenti/appuntamenti/page.tsx")).toContain('useTranslations("milestone7.appointments")');
    expect(read("src/app/api/my/appointments/route.ts")).toContain('code: "APPOINTMENT_REQUIRED_FIELDS"');
    for (const locale of locales) {
      const messages = JSON.parse(read(`src/messages/milestone7-flow.${locale}.json`));
      expect(messages.milestone7.timeline.loading).toBeTruthy();
      expect(messages.milestone7.appointments.validation).toBeTruthy();
    }
  });
});
