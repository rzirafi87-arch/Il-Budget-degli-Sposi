#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import tty from 'node:tty';
import { Client } from 'pg';

// Load env from .env.local (fall back to .env)
const cwd = process.cwd();
const envLocal = path.join(cwd, '.env.local');
const envDefault = path.join(cwd, '.env');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envDefault)) {
  dotenv.config({ path: envDefault });
}

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

function printUsage() {
  console.log('Usage: npm run sql:exec -- <file.sql> [more.sql ...]');
  console.log('Env:   set SUPABASE_DB_URL in .env.local to your Supabase connection string');
}

async function executeSqlFile(client, filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`SQL file not found: ${filePath}`);
  }
  const sql = fs.readFileSync(abs, 'utf8');
  const start = Date.now();
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
    const ms = Date.now() - start;
    console.log(`✔ Executed ${path.basename(filePath)} in ${ms}ms`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`✖ Failed executing ${path.basename(filePath)}:`);
    console.error(err.message);
    throw err;
  }
}

async function main() {
  const args = process.argv.slice(2).filter(Boolean);
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }
  let url = DB_URL;
  if (!url) {
    console.error('Missing SUPABASE_DB_URL (or DATABASE_URL) in .env.local');
    console.error('Get it from Supabase Dashboard → Project Settings → Database → Connection string');
    process.exit(1);
  }

  // If the URL contains a YOUR_PASSWORD or YOUR_DB_PASSWORD placeholder, prompt interactively (without saving it to disk)
  if (url.includes('YOUR_PASSWORD') || url.includes('YOUR_DB_PASSWORD')) {
    const isTTY = process.stdin.isTTY && process.stdout.isTTY;
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: isTTY });
    let pwd;
    if (isTTY && process.stdout instanceof tty.WriteStream) {
      // Try no-echo prompt
      process.stdout.write('Enter database password: ');
      process.stdin.setRawMode(true);
      process.stdin.resume();
      pwd = '';
      await new Promise((resolve) => {
        process.stdin.on('data', (chunk) => {
          const ch = chunk.toString('utf8');
          if (ch === '\r' || ch === '\n') {
            process.stdout.write('\n');
            process.stdin.setRawMode(false);
            process.stdin.pause();
            resolve();
          } else if (ch === '\u0003') { // Ctrl+C
            process.stdout.write('\n');
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.exit(1);
          } else if (ch === '\u0008' || ch === '\u007f') { // Backspace
            if (pwd.length > 0) pwd = pwd.slice(0, -1);
          } else {
            pwd += ch;
          }
        });
      });
    } else {
      pwd = await rl.question('Enter database password: ');
      rl.close();
    }
    const enc = encodeURIComponent(pwd);
    url = url.replace('YOUR_PASSWORD', enc).replace('YOUR_DB_PASSWORD', enc);
  }

  // Choose SSL settings: disable for localhost/127.0.0.1, enable (no verify) otherwise
  let sslOption = { rejectUnauthorized: false };
  try {
    const u = new URL(url);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      sslOption = false;
    }
  } catch {}

  const client = new Client({
    connectionString: url,
    ssl: sslOption,
    application_name: 'il-budget-degli-sposi-sql-runner',
  });
  try {
    await client.connect();
    for (const f of args) {
      await executeSqlFile(client, f);
    }
    console.log('All done.');
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(() => {
  process.exitCode = 1;
});
