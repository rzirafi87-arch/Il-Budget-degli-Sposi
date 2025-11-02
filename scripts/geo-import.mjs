import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DATASET_PATH = path.join(ROOT, 'scripts', 'datasets', 'geo-full.json');
const TARGET_ROOT = path.join(ROOT, 'public', 'geo');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function log(msg) { console.log(`[geo-import] ${msg}`); }

(async function main() {
  try {
    if (!fs.existsSync(DATASET_PATH)) {
      console.error(`[geo-import] Dataset not found: ${DATASET_PATH}`);
      console.error('[geo-import] See scripts/README-geo.md for the JSON shape.');
      process.exit(1);
    }
    const raw = fs.readFileSync(DATASET_PATH, 'utf8');
    const all = JSON.parse(raw);
    const countriesArg = process.argv.slice(2).filter(Boolean);
    const countries = countriesArg.length ? countriesArg : Object.keys(all);
    let written = 0;
    for (const cc of countries) {
      const regions = all[cc];
      if (!regions) { log(`Skip ${cc}: no data`); continue; }
      const outDir = path.join(TARGET_ROOT, cc);
      ensureDir(outDir);
      for (const [regionName, provinces] of Object.entries(regions)) {
        const out = path.join(outDir, `${regionName}.json`);
        ensureDir(path.dirname(out));
        fs.writeFileSync(out, JSON.stringify(provinces, null, 2), 'utf8');
        written++;
      }
      log(`Imported ${Object.keys(regions).length} regions for ${cc}`);
    }
    log(`Done. Files written: ${written}`);
  } catch (e) {
    console.error('[geo-import] Failed:', e?.message || e);
    process.exit(1);
  }
})();

