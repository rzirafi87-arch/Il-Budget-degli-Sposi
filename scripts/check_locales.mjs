import fs from 'fs/promises';
import path from 'path';

async function readConfigLocales() {
  const cfg = await fs.readFile(path.join(process.cwd(), 'src', 'i18n', 'config.ts'), 'utf8');
  const m = cfg.match(/export const locales = \[([^\]]+)\]/s);
  if (!m) return [];
  const inside = m[1];
  const parts = inside.split(',').map(s => s.trim().replace(/['"`]/g, ''));
  return parts.filter(Boolean);
}

async function listMessageFiles() {
  const dir = path.join(process.cwd(), 'src', 'messages');
  const entries = await fs.readdir(dir).catch(() => []);
  return entries.filter(e => e.endsWith('.json'));
}

function localeFromFilename(name) {
  // e.g. dashboard.en.json -> en
  const parts = name.split('.');
  if (parts.length === 2) return parts[0];
  // find last non-json segment
  for (let i = parts.length - 2; i >= 0; i--) {
    const p = parts[i];
    if (p.length <= 5) return p; // heuristic
  }
  return null;
}

async function loadMessagesFor(locale) {
  const dir = path.join(process.cwd(), 'src', 'messages');
  const files = await fs.readdir(dir).catch(() => []);
  const normalized = locale;
  const target = files.filter(f => f === `${normalized}.json` || f.endsWith(`.${normalized}.json`));
  let merged = {};
  for (const f of target.sort()) {
    try {
      const content = await fs.readFile(path.join(dir, f), 'utf8');
      Object.assign(merged, JSON.parse(content));
    } catch (err) {
      throw new Error(`Error parsing ${f}: ${err.message}`);
    }
  }
  return { files: target, keys: Object.keys(merged).length };
}

(async function main(){
  const locales = await readConfigLocales();
  const messageFiles = await listMessageFiles();
  const messageLocalesSet = new Set();
  for (const f of messageFiles) {
    const code = localeFromFilename(f);
    if (code) messageLocalesSet.add(code);
  }
  const messageLocales = [...messageLocalesSet].sort();

  const results = { configLocales: locales, messageLocales, checks: {} };

  for (const loc of locales) {
    try {
      const res = await loadMessagesFor(loc);
      results.checks[loc] = { ok: true, files: res.files, keys: res.keys };
    } catch (err) {
      results.checks[loc] = { ok: false, error: err.message };
    }
  }

  const extra = messageLocales.filter(l => !locales.includes(l));
  const missing = locales.filter(l => !messageLocales.includes(l));
  results.extraMessageLocales = extra;
  results.missingMessageLocales = missing;

  console.log(JSON.stringify(results, null, 2));
})();
