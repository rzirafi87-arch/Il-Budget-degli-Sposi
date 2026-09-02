import fs from "node:fs";
import path from "node:path";
import { getLanguageCapability, languageCapabilities } from "../languageCapabilities";

type Messages = Record<string, unknown>;

function mergeDeep(target: Messages, source: Messages): Messages {
  const output = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = mergeDeep(
        output[key] && typeof output[key] === "object" && !Array.isArray(output[key])
          ? output[key] as Messages
          : {},
        value as Messages,
      );
    } else output[key] = value;
  }
  return output;
}

function loadMessages(locale: string): Messages {
  const directory = path.join(process.cwd(), "src", "messages");
  return fs.readdirSync(directory)
    .filter((file) => file === `${locale}.json` || file.endsWith(`.${locale}.json`))
    .sort()
    .reduce((messages, file) => mergeDeep(
      messages,
      JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")) as Messages,
    ), {} as Messages);
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

describe("translation coverage policy", () => {
  const canonical = flatten(loadMessages("it"));

  it("uses a non-empty, nested Italian canonical schema", () => {
    expect(Object.keys(canonical).length).toBeGreaterThan(1_000);
  });

  it.each(languageCapabilities.filter((language) => language.status === "READY"))(
    "$locale READY has canonical keys and equivalent placeholders",
    (language) => {
      const candidate = flatten(loadMessages(language.locale));
      const missing = Object.keys(canonical).filter((key) => !(key in candidate));
      const mismatchedPlaceholders = Object.keys(canonical).filter((key) =>
        key in candidate && JSON.stringify(placeholders(canonical[key])) !== JSON.stringify(placeholders(candidate[key])),
      );
      expect(missing).toEqual([]);
      expect(mismatchedPlaceholders).toEqual([]);
    },
  );

  it("keeps EN and ES unavailable while their audited canonical gaps remain", () => {
    for (const locale of ["en", "es"]) {
      const candidate = flatten(loadMessages(locale));
      const missing = Object.keys(canonical).filter((key) => !(key in candidate));
      expect(missing.length).toBeGreaterThan(0);
      expect(getLanguageCapability(locale)?.status).toBe("COMING_SOON");
      expect(getLanguageCapability(locale)?.selectable).toBe(false);
    }
  });
});

