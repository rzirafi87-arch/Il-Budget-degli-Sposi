import fs from "node:fs";
import path from "node:path";
import { getLanguageCapability, languageCapabilities } from "../languageCapabilities";
import { normalizeMessageSchema } from "../normalizeMessageSchema";

type Messages = Record<string, unknown>;
const CANDIDATE_LOCALES = ["it", "en", "es", "fr", "de"] as const;

function mergeDeep(target: Messages, source: Messages): Messages {
  const output = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = mergeDeep(
        output[key] && typeof output[key] === "object" && !Array.isArray(output[key]) ? output[key] as Messages : {},
        value as Messages,
      );
    } else output[key] = value;
  }
  return output;
}

function loadMessages(locale: string): Messages {
  const directory = path.join(process.cwd(), "src", "messages");
  const messages = fs.readdirSync(directory)
    .filter((file) => file === `${locale}.json` || file.endsWith(`.${locale}.json`))
    .sort()
    .reduce((result, file) => mergeDeep(result, JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")) as Messages), {} as Messages);
  return normalizeMessageSchema(messages);
}

function flatten(value: Messages, prefix = "", output: Record<string, unknown> = {}) {
  for (const [key, child] of Object.entries(value)) {
    const nestedKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) flatten(child as Messages, nestedKey, output);
    else output[nestedKey] = child;
  }
  return output;
}

function placeholders(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return Array.from(value.matchAll(/\{([\w]+)(?:,[^}]*)?\}/g), (match) => match[1]).sort();
}

function suspiciousItalianResidual(locale: string, key: string, value: unknown, italianValue: unknown) {
  if (locale === "it" || typeof value !== "string" || typeof italianValue !== "string" || value !== italianValue) return false;
  const invariant = new Set(["Budget", "Dashboard", "Timeline", "Location", "Save the Date", "Wedding Planner", "Wedding Bag", "OpenStreetMap", "Wikidata", "SIAE", "DJ", "QR Code", "Email", "URL", "Instagram", "Facebook"]);
  if (invariant.has(value.trim()) || /^[\d\s%€$£.,:+\-–—()/]+$/.test(value) || /^(https?:\/\/|[A-Z0-9_\-.]{2,})$/.test(value.trim())) return false;
  if (key.toLowerCase().includes("brand") || key.toLowerCase().includes("source")) return false;
  return value.trim().split(/\s+/).length >= 2;
}

describe("translation coverage policy", () => {
  const canonical = flatten(loadMessages("it"));
  const reports = CANDIDATE_LOCALES.map((locale) => {
    const candidate = flatten(loadMessages(locale));
    const canonicalKeys = Object.keys(canonical);
    const candidateKeys = Object.keys(candidate);
    return {
      locale,
      status: getLanguageCapability(locale)?.status ?? "UNKNOWN",
      total: candidateKeys.length,
      sourceTotal: canonicalKeys.length,
      missing: canonicalKeys.filter((key) => !(key in candidate)),
      extra: candidateKeys.filter((key) => !(key in canonical)),
      empty: candidateKeys.filter((key) => typeof candidate[key] === "string" && String(candidate[key]).trim().length === 0),
      placeholderMismatch: canonicalKeys.filter((key) => key in candidate && JSON.stringify(placeholders(canonical[key])) !== JSON.stringify(placeholders(candidate[key]))),
      residual: candidateKeys.filter((key) => suspiciousItalianResidual(locale, key, candidate[key], canonical[key])),
    };
  });

  it("uses a non-empty, nested Italian canonical schema", () => {
    expect(Object.keys(canonical).length).toBeGreaterThan(1_000);
  });

  it("prints the rollout audit matrix", () => {
    console.table(reports.map((report) => ({ locale: report.locale, status: report.status, total: report.total, sourceTotal: report.sourceTotal, missing: report.missing.length, extra: report.extra.length, empty: report.empty.length, placeholderMismatch: report.placeholderMismatch.length, italianResiduals: report.residual.length })));
    for (const report of reports.filter((item) => item.locale !== "it")) {
      console.log(`[i18n-audit:${report.locale}]`, JSON.stringify({ missing: report.missing, extra: report.extra, empty: report.empty, placeholderMismatch: report.placeholderMismatch, italianResiduals: report.residual }, null, 2));
    }
  });

  it.each(languageCapabilities.filter((language) => language.status === "READY"))(
    "$locale READY has complete keys, equivalent placeholders and no audited residuals",
    (language) => {
      const report = reports.find((item) => item.locale === language.locale);
      expect(report).toBeDefined();
      expect(report?.missing).toEqual([]);
      expect(report?.extra).toEqual([]);
      expect(report?.empty).toEqual([]);
      expect(report?.placeholderMismatch).toEqual([]);
      if (language.locale !== "it") expect(report?.residual).toEqual([]);
    },
  );

  it("does not expose an incomplete candidate locale", () => {
    for (const report of reports.filter((item) => item.locale !== "it")) {
      const incomplete = report.missing.length > 0 || report.extra.length > 0 || report.empty.length > 0 || report.placeholderMismatch.length > 0 || report.residual.length > 0;
      if (incomplete) {
        expect(getLanguageCapability(report.locale)?.status).not.toBe("READY");
        expect(getLanguageCapability(report.locale)?.selectable).toBe(false);
      }
    }
  });
});
