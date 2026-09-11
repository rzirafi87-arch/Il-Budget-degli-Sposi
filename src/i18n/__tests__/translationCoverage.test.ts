import fs from "node:fs";
import path from "node:path";

import { languageCapabilities } from "@/i18n/languageCapabilities";

type Messages = Record<string, unknown>;
const CANDIDATE_LOCALES = ["it", "en", "es", "fr", "de"] as const;
const messagesDir = path.join(process.cwd(), "src", "messages");

function mergeDeep(target: Messages, source: Messages): Messages {
  const result: Messages = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value) && result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
      result[key] = mergeDeep(result[key] as Messages, value as Messages);
    } else result[key] = value;
  }
  return result;
}

function loadLocaleMessages(locale: string): Messages {
  const files = fs.readdirSync(messagesDir).filter((file) => file === `${locale}.json` || file.endsWith(`.${locale}.json`)).sort((a, b) => {
    if (a === `${locale}.json`) return -1;
    if (b === `${locale}.json`) return 1;
    return a.localeCompare(b);
  });
  return files.reduce<Messages>((messages, file) => mergeDeep(messages, JSON.parse(fs.readFileSync(path.join(messagesDir, file), "utf8")) as Messages), {});
}

function flattenMessages(value: unknown, prefix = "", output = new Map<string, unknown>()): Map<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value as Messages)) flattenMessages(child, prefix ? `${prefix}.${key}` : key, output);
  } else if (prefix) output.set(prefix, value);
  return output;
}

function suspiciousItalianResidual(locale: string, key: string, value: unknown, italianValue: unknown) {
  if (locale === "it" || typeof value !== "string" || typeof italianValue !== "string" || value !== italianValue) return false;
  const invariant = new Set(["Budget", "Dashboard", "Timeline", "Location", "Save the Date", "Wedding Planner", "Wedding Bag", "OpenStreetMap", "Wikidata", "SIAE", "DJ", "QR Code", "Email", "URL", "Instagram", "Facebook"]);
  if (invariant.has(value.trim()) || /^[\d\s%€$£.,:+\-–—()/]+$/.test(value) || /^(https?:\/\/|[A-Z0-9_\-.]{2,})$/.test(value.trim())) return false;
  if (key.toLowerCase().includes("brand") || key.toLowerCase().includes("source")) return false;
  return value.trim().split(/\s+/).length >= 2;
}

describe("Branch 46 translation coverage", () => {
  const source = flattenMessages(loadLocaleMessages("it"));
  const sourceKeys = new Set(source.keys());
  const reports = CANDIDATE_LOCALES.map((locale) => {
    const bundle = flattenMessages(loadLocaleMessages(locale));
    const keys = new Set(bundle.keys());
    const capability = languageCapabilities.find((item) => item.locale === locale);
    return {
      locale,
      status: capability?.status ?? "UNKNOWN",
      total: keys.size,
      sourceTotal: sourceKeys.size,
      missing: [...sourceKeys].filter((key) => !keys.has(key)),
      extra: [...keys].filter((key) => !sourceKeys.has(key)),
      empty: [...bundle].filter(([, value]) => typeof value === "string" && value.trim().length === 0).map(([key]) => key),
      residual: [...bundle].filter(([key, value]) => suspiciousItalianResidual(locale, key, value, source.get(key))).map(([key]) => key),
    };
  });

  test("prints the rollout matrix and enforces every READY locale", () => {
    console.table(reports.map((report) => ({ locale: report.locale, status: report.status, total: report.total, sourceTotal: report.sourceTotal, missing: report.missing.length, extra: report.extra.length, empty: report.empty.length, italianResiduals: report.residual.length })));
    for (const report of reports.filter((item) => item.status === "READY")) {
      expect(report.missing).toEqual([]);
      expect(report.extra).toEqual([]);
      expect(report.empty).toEqual([]);
      if (report.locale !== "it") expect(report.residual).toEqual([]);
    }
  });
});
