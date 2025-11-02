#!/usr/bin/env node
/**
 * Converts flat translation keys (with dots) to nested object structure
 * From: { "events.wedding": "..." } 
 * To: { "events": { "wedding": "..." } }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function set(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return obj;
}

function convertFlatToNested(flatObj) {
  const nested = {};
  
  for (const [key, value] of Object.entries(flatObj)) {
    set(nested, key, value);
  }
  
  return nested;
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(content);
  
  const nested = convertFlatToNested(json);
  
  fs.writeFileSync(filePath, JSON.stringify(nested, null, 2) + '\n', 'utf8');
  console.log(`✅ Converted: ${filePath}`);
}

// Process all JSON files in messages directory
const messagesDir = path.join(__dirname, '..', 'src', 'messages');
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

console.log(`Found ${files.length} translation files\n`);

for (const file of files) {
  const filePath = path.join(messagesDir, file);
  try {
    processFile(filePath);
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}

console.log('\n✅ All files processed!');
