import { defaultLocale, locales, type Locale } from "./config";
import path from "node:path";
import fs from "node:fs/promises";

type Messages = Record<string, unknown>;

function mergeDeep(target: Messages, source: Messages): Messages {
  const result: Messages = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const existing = result[key];
      result[key] = mergeDeep(
        existing && typeof existing === "object" && !Array.isArray(existing) ? (existing as Messages) : {},
        value as Messages,
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function readJson(filePath: string): Promise<Messages> {
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data) as Messages;
}

export async function getMessages(locale: string): Promise<Messages> {
  const normalizedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const messagesDir = path.join(process.cwd(), "src", "messages");
  const entries = await fs.readdir(messagesDir);
  const baseFiles: string[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    if (entry.endsWith(".json.bak") || entry.endsWith(".json.backup")) continue;
    if (entry === `${normalizedLocale}.json` || entry.endsWith(`.${normalizedLocale}.json`)) {
      baseFiles.push(path.join(messagesDir, entry));
    }
  }
  baseFiles.sort((a, b) => a.localeCompare(b));

  let messages: Messages = {};
  for (const file of baseFiles) {
    try {
      const data = await readJson(file);
      messages = mergeDeep(messages, data);
    } catch (error) {
      console.error(`Unable to load messages from ${file}`, error);
    }
  }

  if (Object.keys(messages).length === 0 && normalizedLocale !== defaultLocale) {
    return getMessages(defaultLocale);
  }

  return messages;
}
