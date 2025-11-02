#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.next', '.vercel', '.vscode', 'coverage', 'dist', 'build', 'docs'
]);

const INCLUDED_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css', '.md', '.mdx', '.sql'
]);

const decoder = new TextDecoder('utf-8', { fatal: true });

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.DS_Store')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (INCLUDED_EXTS.has(ext)) out.push(full);
    }
  }
  return out;
}

function checkFile(path) {
  try {
    const buf = readFileSync(path);
    // If this throws, it's not valid UTF-8
    decoder.decode(buf);
    return null;
  } catch (e) {
    return { path, error: e?.message || String(e) };
  }
}

const files = walk(ROOT);
const issues = [];
for (const f of files) {
  const res = checkFile(f);
  if (res) issues.push(res);
}

if (issues.length === 0) {
  console.log('[check-utf8] OK: no invalid UTF-8 bytes found in source files.');
  process.exit(0);
} else {
  console.error(`[check-utf8] Found ${issues.length} file(s) with invalid UTF-8:`);
  for (const i of issues) {
    console.error(' -', i.path);
  }
  if (STRICT) {
    process.exit(1);
  } else {
    console.error('\nRun with --strict to fail the process: npm run check:utf8:strict');
    process.exit(0);
  }
}
