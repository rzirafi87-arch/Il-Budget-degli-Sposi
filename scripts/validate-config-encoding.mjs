#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const CONFIG_DIR = join(process.cwd(), 'src', 'data', 'config');
const ALLOWED_CTRL = new Set(['\n', '\r', '\t']);

function listJsonFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      listJsonFiles(full, acc);
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.json') {
      acc.push(full);
    }
  }
  return acc;
}

function hasBOM(buf) {
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

function findControlChars(str) {
  const issues = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = ch.charCodeAt(0);
    const isCtrl = (code >= 0x00 && code <= 0x1f) || code === 0x7f;
    if (isCtrl && !ALLOWED_CTRL.has(ch)) {
      issues.push({ index: i, code });
    }
  }
  return issues;
}

function validateJsonShape(file, data) {
  // best-effort checks for known files
  const name = file.toLowerCase();
  const errors = [];
  if (name.endsWith('languages.json') && Array.isArray(data)) {
    for (const [idx, item] of data.entries()) {
      if (!item.slug || !item.label) errors.push(`languages[${idx}] missing slug/label`);
      if (typeof item.emoji !== 'string' || item.emoji.length === 0) errors.push(`languages[${idx}] invalid emoji`);
    }
  }
  if (name.endsWith('events.json') && Array.isArray(data)) {
    for (const [idx, item] of data.entries()) {
      if (!item.slug || !item.label) errors.push(`events[${idx}] missing slug/label`);
      if (typeof item.emoji !== 'string' || item.emoji.length === 0) errors.push(`events[${idx}] invalid emoji`);
    }
  }
  return errors;
}

const files = listJsonFiles(CONFIG_DIR);
let errorCount = 0;

for (const file of files) {
  const buf = readFileSync(file);
  const hadBOM = hasBOM(buf);
  const text = buf.toString('utf8');

  const problems = [];
  if (hadBOM) problems.push('BOM present');

  if (text.includes('\uFFFD') || text.includes('�')) {
    problems.push('Replacement character U+FFFD found (mojibake likely)');
  }

  const ctrls = findControlChars(text);
  if (ctrls.length > 0) problems.push(`Unexpected control chars: ${ctrls.map(c => '0x' + c.code.toString(16)).join(', ')}`);

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    problems.push('Invalid JSON: ' + (e?.message || String(e)));
  }

  if (parsed) {
    const shapeErrors = validateJsonShape(file, parsed);
    problems.push(...shapeErrors);
  }

  if (problems.length > 0) {
    errorCount += problems.length;
    console.error(`[config-encoding] ${file}`);
    for (const p of problems) console.error('  -', p);
  } else {
    console.log(`[config-encoding] OK ${file}`);
  }
}

if (errorCount > 0) {
  console.error(`\n[config-encoding] FAILED with ${errorCount} issue(s).`);
  process.exit(1);
} else {
  console.log('\n[config-encoding] All config JSON files look good.');
}
